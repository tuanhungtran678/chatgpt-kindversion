// Đảm bảo API_KEY không chứa ký tự lạ hoặc khoảng trắng xuống dòng
const API_KEY = "DÁN_MÃ_CỦA_BẠN_VÀO_ĐÂY".trim(); 
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function startChat() {
    const message = input.value.trim();
    if (!message) return;

    renderBubble('user', message);
    saveToLocal('user', message);
    input.value = '';

    const loading = document.createElement('div');
    loading.className = 'bubble ai';
    loading.innerText = "Đang suy nghĩ...";
    display.appendChild(loading);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                // headers PHẢI là ký tự Latinh chuẩn (ISO-8859-1)
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost", 
                "X-Title": "Friendly AI Chat" // TUYỆT ĐỐI KHÔNG để tiếng Việt có dấu ở đây
            },
            body: JSON.stringify({
                "model": "openrouter/auto", 
                "messages": [{ "role": "user", "content": message }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "Lỗi máy chủ");
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        display.removeChild(loading);
        renderBubble('ai', reply);
        saveToLocal('ai', reply);

    } catch (e) {
        loading.innerText = "❌ Lỗi: " + e.message;
        loading.style.color = "red";
        console.error("Chi tiết lỗi:", e);
    }
}