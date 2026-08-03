// ============ CẤU HÌNH ============
const DATA_URL = "data/hai-duong-2025.json";
const NGUONG_VUA_DU = 1.0; // lệch trong khoảng này => xếp vào nhóm "vừa đủ"

// ============ STATE ============
let DATA = null;

// ============ DOM ============
const $ = (id) => document.getElementById(id);

const form = $("score-form");
const loaiTruongEl = $("loai-truong");
const monChuyenWrap = $("wrap-mon-chuyen");
const monChuyenEl = $("mon-chuyen");
const diemChuyenWrap = $("wrap-diem-chuyen");
const labelMon3 = $("label-mon3");
const uuTienEl = $("uu-tien");
const khuyenKhichEl = $("khuyen-khich");
const khuVucEl = $("khu-vuc");
const congThucHint = $("cong-thuc-hint");

const scoreInputs = ["diem-toan", "diem-van", "diem-mon3", "diem-chuyen"];

const resultsEl = $("results");
const emptyHint = $("empty-hint");
const scoreNumberEl = $("score-number");
const stampWrap = $("stamp-wrap");

init();

async function init() {
  try {
    const res = await fetch(DATA_URL);
    DATA = await res.json();
  } catch (err) {
    emptyHint.textContent = "Không tải được dữ liệu điểm chuẩn (data/hai-duong-2025.json). Kiểm tra lại đường dẫn file.";
    console.error(err);
    return;
  }

  $("nam-hoc").textContent = DATA.namHoc || "";
  $("nguon-du-lieu").textContent = DATA.nguon || "Sở GD&ĐT";

  fillSelect(uuTienEl, DATA.congThuc.uuTien, (o) => o.nhom, (o) => `${o.ten} (+${o.diem})`);
  fillSelect(khuyenKhichEl, DATA.congThuc.khuyenKhich, (o) => o.giai, (o) => `${o.ten} (+${o.diem})`);
  fillSelect(monChuyenEl, DATA.lopChuyen.monHoc, (o) => o.ten, (o) => o.ten);

  const khuVucSet = new Set();
  DATA.truongCongLap.forEach((t) => t.khuVuc && khuVucSet.add(t.khuVuc));
  if (DATA.lopChuyen.khuVuc) khuVucSet.add(DATA.lopChuyen.khuVuc);
  [...khuVucSet].sort().forEach((kv) => {
    const opt = document.createElement("option");
    opt.value = kv;
    opt.textContent = kv;
    khuVucEl.appendChild(opt);
  });

  loaiTruongEl.addEventListener("change", onLoaiTruongChange);
  form.addEventListener("submit", onSubmit);
  scoreInputs.forEach((id) => {
    const el = $(id);
    el.addEventListener("input", () => validateScoreField(id));
    khoaGoBanPhim(el);
  });
  onLoaiTruongChange();
}

// Chỉ cho phép chỉnh điểm bằng mũi tên (nút mũi tên trên ô hoặc phím ArrowUp/ArrowDown),
// chặn mọi thao tác gõ số/dán trực tiếp bằng bàn phím.
const PHIM_DUOC_PHEP = [
  "ArrowUp", "ArrowDown", "Tab", "Shift", "Control", "Alt", "Meta", "Escape",
];
function khoaGoBanPhim(input) {
  input.setAttribute("inputmode", "none"); // hạn chế bàn phím ảo bật lên trên di động
  input.addEventListener("keydown", (e) => {
    // vẫn cho phép tổ hợp phím hệ thống như Ctrl+C, Ctrl+Tab...
    if (e.ctrlKey || e.metaKey) return;
    if (!PHIM_DUOC_PHEP.includes(e.key)) e.preventDefault();
  });
  input.addEventListener("paste", (e) => e.preventDefault());
  input.addEventListener("drop", (e) => e.preventDefault());
  input.addEventListener("wheel", (e) => {
    if (document.activeElement === input) e.preventDefault();
  }, { passive: false });
}

// Điểm bài thi ở Việt Nam chỉ nằm trong khoảng 0–10.
// Không tự động sửa giá trị — chỉ báo lỗi rõ ràng và chặn tính điểm cho đến khi sửa đúng.
function validateScoreField(id) {
  const input = $(id);
  const errEl = $(`err-${id}`);
  const raw = input.value.trim();

  if (raw === "") {
    setFieldError(input, errEl, "");
    return true; // để trống thì báo riêng ở bước submit, không báo "không hợp lệ" khi đang gõ dở
  }

  const val = parseFloat(raw);

  if (Number.isNaN(val)) {
    setFieldError(input, errEl, "Điểm không hợp lệ.");
    return false;
  }
  if (val > 10 || val < 0) {
    setFieldError(input, errEl, "Điểm không hợp lệ (chỉ 0–10).");
    return false;
  }

  setFieldError(input, errEl, "");
  return true;
}

function setFieldError(input, errEl, message) {
  errEl.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setCustomValidity(message);
}

function fillSelect(selectEl, items, valueFn, labelFn) {
  selectEl.innerHTML = "";
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = valueFn(item);
    opt.textContent = labelFn(item);
    selectEl.appendChild(opt);
  });
}

function onLoaiTruongChange() {
  const isChuyen = loaiTruongEl.value === "chuyen";
  monChuyenWrap.hidden = !isChuyen;
  diemChuyenWrap.hidden = !isChuyen;
  labelMon3.textContent = isChuyen ? "Tiếng Anh" : "Môn thứ ba";
  congThucHint.textContent = isChuyen
    ? "ĐXT = Toán + Văn + Tiếng Anh + 3 × Điểm môn chuyên · Dùng mũi tên (↑ ↓ hoặc nút bên phải ô) để nhập điểm"
    : "ĐXT = Toán + Văn + Môn thứ ba + điểm ưu tiên + điểm khuyến khích · Dùng mũi tên (↑ ↓ hoặc nút bên phải ô) để nhập điểm";
}

