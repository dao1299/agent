# Quy tắc Ưu tiên Locator - Selenium Automation

Tài liệu này định nghĩa bộ quy tắc 7 mức ưu tiên khi chọn locator cho element, áp dụng cho toàn bộ agent trong pipeline.

## Nguyên tắc tổng quan

Mục tiêu: Tạo locator **bền vững**, **dễ bảo trì**, hạn chế tối đa **Flaky Tests**.

## 7 Mức Ưu tiên (Cao → Thấp)

### Mức 1: Data Attributes (Đỉnh cao của sự bền vững)
Ưu tiên tuyệt đối các thuộc tính dành riêng cho testing:
- `data-testid`, `data-cy`, `data-qa`
- **Ví dụ:** `By.cssSelector("[data-testid='login-btn']")`
- **Lý do:** Được thiết kế riêng cho automation, không bị ảnh hưởng bởi thay đổi UI.

### Mức 2: Static ID
Sử dụng thuộc tính `id` nếu nó **duy nhất** và **KHÔNG chứa con số ngẫu nhiên**.
- **Ví dụ:** `By.id("username")`
- **KHÔNG dùng:** `id="btn-1234x"` (dynamic ID)
- **Cách nhận biết dynamic ID:** Chứa chuỗi số ≥3 chữ số (`\d{3,}`).

### Mức 3: Name Attribute
Rất đáng tin cậy cho các thẻ form control (`input`, `select`, `textarea`).
- **Ví dụ:** `By.name("email")`

### Mức 4: Accessibility (Trợ năng)
Dựa vào `aria-label` hoặc `role`. Các thuộc tính này thường ít bị thay đổi do yêu cầu UI/UX chuẩn.
- **Ví dụ:** `By.cssSelector("button[aria-label='Close']")`

### Mức 5: Text / Link Text
Dùng cho thẻ `<a>` với `Link Text` hoặc `Partial Link Text`.
- **Điều kiện:** Text phải tĩnh, trang web ít bị ảnh hưởng bởi đa ngôn ngữ (i18n).
- **Ví dụ:** `By.linkText("Đăng Nhập")`

### Mức 6: CSS Selector (Cấu trúc tối giản)
- Chỉ dùng **TỐI ĐA 2-3 cấp** cha-con.
- Kết hợp class mang tính **ngữ nghĩa đặc trưng**.
- **Ví dụ chuẩn:** `By.cssSelector("form.login-form button.submit")`

### Mức 7: XPath (Cuối cùng mới dùng)
Chỉ dùng khi cần thao tác phức tạp:
- Tìm theo text: `contains(text(), '...')`
- Duyệt ngược lên cha: `/parent::`, `/ancestor::`
- Tìm anh em ngang hàng: `/following-sibling::`

## Anti-Patterns (TUYỆT ĐỐI KHÔNG LÀM)

| Anti-Pattern | Lý do |
|---|---|
| CSS tuyệt đối: `html > body > div > form > button` | Vỡ ngay khi DOM thay đổi cấu trúc |
| XPath tuyệt đối: `/html/body/div[1]/...` | Phụ thuộc hoàn toàn vào vị trí, cực kỳ giòn |
| Dynamic class (Tailwind hash, random string) | Thay đổi mỗi lần build |
| Locator dựa trên index vị trí: `div[3]`, `li[5]` | Vỡ khi thêm/xóa element |

## Công cụ Hỗ trợ

Sử dụng script `scripts/extract_optimized_dom.js` (trong skill `selenium_locator_generator`) để trích xuất DOM sạch dưới dạng JSON, giúp phân tích locator hiệu quả mà không tốn token cho HTML thô.
