// --- CẤU HÌNH ---
const API_KEY = "YOUR_OPENROUTER_API_KEY"; // Thay mã của bạn vào đây
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');

// 1. Tải lịch sử khi mở trang
window.onload = () => {
    const history = JSON.parse(localStorage.getItem('chatData')) || [];
    history.forEach(m => displayMessage(m.role, m.content));
};

// 2. Hàm hiển thị tin nhắn lên màn hình
function displayMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 3. Hàm lưu vào LocalStorage
function saveChat(role, content) {
    const history = JSON.parse(localStorage.getItem('chatData')) || [];
    history.push({ role, content });
    localStorage.setItem('chatData', JSON.stringify(history));
}

// 4. Hàm chính: Gửi tin nhắn và gọi API
async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    displayMessage('user', message);
    saveChat('user', message);
    userInput.value = '';

    // Hiển thị trạng thái chờ
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai';
    typingIndicator.innerText = "AI đang suy nghĩ...";
    chatBox.appendChild(typingIndicator);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openrouter/auto", // Tự động chọn model tốt nhất/miễn phí
                "messages": [
                    {"role": "user", "content": message}
                ]
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        // Xóa dòng "đang suy nghĩ" và hiện câu trả lời thật
        chatBox.removeChild(typingIndicator);
        displayMessage('ai', aiText);
        saveChat('ai', aiText);

    } catch (error) {
        typingIndicator.innerText = "Lỗi: Không thể kết nối API. Hãy kiểm tra Key!";
        console.error(error);
    }
}

// Sự kiện nút bấm
sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === 'Enter') handleChat(); };
clearBtn.onclick = () => {
    localStorage.removeItem('chatData');
    chatBox.innerHTML = '';
};