function onSubmit(e) {
  e.preventDefault();

  const submitErrorEl = $("submit-error");
  const isChuyen = loaiTruongEl.value === "chuyen";
  const idsCanKiemTra = isChuyen
    ? ["diem-toan", "diem-van", "diem-mon3", "diem-chuyen"]
    : ["diem-toan", "diem-van", "diem-mon3"];

  let hopLe = true;
  let oLoiDauTien = null;
  idsCanKiemTra.forEach((id) => {
    const ok = validateScoreField(id);
    const trong = $(id).value.trim() === "";
    if (!ok || trong) {
      if (trong) setFieldError($(id), $(`err-${id}`), "Chưa nhập điểm.");
      hopLe = false;
      if (!oLoiDauTien) oLoiDauTien = $(id);
    }
  });

  submitErrorEl.hidden = hopLe;
  if (!hopLe) {
    oLoiDauTien.focus();
    return;
  }

  const toan = parseFloat($("diem-toan").value);
  const van = parseFloat($("diem-van").value);
  const mon3 = parseFloat($("diem-mon3").value);

  let tong, ket, danhSach, isFail = false;

  if (isChuyen) {
    const diemChuyen = parseFloat($("diem-chuyen").value);
    tong = toan + van + mon3 + 3 * diemChuyen;
    const monHoc = DATA.lopChuyen.monHoc.find((m) => m.ten === monChuyenEl.value);
    danhSach = [{
      ten: `${DATA.lopChuyen.ten} — ${monHoc.ten}`,
      khuVuc: DATA.lopChuyen.khuVuc,
      chuan: monHoc.diemChuan,
      nv: null,
    }];
  } else {
    const uuTienObj = DATA.congThuc.uuTien.find((o) => String(o.nhom) === uuTienEl.value);
    const khuyenKhichObj = DATA.congThuc.khuyenKhich.find((o) => o.giai === khuyenKhichEl.value);
    const congThem = (uuTienObj?.diem || 0) + (khuyenKhichObj?.diem || 0);
    tong = toan + van + mon3 + congThem;
    isFail = [toan, van, mon3].some((v) => v <= 1.0);

    const khuVucFilter = khuVucEl.value;
    const truongLoc = DATA.truongCongLap.filter((t) => !khuVucFilter || t.khuVuc === khuVucFilter);

    danhSach = [];
    truongLoc.forEach((t) => {
      danhSach.push({ ten: t.ten, khuVuc: t.khuVuc, chuan: t.nv1, nv: "NV1" });
      if (t.nv2 != null) danhSach.push({ ten: t.ten, khuVuc: t.khuVuc, chuan: t.nv2, nv: "NV2" });
    });
  }

  renderResults(tong, danhSach, isFail);
}

function renderResults(tong, danhSach, isFail) {
  resultsEl.hidden = false;
  emptyHint.hidden = true;
  scoreNumberEl.textContent = tong.toFixed(2);

  const nhomDu = [], nhomVua = [], nhomThieu = [];

  danhSach.forEach((s) => {
    const lech = isFail ? -999 : tong - s.chuan;
    const row = { ...s, lech };
    if (isFail || lech < -NGUONG_VUA_DU) nhomThieu.push(row);
    else if (lech <= NGUONG_VUA_DU) nhomVua.push(row);
    else nhomDu.push(row);
  });

  nhomDu.sort((a, b) => a.lech - b.lech);
  nhomVua.sort((a, b) => b.lech - a.lech);
  nhomThieu.sort((a, b) => b.lech - a.lech);

  renderList("list-du", nhomDu, "Chưa có trường nào đủ điểm trong khu vực đã chọn.");
  renderList("list-vua", nhomVua, "Không có trường nào ở mức vừa đủ.");
  renderList("list-thieu", nhomThieu, "Không có trường nào bị thiếu điểm — chúc mừng!");

  renderStamp(nhomDu.length, nhomVua.length, isFail);

  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderList(containerId, items, emptyText) {
  const el = $(containerId);
  el.innerHTML = "";
  if (items.length === 0) {
    const p = document.createElement("p");
    p.className = "tier-empty";
    p.textContent = emptyText;
    el.appendChild(p);
    return;
  }
  items.forEach((s) => {
    const row = document.createElement("div");
    row.className = "school-row";
    const dau = s.lech > 0 ? "+" : "";
    row.innerHTML = `
      <div>
        <div class="school-name">${escapeHtml(s.ten)}</div>
        <div class="school-meta">${escapeHtml(s.khuVuc || "")}${s.nv ? " · " + s.nv : ""} · Điểm chuẩn ${s.chuan.toFixed(2)}</div>
      </div>
      <div class="school-diff">${s.lech === -999 ? "Rớt điều kiện" : dau + s.lech.toFixed(2)}</div>
    `;
    el.appendChild(row);
  });
}

function renderStamp(soDu, soVua, isFail) {
  let color, text;
  if (isFail || soDu === 0) { color = "var(--fail)"; text = "CẦN XEM LẠI"; }
  else if (soVua > soDu) { color = "var(--warn)"; text = "CÂN NÃO"; }
  else { color = "var(--pass)"; text = "CÓ CỬA"; }

  stampWrap.innerHTML = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="none" stroke="${color}" stroke-width="3"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="${color}" stroke-width="1.5"/>
      <text x="50" y="47" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-weight="700" font-size="11.5" fill="${color}">${text}</text>
      <text x="50" y="63" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-weight="600" font-size="7" fill="${color}" letter-spacing="1">SỞ GD&amp;ĐT</text>
    </svg>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
