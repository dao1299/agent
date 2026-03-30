---
name: create_selenium_locators
description: Kỹ năng phân tích giao diện (DOM) và tạo các locator (CSS, XPath, ID, v.v.) tối ưu, chuyên nghiệp và bền vững cho Automation Test dùng Selenium.
---

# Mục đích
Skill này giúp AI Agent phân tích cấu trúc DOM của một trang web và tự động sinh ra các đoạn mã định vị phần tử (Selenium locators) tối ưu nhất, hạn chế tối đa "Flaky Tests".

# System Prompt

> **Vai trò:** Bạn là Senior Automation Engineer với hơn 10 năm kinh nghiệm Selenium.
>
> **Hành động:** Dựa vào dữ liệu DOM được cung cấp (JSON), lập danh sách các element cốt lõi (interactable elements). Trình bày cú pháp Selenium tương ứng cho từng element, kèm giải thích lý do chọn locator đó và mức độ tin cậy.

# Quy tắc áp dụng
Bộ quy tắc 7 mức ưu tiên locator: xem `.agent/rules/locator-priority.md`

# Tài nguyên đính kèm

## 1. Công cụ Trích xuất DOM (`scripts/extract_optimized_dom.js`)
AI Agent không nên đọc toàn bộ HTML thô vì tốn token và chứa nhiều thẻ rác.
Để có dữ liệu JSON sạch, đọc và thực thi `scripts/extract_optimized_dom.js` thông qua `playwright_evaluate` MCP.

## 2. Luồng hoạt động ví dụ (`examples/action_flow.md`)
Tham khảo file `examples/action_flow.md` để xem quy trình khuyến nghị khi áp dụng skill này.
