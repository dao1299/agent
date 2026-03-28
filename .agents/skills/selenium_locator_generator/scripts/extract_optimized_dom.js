// Function để inject và chạy trên trình duyệt đang được mở
function extractOptimizedDOM() {
    // 1. Chỉ nhắm vào các thẻ có khả năng tương tác hoặc hiển thị dữ liệu (forms/links/buttons)
    const interactableSelectors = 'button, input, a, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
    const elements = document.querySelectorAll(interactableSelectors);
    
    const uiComponents = [];

    elements.forEach((el, index) => {
        // 2. Bỏ qua các element bị ẩn trên UI (chiêu bài kinh điển của automation QA)
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.hasAttribute('hidden')) return;

        // 3. Lọc class: Bỏ qua các class động của CSS framework / Utility classes (Tailwind, Styled-components...)
        let cleanClasses = [];
        if (el.classList.length > 0) {
            cleanClasses = Array.from(el.classList).filter(c => 
                !c.match(/[0-9a-zA-Z]{5,}/) && // Bỏ qua hash random
                !c.includes('-')               // Tùy chọn: hạn chế Tailwind classes (flex-row, mt-4). Bỏ dòng này nếu dùng BEM naming convention.
            ); 
        }

        // 4. Trích xuất Text một cách an toàn
        let elementText = el.innerText ? el.innerText.trim() : "";
        if (elementText.length > 50) {
            elementText = elementText.substring(0, 50) + "..."; // Chống token bloat cho LLM
        }

        // 5. Đóng gói thông tin cốt lõi
        const elementData = {
            tag: el.tagName.toLowerCase(),
            text: elementText || null,
            id: (el.id && !el.id.match(/\d{3,}/)) ? el.id : null, // Bỏ qua dynamic ID chứa nhiều số
            name: el.getAttribute('name') || null,
            testId: el.getAttribute('data-testid') || el.getAttribute('data-qa') || el.getAttribute('data-cy') || null,
            ariaLabel: el.getAttribute('aria-label') || null,
            type: el.getAttribute('type') || null,
            placeholder: el.getAttribute('placeholder') || null,
            classes: cleanClasses.length > 0 ? cleanClasses.join('.') : null
        };

        // 6. Điều kiện tiên quyết: Chỉ đưa vào mảng JSON nếu element này có ít nhất 1 dấu hiệu nhận biết để test
        if (elementData.text || elementData.id || elementData.name || elementData.testId || elementData.ariaLabel) {
            uiComponents.push(elementData);
        }
    });

    // Output JSON string để hệ thống Agent xử lý
    return JSON.stringify(uiComponents, null, 2);
}
// Nếu chạy dưới dạng console snippet:
// console.log(extractOptimizedDOM());
