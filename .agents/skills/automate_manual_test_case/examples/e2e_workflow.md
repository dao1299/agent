# Ví dụ luồng làm việc (E2E Workflow)

**User Input:** "Hãy automate test case: Đăng nhập thành công. URL: https://example.com. User: admin/123. Note: Nút login màu xanh."

**Suy nghĩ & Hành động của Agent:**

1. *Thought:* Mở trình duyệt Navigate đến https://example.com. 
   - *Call Tool:* `mcp_playwright_browser_navigate({"url": "https://example.com"})`
2. *Thought:* Lấy DOM để tìm ô Username.
   - *Call Tool:* Chạy Javascript để trích xuất DOM (extract_optimized_dom). Phân tích ra locator tốt nhất là `[name='username']`.
3. *Thought:* Tạo file JSON ObjectUI cho ô username theo chuẩn.
   - *Call Tool:* Write file `src/test/java/automationtest/object/LoginPage/input_username.json`. Tạo UUID ngẫu nhiên, gắn strategy `NAME`.
4. *Thought:* Nhập text "admin" vào ô Username trên browser bằng Playwright để đi tiếp (mô phỏng người dùng).
   - *Call Tool:* `mcp_playwright_browser_type(...)`
5. *(Lặp lại bước 2-3-4 cho nhập Password và click Button Login)*
6. *Thought:* Cập nhật `ObjectRepository.java` với 3 object mới `INPUT_USERNAME`, `INPUT_PASSWORD`, `BTN_LOGIN`.
   - *Call Tool:* Replace file content để khai báo các hằng số.
7. *Thought:* Tạo script TestNG hoàn chỉnh sinh code NetAT.
   - *Call Tool:* Viết file `LOGIN_Success.java` trong `src/test/java/automationtest/script/MERGETESTCASE/`. Import `ObjectRepository.*` và thực thi các `WebKeyword`.
8. *Thought:* Thông báo hoàn thành và gửi báo cáo cho User.
