// ============ CẤU HÌNH ============
const MANIFEST_URL = "data/manifest.json";
const NGUONG_VUA_DU = 1.0; // lệch trong khoảng này => xếp vào nhóm "vừa đủ"

// ============ STATE ============
let MANIFEST = null; // danh mục các tỉnh có sẵn dữ liệu
let DATA = null;      // dữ liệu của tỉnh đang được chọn

// ============ DOM ============
const $ = (id) => document.getElementById(id);

const form = $("score-form");
const tinhThanhEl = $("tinh-thanh");
const loaiTruongEl = $("loai-truong");
const monChuyenWrap = $("wrap-mon-chuyen");
const monChuyenEl = $("mon-chuyen");
const diemChuyenWrap = $("wrap-diem-chuyen");
const labelDiemChuyen = $("label-diem-chuyen");
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
    const res = await fetch(MANIFEST_URL);
    MANIFEST = await res.json();
  } catch (err) {
    emptyHint.hidden = false;
    emptyHint.textContent = "Không tải được danh mục tỉnh/thành (data/manifest.json). Kiểm tra lại đường dẫn file.";
    console.error(err);
    return;
  }

  fillSelect(tinhThanhEl, MANIFEST.tinhThanh, (t) => t.ma, (t) => t.ten);
  tinhThanhEl.addEventListener("change", () => loadTinh(tinhThanhEl.value));

  loaiTruongEl.addEventListener("change", onLoaiTruongChange);
  form.addEventListener("submit", onSubmit);
  scoreInputs.forEach((id) => {
    const el = $(id);
    el.addEventListener("input", () => clearFieldError(id)); // xóa lỗi cũ khi đang gõ lại
    el.addEventListener("blur", () => checkScoreOnBlur(id));
  });

  // Mặc định load tỉnh đầu tiên trong danh mục
  if (MANIFEST.tinhThanh?.length) await loadTinh(MANIFEST.tinhThanh[0].ma);
}

// Tải dữ liệu của 1 tỉnh cụ thể (điểm chuẩn, công thức, danh sách trường...)
// và làm mới lại các dropdown phụ thuộc (ưu tiên, khuyến khích, môn chuyên, khu vực).
async function loadTinh(ma) {
  const tinh = MANIFEST.tinhThanh.find((t) => t.ma === ma);
  if (!tinh) return;

  try {
    const res = await fetch(tinh.file);
    DATA = await res.json();
  } catch (err) {
    emptyHint.hidden = false;
    emptyHint.textContent = `Không tải được dữ liệu điểm chuẩn của ${tinh.ten} (${tinh.file}). Kiểm tra lại đường dẫn file.`;
    console.error(err);
    return;
  }

  $("nam-hoc").textContent = DATA.namHoc || "";
  $("nguon-du-lieu").textContent = DATA.nguon || "Sở GD&ĐT";

  fillSelect(uuTienEl, DATA.congThuc.uuTien, (o) => o.nhom, (o) => `${o.ten} (+${o.diem})`);
  fillSelect(khuyenKhichEl, DATA.congThuc.khuyenKhich, (o) => o.giai, (o) => `${o.ten} (+${o.diem})`);

  // Môn chuyên: gộp tất cả các môn có ở bất kỳ trường chuyên nào trong tỉnh, bỏ trùng.
  const monChuyenSet = new Set();
  (DATA.truongChuyen || []).forEach((tr) => tr.monHoc.forEach((m) => monChuyenSet.add(m.ten)));
  fillSelect(monChuyenEl, [...monChuyenSet].sort(), (m) => m, (m) => m);

  khuVucEl.innerHTML = '<option value="">Tất cả khu vực trong tỉnh</option>';
  const khuVucSet = new Set();
  DATA.truongCongLap.forEach((t) => t.khuVuc && khuVucSet.add(t.khuVuc));
  (DATA.truongChuyen || []).forEach((t) => t.khuVuc && khuVucSet.add(t.khuVuc));
  [...khuVucSet].sort().forEach((kv) => {
    const opt = document.createElement("option");
    opt.value = kv;
    opt.textContent = kv;
    khuVucEl.appendChild(opt);
  });

  onLoaiTruongChange();

  // Đổi tỉnh thì kết quả cũ (nếu có) không còn đúng nữa — ẩn đi, chờ tính lại.
  resultsEl.hidden = true;
  emptyHint.hidden = false;
  emptyHint.textContent = `Đã chuyển sang dữ liệu ${tinh.ten}. Điền điểm rồi bấm "Tính điểm" để xem kết quả nhé.`;
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
  const loai = loaiTruongEl.value; // "conglap" | "chuyen"
  monChuyenWrap.hidden = loai !== "chuyen";
  diemChuyenWrap.hidden = loai !== "chuyen";
  labelMon3.textContent = loai === "conglap" ? "Môn thứ ba" : "Ngoại ngữ";

  if (!DATA) return;

  if (loai === "chuyen") {
    const heSo = DATA.congThuc.chuyen?.heSoMonChuyen ?? 2;
    labelDiemChuyen.textContent = `Điểm bài thi môn chuyên (hệ số ${heSo})`;
  }

  const moTaMap = {
    conglap: DATA.congThuc.congLap?.moTa,
    chuyen: DATA.congThuc.chuyen?.moTa,
  };
  congThucHint.textContent = moTaMap[loai] || "";
}

