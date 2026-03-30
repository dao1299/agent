# Quy trình Hoạt động Khuyến nghị của Agent (Action Flow)

Cách để liên kết System Prompt (trong `SKILL.md`) và JavaScript DOM Extractor (trong `scripts/extract_optimized_dom.js`) thành luồng chạy mượt mà cho một AI Agent:

1. **User Ra Lệnh:** Người dùng nói *"Hãy lấy locator và sinh code login form cho trang này."*
2. **AI Gọi Client Tool (Trích xuất DOM):** Agent kích hoạt tool (ví dụ `execute_javascript` với MCP playwright) chạy mã đọc từ file `scripts/extract_optimized_dom.js` tại màn hình trình duyệt hiện tại để lấy dữ liệu.
3. **Tool Trả Kết Quả JSON:** Trình duyệt sẽ trả về mảng component cực gọn nhẹ. Ví dụ: 
   ```json
   [
     {"tag": "input", "name": "username", "placeholder": "Email/Phone"},
     {"tag": "input", "name": "password", "type": "password"},
     {"tag": "button", "text": "Đăng Nhập", "testId": "btn-submit-login"}
   ]
   ```
4. **Agent Phân Tích (Brainstorm):** Agent nhận JSON và đối chiếu với System Prompt. Agent thấy nút *"Đăng Nhập"* có `testId`, nó lập tức đánh giá mức ưu tiên cao nhất (#1). Với username, có thuộc tính `name` phù hợp cho rule ưu tiên #3.
5. **Agent Đưa Ra Kết Luận Cuối:** Output được sinh ra như một Tester kỳ cựu:

> **Kết quả Locators Sinh thành:**
>
> 1. **User Name field:**
>    - Locator: `By.name("username")`
>    - Chiến lược: Sử dụng thuộc tính Name (Ưu tiên mức 3). Độ tin cậy cao cho form input.
>
> 2. **Password field:**
>    - Locator: `By.name("password")`
>    - Chiến lược: Sử dụng thuộc tính Name. 
> 
> 3. **Submit Button:**
>    - Locator: `By.cssSelector("[data-testid='btn-submit-login']")`
>    - Chiến lược: Dựa vào data-attribute chuyên dụng testing (Ưu tiên mức 1 đỉnh cao). Độ linh cậy tuyệt đối, không sợ vỡ UI thay đổi.
