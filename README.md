# Tra điểm chuẩn lớp 10 — Em đỗ trường nào?

Web tĩnh (thuần HTML/CSS/JS, không cần build) giúp học sinh nhập điểm thi vào lớp 10 và biết ngay mình đang ở nhóm nào so với điểm chuẩn năm ngoái.

## Tính năng

- **Nhập điểm 3 môn** (Toán, Ngữ văn, Môn thứ ba/Ngoại ngữ) và tự động tính **điểm xét tuyển** theo đúng công thức của từng Sở GD&ĐT (mỗi tỉnh một công thức riêng, lưu trong file dữ liệu).
- **Chọn tỉnh/thành** ở đầu phiếu — hiện có Hải Dương và TP.HCM, dễ mở rộng thêm tỉnh khác.
- **3 loại hình xét tuyển:**
  - *Công lập (thường)*: theo điểm 3 môn thi + ưu tiên/khuyến khích.
  - *Trường chuyên*: chọn môn chuyên đã thi, hệ thống tự tìm **tất cả trường chuyên trong tỉnh** có mở môn đó (ví dụ TP.HCM có cả Trần Đại Nghĩa lẫn Lê Hồng Phong) và so điểm với từng trường.
  - *Tích hợp Tiếng Anh (Đề án 5695)*: dành cho tỉnh có chương trình này (hiện chỉ TP.HCM) — tự ẩn nếu tỉnh đang chọn không có.
- **Cộng điểm ưu tiên và điểm khuyến khích** theo đúng các mức quy định (nhóm ưu tiên 1/2/3, giải Nhất/Nhì/Ba cấp tỉnh).
- **Lọc trường theo khu vực** (quận/huyện/thị xã/thành phố) trong tỉnh đã chọn, để chỉ xem những trường gần nơi ở.
- **Phân loại kết quả thành 3 nhóm** so với điểm chuẩn năm ngoái của từng trường/nguyện vọng:
  - ✅ Đủ điểm — an toàn (cao hơn ≥ 1 điểm)
  - ⚠️ Vừa đủ — cân não (lệch trong khoảng ±1 điểm)
  - ❌ Thiếu điểm (thấp hơn > 1 điểm)
- **Kiểm tra dữ liệu đầu vào**: chỉ chấp nhận số từ 0–10, gõ sai ký tự hoặc vượt quá 10 sẽ hiện thông báo và yêu cầu nhập lại, tránh tính nhầm.
- Giao diện lấy cảm hứng từ phiếu báo điểm và con dấu đỏ của Sở GD&ĐT — kết quả hiện ra kèm một "con dấu" đóng trực tiếp lên màn hình.

## Chạy thử ở máy local

Cần một server tĩnh vì trình duyệt chặn `fetch()` file JSON khi mở trực tiếp bằng `file://`:

```bash
cd tuyen-sinh-lop10
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

## Deploy lên GitHub Pages

1. Tạo repo mới trên GitHub, upload toàn bộ nội dung thư mục này (giữ nguyên cấu trúc file).
2. Vào **Settings → Pages**, chọn **Source: Deploy from a branch**, branch `main`, thư mục `/ (root)`.
3. Đợi 1–2 phút, GitHub sẽ cấp link dạng `https://<username>.github.io/<ten-repo>/`.

## Cấu trúc dữ liệu (`data/`)

