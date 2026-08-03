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
    el.addEventListener("input", () => clearFieldError(id)); // xóa lỗi cũ khi đang gõ lại
    el.addEventListener("blur", () => checkScoreOnBlur(id));
  });
  onLoaiTruongChange();
}

// ============ VALIDATE ĐIỂM (0–10, chỉ chấp nhận số) ============
// Kiểm tra khi người dùng rời khỏi ô (blur) — không chặn giữa lúc đang gõ dở,
// để không làm phiền khi họ đang gõ số thập phân như "8.5".
function checkScoreOnBlur(id) {
  const input = $(id);
  const raw = input.value.trim();
  if (raw === "") { clearFieldError(id); return; }

  if (!isDiemHopLe(raw)) {
    input.value = "";
    setFieldError(input, $(`err-${id}`), "Điểm không hợp lệ.");
    showModal("Ký tự không hợp lệ", "Điểm chỉ được nhập số từ 0 đến 10 (có thể có phần thập phân). Vui lòng nhập lại.", input);
  } else {
    clearFieldError(id);
  }
}

// Số hợp lệ: chỉ gồm chữ số và tối đa 1 dấu chấm thập phân, nằm trong khoảng 0–10.
function isDiemHopLe(raw) {
  if (!/^\d+(\.\d+)?$/.test(raw)) return false;
  const val = parseFloat(raw);
  return val >= 0 && val <= 10;
}

function clearFieldError(id) {
  const input = $(id);
  setFieldError(input, $(`err-${id}`), "");
}

// Điểm bài thi ở Việt Nam chỉ nằm trong khoảng 0–10.
function validateScoreField(id) {
  const input = $(id);
  const errEl = $(`err-${id}`);
  const raw = input.value.trim();

  if (raw === "") {
    setFieldError(input, errEl, "");
    return true; // để trống thì báo riêng ở bước submit
  }
  if (!isDiemHopLe(raw)) {
    setFieldError(input, errEl, "Điểm không hợp lệ.");
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

// ============ MODAL THÔNG BÁO LỖI ============
const modalOverlay = $("modal-overlay");
const modalTitle = $("modal-title");
const modalMsg = $("modal-msg");
const modalClose = $("modal-close");
let modalFocusTarget = null;

function showModal(title, message, focusTarget) {
  modalTitle.textContent = title;
  modalMsg.textContent = message;
  modalFocusTarget = focusTarget || null;
  modalOverlay.hidden = false;
  modalClose.focus();
}

function hideModal() {
  modalOverlay.hidden = true;
  if (modalFocusTarget) modalFocusTarget.focus();
  modalFocusTarget = null;
}

modalClose.addEventListener("click", hideModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) hideModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) hideModal();
});

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
    ? "ĐXT = Toán + Văn + Tiếng Anh + 3 × Điểm môn chuyên"
    : "ĐXT = Toán + Văn + Môn thứ ba + điểm ưu tiên + điểm khuyến khích";
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
    const oTrong = oLoiDauTien.value.trim() === "";
    if (!oTrong) {
      showModal("Ký tự không hợp lệ", "Điểm chỉ được nhập số từ 0 đến 10 (có thể có phần thập phân). Vui lòng nhập lại.", oLoiDauTien);
    } else {
      oLoiDauTien.focus();
    }
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
