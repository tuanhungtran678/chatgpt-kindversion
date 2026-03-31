// --- CẤU HÌNH API ---
const API_KEY = "DÁN_MÃ_SK_OR_V1_CỦA_BẠN_VÀO_ĐÂY";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const display = document.getElementById('chat-display');
const input = document.getElementById('user-msg');
const sendBtn = document.getElementById('send-btn');

// Tải lịch sử từ trình duyệt
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem('my_chat_history')) || [];
    saved.forEach(m => renderBubble(m.role, m.content));
};

function renderBubble(role, text) {
    const div = document.createElement('div');
    div.className = `bubble ${role}`;
    div.innerText = text;
    display.appendChild(div);
    display.scrollTop = display.scrollHeight;
}

async function startChat() {
    const message = input.value.trim();
    if (!message) return;

    renderBubble('user', message);
    saveToLocal('user', message);
    input.value = '';

    const loading = document.createElement('div');
    loading.className = 'bubble ai';
    loading.innerText = "Chờ tôi suy nghĩ chút...";
    display.appendChild(loading);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin, // Bắt buộc cho OpenRouter
                "X-Title": "Local AI Chat"
            },
            body: JSON.stringify({
                "model": "openrouter/auto", 
                "messages": [{ "role": "user", "content": message }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Lỗi xác thực API");
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        display.removeChild(loading);
        renderBubble('ai', reply);
        saveToLocal('ai', reply);

    } catch (e) {
        loading.innerText = "❌ Lỗi: " + e.message;
        loading.style.color = "red";
    }
}

function saveToLocal(role, content) {
    const history = JSON.parse(localStorage.getItem('my_chat_history')) || [];
    history.push({ role, content });
    localStorage.setItem('my_chat_history', JSON.stringify(history));
}

sendBtn.onclick = startChat;
input.onkeypress = (e) => { if(e.key === 'Enter') startChat(); };
document.getElementById('clear-btn').onclick = () => {
    localStorage.clear();
    display.innerHTML = '';
};