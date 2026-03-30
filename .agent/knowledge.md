# Bản đồ Tài liệu Tham chiếu (Knowledge Index)

Tài liệu framework NetAT nằm trong thư mục `docs/` ở root dự án. File này giúp agent xác định nhanh cần đọc tài liệu nào cho từng loại task.

---

## Tra cứu nhanh theo Task

| Bạn đang làm gì? | Đọc file nào? |
|---|---|
| Viết script thao tác web (click, nhập, chọn) | `netat-web_user_guide.md` |
| Khởi tạo browser, quản lý driver | `netat-driver_user_guide.md` |
| Dùng base class, annotation, Allure report | `netat-core_user_guide.md` |
| Tìm interface, API nội bộ framework | `netat-core-api_user_guide.md` |
| Test REST API (GET, POST, PUT, DELETE) | `netat-api_user_guide.md` |
| Thao tác database (query, insert, verify) | `netat-db_user_guide.md` |
| Test mobile app (Android/iOS) | `netat-mobile_user_guide.md` |
| Tạo keyword tùy chỉnh riêng | `netat-custom_user_guide.md` |
| Dùng utility (random, date, file, string) | `netat-utils_generate-utils-test.md` |
| Sinh test Playwright | `netat-playwright_generate-playwright-test.md` |

---

## Chi tiết từng Tài liệu

### 1. `docs/netat-web_user_guide.md` (~27KB)
**Khi nào đọc:** Agent 2 (Coder) cần viết code thao tác web.
- Keyword: `WebKeyword.click()`, `setText()`, `getText()`, `selectByText()`, `waitForElement()`
- Xử lý iframe, alert, multiple windows
- Upload file, drag & drop, hover

### 2. `docs/netat-driver_user_guide.md` (~22KB)
**Khi nào đọc:** Cần khởi tạo/đóng browser, cấu hình driver.
- `DriverKeyword.openBrowser()`, `navigateTo()`, `closeBrowser()`
- Cấu hình Chrome, Firefox, Edge, headless mode
- Remote WebDriver, Selenium Grid

### 3. `docs/netat-core_user_guide.md` (~16KB)
**Khi nào đọc:** Cần hiểu base class, cấu trúc test, reporting.
- `CommonMethod` base class (kế thừa cho mọi test)
- TestNG annotation (`@Test`, `@BeforeMethod`, `@AfterMethod`)
- Allure reporting, screenshot on failure
- Session management

### 4. `docs/netat-core-api_user_guide.md` (~21KB)
**Khi nào đọc:** Cần tìm interface hoặc API nội bộ framework.
- Interface definitions cho keyword classes
- ObjectUI loading mechanism
- Config & properties management

### 5. `docs/netat-api_user_guide.md` (~19KB)
**Khi nào đọc:** Test case liên quan đến REST API.
- `ApiKeyword.sendGet()`, `sendPost()`, `sendPut()`, `sendDelete()`
- Header, authentication, request body
- Response validation, JSON path assertion

### 6. `docs/netat-db_user_guide.md` (~20KB)
**Khi nào đọc:** Test case cần verify dữ liệu database.
- `DbKeyword.executeQuery()`, `executeUpdate()`
- Kết nối Oracle, MySQL, PostgreSQL, SQL Server
- So sánh kết quả query với expected data

### 7. `docs/netat-mobile_user_guide.md` (~18KB)
**Khi nào đọc:** Test case cho ứng dụng mobile.
- `MobileKeyword.tap()`, `swipe()`, `setText()`
- Appium configuration (Android/iOS)
- Native app, hybrid app, mobile web

### 8. `docs/netat-custom_user_guide.md` (~9KB)
**Khi nào đọc:** Cần tạo keyword mới ngoài bộ có sẵn.
- Cách tạo custom keyword class
- Đăng ký keyword vào framework
- Best practices cho reusable keywords

### 9. `docs/netat-utils_generate-utils-test.md` (~11KB)
**Khi nào đọc:** Cần hàm tiện ích (random data, format date, đọc file...).
- Random string, number, email generator
- Date/time utilities
- File I/O helpers, CSV/Excel reader

### 10. `docs/netat-playwright_generate-playwright-test.md` (~16KB)
**Khi nào đọc:** Sinh test sử dụng Playwright thay vì Selenium.
- Playwright test generation patterns
- So sánh Playwright vs Selenium approach
- Integration với NetAT framework

---

## Quy tắc cho Agent

1. **KHÔNG đọc tất cả 10 file cùng lúc** — chỉ đọc file liên quan đến task hiện tại.
2. **Ưu tiên đọc trước:** `netat-web_user_guide.md` + `netat-driver_user_guide.md` (2 file quan trọng nhất cho web automation).
3. **Đọc thêm khi cần:** Tra bảng "Tra cứu nhanh theo Task" ở trên để xác định file cần thiết.