- `manifest.json` — danh mục các tỉnh đang có dữ liệu. Muốn thêm tỉnh khác, thêm 1 dòng vào đây rồi tạo file JSON tương ứng.
- Mỗi file tỉnh (ví dụ `hai-duong-2025.json`, `ho-chi-minh-2025.json`) gồm:
  - `truongCongLap`: mảng các trường thường, mỗi trường có `ten`, `khuVuc`, `nv1`, `nv2`, `nv3` (`null` nếu tỉnh đó không xét nguyện vọng đó — Hải Dương chỉ có NV1/NV2, TP.HCM có cả NV3).
  - `truongChuyen`: **mảng nhiều trường chuyên** (không giới hạn 1 trường/tỉnh — ví dụ TP.HCM có cả Trần Đại Nghĩa và Lê Hồng Phong), mỗi trường có `ten`, `khuVuc`, và `monHoc` là mảng các môn chuyên với `ten`, `nv1`, `nv2`.
  - `truongTichHop` *(tùy chọn, chỉ khai báo nếu tỉnh có chương trình này)*: mảng trường có lớp Tiếng Anh tích hợp, cấu trúc giống `truongCongLap`.
  - `congThuc`: công thức tính điểm xét tuyển cho từng loại hình (`congLap`, `chuyen`, `tichHop`), mức điểm ưu tiên/khuyến khích, và `heSoMonChuyen` (hệ số nhân điểm môn chuyên — mỗi tỉnh có thể khác nhau, Hải Dương ×3, TP.HCM ×2), `diemLietToiDa` (điểm từ mức này trở xuống thì bị loại — Hải Dương ≤1.0, TP.HCM chỉ loại nếu đúng 0 điểm).

### ⚠️ Lưu ý quan trọng cần bạn kiểm tra lại

1. **Trường "khuVuc"**: mình gán quận/huyện/thị xã/thành phố dựa trên tên trường và hiểu biết chung, độ tin cậy không đồng đều — nhiều trường (nhất là các trường ít nổi tiếng ở TP.HCM) mình để `null` vì không đủ chắc chắn. Việt Nam vừa sáp nhập đơn vị hành chính năm 2025 (Hải Dương bỏ cấp huyện; TP.HCM sáp nhập thêm Bình Dương và Bà Rịa – Vũng Tàu), nên tên gọi có thể đã lỗi thời. Bạn nên đối chiếu với danh sách chính thức của Sở GD&ĐT và sửa lại field `khuVuc` cho từng trường (chỉ cần sửa trực tiếp trong file JSON, không cần đụng vào code).
2. **Ngưỡng "vừa đủ"**: đang để cứng ±1.0 điểm trong `script.js` (biến `NGUONG_VUA_DU`), áp dụng chung cho mọi tỉnh. Bạn có thể chỉnh lại tùy ý.
3. **Điểm ưu tiên/khuyến khích cho lớp chuyên**: mình áp dụng cùng 1 công thức cộng ưu tiên/khuyến khích cho cả lớp thường và lớp chuyên ở mọi tỉnh. TP.HCM xác nhận rõ điều này trong công thức chính thức; Hải Dương không nói rõ có áp dụng cho lớp chuyên hay không nên đây là giả định hợp lý, chưa chắc 100% chính xác.
4. Điểm chuẩn của **năm sau** chắc chắn sẽ khác năm 2025 — công cụ này chỉ mang tính tham khảo dựa trên điểm chuẩn năm ngoái, không phải điểm chuẩn chính thức của năm thí sinh dự thi.

## Thêm tỉnh/thành khác

Không cần sửa code — chỉ cần thêm dữ liệu:

1. Tạo file `data/<ten-tinh>.json` theo đúng cấu trúc của `hai-duong-2025.json` (copy file này rồi thay số liệu).
2. Thêm 1 dòng vào `data/manifest.json`, ví dụ:
   ```json
   { "ma": "hung-yen", "ten": "Hưng Yên", "file": "data/hung-yen-2025.json" }
   ```
3. Mở lại trang web — dropdown **"Tỉnh/Thành"** sẽ tự động hiện thêm tỉnh mới, người dùng chọn tỉnh nào thì dropdown **"Lọc theo khu vực"** (huyện/thị xã) cũng tự cập nhật theo đúng danh sách huyện của tỉnh đó.

## Cấu trúc file

```
tuyen-sinh-lop10/
├── index.html
├── style.css
├── script.js
├── data/
│   ├── manifest.json
│   └── hai-duong-2025.json
└── README.md
```
