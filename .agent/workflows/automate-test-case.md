# Workflow: Tự động hóa Manual Test Case

Quy trình điều phối 3 agent (Explorer → Coder → Debugger) để chuyển đổi Manual Test Case sang Java NetAT Script hoàn chỉnh.

## Tổng quan Pipeline

```
User Input (Manual Test Case + URL)
    │
    ▼
┌─────────────────────┐
│  Agent 1: Explorer   │  ← Mở web, trích DOM, tạo ObjectUI JSON
│  (agent1_explorer)   │
└─────────┬───────────┘
          │ Quality Gate: Kiểm tra ObjectUI đầy đủ?
          ▼
┌─────────────────────┐
│  Agent 2: Coder      │  ← Đọc ObjectRepository, sinh code Java TestNG
│  (agent2_coder)      │
└─────────┬───────────┘
          │ Kiểm tra: File .java đã tạo xong?
          ▼
┌─────────────────────┐
│  Agent 3: Debugger   │  ← Chạy Maven, phân tích lỗi, tự sửa
│  (agent3_debugger)   │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
  PASS        FAIL
    │           │
    ▼           ▼
 Báo cáo    Quay lại Agent 1
 thành công  (Self-Healing Loop)
```

## Quy trình Chi tiết

### Bước 1: Lập kế hoạch & Giao việc cho Agent 1 (Explorer)

**Input:** Test Case Manual từ User (URL, steps, credentials, ghi chú).

**Hành động:**
1. Xác định target URLs và danh sách steps từ test case.
2. Kích hoạt `agent1_explorer` để thực thi việc lấy toàn bộ ObjectUI.
3. **Quality Gate** sau khi Agent 1 hoàn thành:
   - File JSON sinh ra đủ cho tất cả element trong test case chưa?
   - Tên biến đã mapping vào `ObjectRepository.java` đúng chuẩn `PROJECT_DESCRIPTION.md` chưa?
   - Nếu thiếu: yêu cầu Agent 1 bổ sung trước khi chuyển sang bước tiếp.

### Bước 2: Giao việc cho Agent 2 (Coder)

**Input:** Test Case Manual + Danh sách biến ObjectRepository (từ Agent 1).

**Hành động:**
1. Chuyển toàn bộ context cho `agent2_coder`.
2. Đợi Agent 2 tạo ra file `.java` TestNG script hoàn tất.
3. Kiểm tra file `.java` có đúng cấu trúc (import, annotation, method naming).

### Bước 3: Giao việc cho Agent 3 (Debugger)

**Input:** Tên Class Java script vừa tạo.

**Hành động:**
1. Truyền lệnh `mvn clean test -Dtest=[Tên_Script]` cho `agent3_debugger`.
2. Chờ nhận kết quả test (PASS/FAIL).

### Bước 4: Định tuyến vòng lặp (Self-Healing Routing)

| Kết quả Agent 3 | Hành động |
|---|---|
| **PASS 100%** | Tổng hợp báo cáo thành công cho User |
| **FAIL do DOM sai/UI thay đổi** | Gọi lại Agent 1 → Agent 2 → Agent 3 |
| **FAIL do lỗi code** | Agent 3 tự sửa (tối đa 3 lần) |
| **FAIL quá 3 lần** | Báo cáo lỗi chi tiết cho User |

## Ví dụ Luồng E2E

**User Input:** "Hãy automate test case: Đăng nhập thành công. URL: https://example.com. User: admin/123."

1. Agent 1 mở browser, navigate đến URL.
2. Agent 1 gọi `extract_optimized_dom.js`, tìm locator `[name='username']`.
3. Agent 1 tạo `input_username.json` (UUID, strategy=NAME).
4. Agent 1 nhập "admin" qua Playwright, tiếp tục cho Password và Button.
5. Agent 1 cập nhật `ObjectRepository.java` với 3 hằng số mới.
6. Agent 2 sinh `LoginWithValidCredentials.java` với TestNG + NetAT keywords.
7. Agent 3 chạy `mvn clean test`, kiểm tra kết quả.
8. Nếu PASS → Báo cáo hoàn thành.

## Tài nguyên tham chiếu

- `PROJECT_DESCRIPTION.md` — Chuẩn ObjectUI để QA chéo nghiệm thu
- `PROMPT_WORKFLOW.md` — Ngữ cảnh tổng thể hệ thống
- `.agent/rules/` — Quy tắc code style, kiến trúc, locator priority
