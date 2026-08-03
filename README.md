# Tra điểm chuẩn lớp 10 — Em đỗ trường nào?

Web tĩnh (HTML/CSS/JS thuần, không cần build) giúp học sinh nhập điểm 3 môn thi vào lớp 10 và xem ngay:

- ✅ **Đủ điểm** — cao hơn điểm chuẩn năm ngoái ≥ 1 điểm
- ⚠️ **Vừa đủ** — lệch trong khoảng ±1 điểm so với điểm chuẩn
- ❌ **Thiếu điểm** — thấp hơn điểm chuẩn năm ngoái > 1 điểm

Có thể lọc trường theo khu vực (huyện/thị xã/thành phố) và chọn xét theo trường công lập hoặc lớp chuyên (Chuyên Nguyễn Trãi).

## Chạy thử ở máy local

Không cần cài gì thêm, chỉ cần một server tĩnh vì trình duyệt chặn `fetch()` file JSON khi mở trực tiếp bằng `file://`:

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

1. **Trường "khuVuc"**: mình gán huyện/thị xã/thành phố dựa trên tên trường và hiểu biết chung (ví dụ trường "Tứ Kỳ" ở huyện Tứ Kỳ), một số trường mình chỉ suy đoán với độ tin cậy vừa phải (Trần Phú, Nguyễn Thị Duệ, Mạc Đĩnh Chi, Hà Bắc, Hà Đông, Thanh Bình, Cầu Xe, Hưng Đạo, Đoàn Thượng, Quang Trung, Khúc Thừa Dụ, Kẻ Sặt, Đường An, Tuệ Tĩnh). Vì Việt Nam vừa sáp nhập đơn vị hành chính năm 2025 (bỏ cấp huyện, chuyển sang tỉnh + xã/phường), tên gọi này có thể đã lỗi thời — bạn nên đối chiếu với danh sách chính thức của Sở GD&ĐT Hải Dương và sửa lại field `khuVuc` cho từng trường (chỉ cần sửa trực tiếp trong file JSON, không cần đụng vào code).
2. **Ngưỡng "vừa đủ"**: đang để cứng ±1.0 điểm trong `script.js` (biến `NGUONG_VUA_DU`). Bạn có thể chỉnh lại tùy ý.
3. Điểm chuẩn của **năm sau** chắc chắn sẽ khác năm 2025 — công cụ này chỉ mang tính tham khảo dựa trên điểm chuẩn năm ngoái, không phải điểm chuẩn chính thức của năm thí sinh dự thi.

## Thêm tỉnh/thành khác

1. Tạo file `data/<ten-tinh>.json` theo đúng cấu trúc của `hai-duong-2025.json`.
2. Thêm dòng tương ứng vào `data/manifest.json`.
3. Hiện tại `script.js` đang load thẳng 1 tỉnh cố định qua biến `DATA_URL` — nếu muốn cho người dùng chọn tỉnh, cần thêm 1 dropdown tỉnh vào `index.html` và sửa `init()` trong `script.js` để đọc `manifest.json` trước rồi load file tỉnh tương ứng.

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