function onSubmit(e) {
  e.preventDefault();
  if (!DATA) return;

  const submitErrorEl = $("submit-error");
  const loai = loaiTruongEl.value;
  const idsCanKiemTra = ["diem-toan", "diem-van", "diem-mon3"];
  if (loai === "chuyen") idsCanKiemTra.push("diem-chuyen");

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
  const khuVucFilter = khuVucEl.value;

  const uuTienObj = DATA.congThuc.uuTien.find((o) => String(o.nhom) === uuTienEl.value);
  const khuyenKhichObj = DATA.congThuc.khuyenKhich.find((o) => o.giai === khuyenKhichEl.value);
  const congThem = (uuTienObj?.diem || 0) + (khuyenKhichObj?.diem || 0);

  let tong, danhSach, isFail = false;

  if (loai === "chuyen") {
    const diemChuyen = parseFloat($("diem-chuyen").value);
    const heSo = DATA.congThuc.chuyen?.heSoMonChuyen ?? 2;
    tong = toan + van + mon3 + heSo * diemChuyen + congThem;

    const monChon = monChuyenEl.value;
    danhSach = [];
    (DATA.truongChuyen || []).forEach((truong) => {
      if (khuVucFilter && truong.khuVuc !== khuVucFilter) return;
      const m = truong.monHoc.find((mm) => mm.ten === monChon);
      if (!m) return;
      danhSach.push({ ten: `${truong.ten} — ${m.ten}`, khuVuc: truong.khuVuc, chuan: m.nv1, nv: "NV1" });
      if (m.nv2 != null) danhSach.push({ ten: `${truong.ten} — ${m.ten}`, khuVuc: truong.khuVuc, chuan: m.nv2, nv: "NV2" });
    });
  } else {
    tong = toan + van + mon3 + congThem;
    const nguongLiet = DATA.congThuc.congLap?.diemLietToiDa ?? 1.0;
    isFail = [toan, van, mon3].some((v) => v <= nguongLiet);

    danhSach = [];
    DATA.truongCongLap
      .filter((t) => !khuVucFilter || t.khuVuc === khuVucFilter)
      .forEach((t) => {
        danhSach.push({ ten: t.ten, khuVuc: t.khuVuc, chuan: t.nv1, nv: "NV1" });
        if (t.nv2 != null) danhSach.push({ ten: t.ten, khuVuc: t.khuVuc, chuan: t.nv2, nv: "NV2" });
        if (t.nv3 != null) danhSach.push({ ten: t.ten, khuVuc: t.khuVuc, chuan: t.nv3, nv: "NV3" });
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
        <div class="school-meta">${escapeHtml(s.khuVuc || "Chưa xác định khu vực")}${s.nv ? " · " + s.nv : ""} · Điểm chuẩn ${s.chuan.toFixed(2)}</div>
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
