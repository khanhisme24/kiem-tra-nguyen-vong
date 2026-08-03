# Tra điểm chuẩn lớp 10 — Em đỗ trường nào?

Web tĩnh (thuần HTML/CSS/JS, không cần build) giúp học sinh nhập điểm thi vào lớp 10 và biết ngay mình đang ở nhóm nào so với điểm chuẩn năm ngoái.

## Tính năng

- **Nhập điểm 3 môn** (Toán, Ngữ văn, Môn thứ ba) và tự động tính **điểm xét tuyển** theo đúng công thức của Sở GD&ĐT.
- **Xét theo 2 loại trường:**
  - *Công lập*: ĐXT = Toán + Văn + Môn thứ ba + điểm ưu tiên + điểm khuyến khích.
  - *Chuyên Nguyễn Trãi*: ĐXT = Toán + Văn + Tiếng Anh + 3 × điểm môn chuyên, chọn theo từng môn chuyên đăng ký.
- **Cộng điểm ưu tiên và điểm khuyến khích** theo đúng các mức quy định (nhóm ưu tiên 1/2/3, giải Nhất/Nhì/Ba cấp tỉnh).
- **Chọn tỉnh/thành** ở đầu phiếu — mỗi tỉnh có bộ dữ liệu và danh sách khu vực (huyện/thị xã) riêng, dễ mở rộng thêm tỉnh mới sau này.
- **Lọc trường theo khu vực** (huyện/thị xã/thành phố) trong tỉnh đã chọn, để chỉ xem những trường gần nơi ở.
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

- `manifest.json` — danh mục các tỉnh đang có dữ liệu (hiện chỉ có Hải Dương). Muốn thêm tỉnh khác, thêm 1 dòng vào đây rồi tạo file JSON tương ứng.
- `hai-duong-2025.json` — điểm chuẩn Hải Dương 2025–2026, gồm:
  - `truongCongLap`: mảng các trường, mỗi trường có `ten`, `khuVuc`, `nv1`, `nv2` (null nếu trường không xét NV2).
  - `lopChuyen`: điểm chuẩn từng môn chuyên của trường Chuyên Nguyễn Trãi.
  - `congThuc`: công thức tính điểm xét tuyển, mức điểm ưu tiên/khuyến khích — lấy theo Quyết định 634/QĐ-UBND (11/3/2025) và Quyết định 1088/QĐ-SGDĐT (18/6/2025) của Hải Dương.

### ⚠️ Lưu ý quan trọng cần bạn kiểm tra lại

1. **Trường "khuVuc"**: mình gán huyện/thị xã/thành phố dựa trên tên trường và hiểu biết chung, một số trường mình chỉ suy đoán với độ tin cậy vừa phải. Vì Việt Nam vừa sáp nhập đơn vị hành chính năm 2025 (bỏ cấp huyện, chuyển sang tỉnh + xã/phường), tên gọi này có thể đã lỗi thời — bạn nên đối chiếu với danh sách chính thức của Sở GD&ĐT Hải Dương và sửa lại field `khuVuc` cho từng trường (chỉ cần sửa trực tiếp trong file JSON, không cần đụng vào code).
2. **Ngưỡng "vừa đủ"**: đang để cứng ±1.0 điểm trong `script.js` (biến `NGUONG_VUA_DU`). Bạn có thể chỉnh lại tùy ý.
3. Điểm chuẩn của **năm sau** chắc chắn sẽ khác năm 2025 — công cụ này chỉ mang tính tham khảo dựa trên điểm chuẩn năm ngoái, không phải điểm chuẩn chính thức của năm thí sinh dự thi.

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
