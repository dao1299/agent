# Workflow: Trích xuất Locator từ DOM

Quy trình trích xuất DOM trang web và sinh locator Selenium tối ưu cho automation test.

## Tổng quan Luồng

```
User ra lệnh (URL + yêu cầu)
    │
    ▼
┌─────────────────────────────┐
│  1. Mở trang web (Playwright) │
└─────────┬───────────────────┘
          ▼
┌─────────────────────────────┐
│  2. Inject extract_optimized │
│     _dom.js vào trang        │
└─────────┬───────────────────┘
          ▼
┌─────────────────────────────┐
│  3. Nhận JSON DOM đã sạch    │
└─────────┬───────────────────┘
          ▼
┌─────────────────────────────┐
│  4. Phân tích theo 7 mức     │
│     ưu tiên locator          │
└─────────┬───────────────────┘
          ▼
┌─────────────────────────────┐
│  5. Sinh cú pháp Selenium    │
│     + giải thích lý do       │
└─────────────────────────────┘
```

## Quy trình Chi tiết

### Bước 1: Mở trang web
Sử dụng MCP Playwright để navigate đến URL mục tiêu.
```
mcp_playwright_browser_navigate({"url": "https://example.com"})
```

### Bước 2: Trích xuất DOM sạch
Inject và chạy script `extract_optimized_dom.js` trên trang hiện tại:
```
mcp_playwright_evaluate({ "expression": "<nội dung extract_optimized_dom.js>" })
```

**Script sẽ tự động:**
- Chỉ lấy element tương tác (button, input, a, select, textarea, role="button"...)
- Bỏ qua element ẩn (display:none, visibility:hidden, width/height=0)
- Lọc class động (Tailwind hash, random string)
- Cắt text dài > 50 ký tự (tiết kiệm token)
- Chỉ trả về element có ít nhất 1 dấu hiệu nhận biết

### Bước 3: Nhận kết quả JSON
Tool trả về mảng JSON gọn nhẹ:
```json
[
  {"tag": "input", "name": "username", "placeholder": "Email/Phone"},
  {"tag": "input", "name": "password", "type": "password"},
  {"tag": "button", "text": "Đăng Nhập", "testId": "btn-submit-login"}
]
```

### Bước 4: Phân tích theo Quy tắc Ưu tiên
Đối chiếu mỗi element với bộ **7 mức ưu tiên** (xem `.agent/rules/locator-priority.md`):
- Có `testId`? → Mức 1 (Data Attribute)
- Có `id` tĩnh? → Mức 2
- Có `name`? → Mức 3
- ... tiếp tục xuống mức 7

### Bước 5: Sinh Output
Trình bày kết quả cho từng element:

> **1. User Name field:**
> - Locator: `By.name("username")`
> - Chiến lược: Thuộc tính Name (Ưu tiên mức 3). Độ tin cậy cao cho form input.
>
> **2. Submit Button:**
> - Locator: `By.cssSelector("[data-testid='btn-submit-login']")`
> - Chiến lược: Data attribute chuyên dụng testing (Ưu tiên mức 1). Độ tin cậy tuyệt đối.

## Skill & Script liên quan

| Tài nguyên | Đường dẫn |
|---|---|
| Skill phân tích locator | `.agent/skills/selenium_locator_generator/SKILL.md` |
| Script trích xuất DOM | `.agent/skills/selenium_locator_generator/scripts/extract_optimized_dom.js` |
| Quy tắc ưu tiên locator | `.agent/rules/locator-priority.md` |
