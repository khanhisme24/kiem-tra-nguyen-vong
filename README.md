# Tra điểm chuẩn lớp 10 — Bạn đỗ trường nào?

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

### ⚠️ Lưu ý quan trọng

1. **Trường "khuVuc"**: mình gán quận/huyện/thị xã/thành phố dựa trên tên trường và hiểu biết chung, độ tin cậy không đồng đều — nhiều trường (nhất là các trường ít nổi tiếng ở TP.HCM) mình để `null` vì không đủ chắc chắn. Việt Nam vừa sáp nhập đơn vị hành chính năm 2025 (Hải Dương bỏ cấp huyện; TP.HCM sáp nhập thêm Bình Dương và Bà Rịa – Vũng Tàu), nên tên gọi có thể đã lỗi thời. Bạn nên đối chiếu với danh sách chính thức của Sở GD&ĐT và sửa lại field `khuVuc` cho từng trường (chỉ cần sửa trực tiếp trong file JSON, không cần đụng vào code).
2. **Ngưỡng "vừa đủ"**: đang để cứng ±1.0 điểm trong `script.js` (biến `NGUONG_VUA_DU`), áp dụng chung cho mọi tỉnh. Bạn có thể chỉnh lại tùy ý.
3. **Điểm ưu tiên/khuyến khích cho lớp chuyên**: mình áp dụng cùng 1 công thức cộng ưu tiên/khuyến khích cho cả lớp thường và lớp chuyên ở mọi tỉnh. TP.HCM xác nhận rõ điều này trong công thức chính thức; Hải Dương không nói rõ có áp dụng cho lớp chuyên hay không nên đây là giả định hợp lý, chưa chắc 100% chính xác.
4. Điểm chuẩn của **năm sau** chắc chắn sẽ khác năm 2025 — công cụ này chỉ mang tính tham khảo dựa trên điểm chuẩn năm ngoái, không phải điểm chuẩn chính thức của năm thí sinh dự thi.
