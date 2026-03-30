# Quy tắc Kiến trúc Dự án NetAT

Tài liệu này mô tả cấu trúc thư mục, quy ước đặt tên file, và pattern bắt buộc trong dự án NetAT automation.

## 1. Cấu trúc Thư mục Dự án

```
src/test/java/automationtest/
├── object/                          # Chứa ObjectUI definitions
│   ├── ObjectRepository.java        # File mapping tập trung tất cả biến
│   ├── LoginPage/                   # Thư mục theo tên màn hình
│   │   ├── input_username.json
│   │   ├── input_password.json
│   │   └── btn_login.json
│   └── [Tên_Màn_Hình]/
│       └── [tên_element].json
├── script/                          # Chứa TestNG automation scripts
│   ├── login/
│   │   └── LoginWithValidCredentials.java
│   ├── checkout/
│   └── [nghiệp_vụ]/
│       └── [TênTestCase].java
```

## 2. ObjectUI JSON Format

Mỗi element trên UI được lưu thành 1 file JSON riêng biệt:

```json
{
  "uuid": "<UUID ngẫu nhiên>",
  "name": "INPUT_USERNAME",
  "strategy": "NAME",
  "locator": "username",
  "description": "Ô nhập tên đăng nhập trang Login"
}
```

**Quy tắc:**
- `uuid`: Sinh UUID v4 ngẫu nhiên, đảm bảo tính duy nhất.
- `name`: UPPER_SNAKE_CASE, trùng khớp với hằng số trong `ObjectRepository.java`.
- `strategy`: Một trong các giá trị: `DATA_TESTID`, `ID`, `NAME`, `ARIA_LABEL`, `CSS`, `XPATH`, `TEXT`.
- `locator`: Giá trị locator cụ thể tương ứng với strategy.

## 3. ObjectRepository.java Pattern

File `ObjectRepository.java` là nơi khai báo tập trung tất cả biến mapping đến ObjectUI:

```java
package automationtest.object;

public class ObjectRepository {
    // Login Page
    public static final String INPUT_USERNAME = "object/LoginPage/input_username.json";
    public static final String INPUT_PASSWORD = "object/LoginPage/input_password.json";
    public static final String BTN_LOGIN = "object/LoginPage/btn_login.json";

    // [Màn hình khác]
}
```

**Quy tắc:**
- Mỗi biến là `public static final String`.
- Giá trị là đường dẫn tương đối từ `automationtest/` đến file JSON.
- Nhóm biến theo màn hình, có comment phân tách rõ ràng.

## 4. Quy trình Tổ chức Thư mục Script

- Thư mục `script/` chứa toàn bộ test script.
- Bên trong, tổ chức thư mục con theo **nghiệp vụ** hoặc **màn hình** (ví dụ: `login/`, `checkout/`, `user_management/`).
- Nếu chưa có thư mục phù hợp, **đề xuất tên thư mục** dựa trên nghiệp vụ của test case cho User xác nhận.

## 5. Tài liệu Tham chiếu

| Tài liệu | Đường dẫn | Nội dung |
|---|---|---|
| Project Description | `PROJECT_DESCRIPTION.md` | Chuẩn ObjectUI JSON, cấu trúc lưu trữ |
| NetAT Web Guide | `docs/netat-web_user_guide.md` | Keyword thao tác web |
| NetAT Driver Guide | `docs/netat-driver_user_guide.md` | Quản lý browser/driver |
| NetAT Core API | `docs/netat-core-api_user_guide.md` | Interfaces và base classes |
| Prompt Workflow | `PROMPT_WORKFLOW.md` | Ngữ cảnh hệ thống tổng thể |
