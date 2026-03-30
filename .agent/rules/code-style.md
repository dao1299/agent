# Quy tắc Code Style - Java NetAT

Tài liệu này định nghĩa các quy tắc bắt buộc khi sinh mã Java automation trong dự án NetAT.

## 1. Java Naming Convention

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| **Package name** | Viết thường, không dấu, phân cách bằng dấu chấm | `automationtest.script.login` |
| **Class name** | PascalCase, bắt đầu bằng danh từ hoặc mô tả nghiệp vụ | `LoginWithValidCredentials.java` |
| **Method name** | camelCase, bắt đầu bằng động từ | `verifyLoginSuccess()` |
| **Biến** | camelCase, tên có ý nghĩa rõ ràng | `inputUsername`, `btnLogin` |
| **Hằng số (ObjectRepository)** | UPPER_SNAKE_CASE | `INPUT_USERNAME`, `BTN_LOGIN` |

## 2. Cấu trúc TestNG Script

- Sử dụng Annotation `@Test` cho mỗi test method.
- Inject các biến từ `ObjectRepository` thông qua import static hoặc reference trực tiếp.
- Kế thừa từ class `CommonMethod` nếu có yêu cầu từ project.
- Mỗi file `.java` nằm trong `src/test/java/automationtest/script/<subfolder>/`.

## 3. NetAT Keyword Usage

Chỉ sử dụng các keyword chuẩn của NetAT framework:

| Keyword Class | Phương thức thường dùng | Mô tả |
|---|---|---|
| `WebKeyword` | `click()`, `setText()`, `getText()`, `selectByText()` | Thao tác UI web |
| `VerifyKeyword` | `verifyTrue()`, `verifyEqual()`, `verifyContains()` | Kiểm tra/xác minh |
| `DriverKeyword` | `openBrowser()`, `navigateTo()`, `closeBrowser()` | Quản lý trình duyệt |

## 4. Tài liệu tham chiếu bắt buộc

Trước khi sinh code, agent **PHẢI** đọc các file sau:
- `docs/netat-web_user_guide.md` — Keyword web automation
- `docs/netat-driver_user_guide.md` — Quản lý driver/browser
- `docs/netat-core-api_user_guide.md` — Core API interfaces

## 5. Quy tắc cấm

- **KHÔNG** sử dụng Browser/Playwright để kiểm tra web khi đang ở bước sinh code (Agent 2).
- **KHÔNG** import thư viện ngoài NetAT trừ khi được User cho phép.
- **KHÔNG** hard-code URL, credentials, hay test data trực tiếp trong script.
