/**
 * TỆP XỬ LÝ LOGIC CHO TRANG WEB CHAT AI
 * Chức năng: Gửi tin nhắn, Gọi API OpenRouter, Lưu lịch sử vào trình duyệt.
 */

// --- CẤU HÌNH HỆ THỐNG ---
// Lưu ý: Thay thế chuỗi dưới đây bằng API Key thật của bạn.
const API_KEY = "DÁN_MÃ_SK_OR_V1_CỦA_BẠN_VÀO_ĐÂY".trim();
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Truy xuất các thành phần giao diện từ HTML
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-msg');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');

// --- 1. KHỞI TẠO KHI TẢI TRANG ---
window.onload = () => {
    // Lấy dữ liệu cũ từ bộ nhớ trình duyệt (LocalStorage)
    const savedData = JSON.parse(localStorage.getItem('vinh_chat_history')) || [];
    savedData.forEach(msg => renderMessage(msg.role, msg.content));
};

// --- 2. HÀM HIỂN THỊ TIN NHẮN ---
function renderMessage(role, text) {
    const messageDiv = document.createElement('div');
    // Gán class 'user' hoặc 'ai' để định dạng CSS khác nhau
    messageDiv.className = `bubble ${role}`;
    messageDiv.innerText = text;
    chatDisplay.appendChild(messageDiv);
    
    // Luôn cuộn xuống tin nhắn mới nhất
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// --- 3. HÀM XỬ LÝ GỬI TIN NHẮN VÀ GỌI API ---
async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return; // Không gửi nếu ô nhập trống

    // Hiển thị tin nhắn người dùng và lưu lại
    renderMessage('user', text);
    saveChatStep('user', text);
    userInput.value = '';

    // Tạo thông báo chờ cho AI
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'bubble ai';
    loadingDiv.innerText = "AI đang suy nghĩ...";
    chatDisplay.appendChild(loadingDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                // CHỈ sử dụng ký tự Latinh chuẩn trong Header để tránh lỗi ISO-8859-1
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost", 
                "X-Title": "Kind AI Web Version"
            },
            body: JSON.stringify({
                "model": "openrouter/auto", // Tự động chọn mô hình tối ưu
                "messages": [{ "role": "user", "content": text }]
            })
        });

        // Kiểm tra nếu có lỗi từ phía máy chủ (ví dụ: Sai Key - 401)
        if (!response.ok) {
            const errorInfo = await response.json();
            throw new Error(errorInfo.error?.message || `Error code: ${response.status}`);
        }

        const result = await response.json();
        const aiReply = result.choices[0].message.content;

        // Xóa dòng thông báo chờ và hiển thị câu trả lời thật
        chatDisplay.removeChild(loadingDiv);
        renderMessage('ai', aiReply);
        saveChatStep('ai', aiReply);

    } catch (err) {
        // Xử lý và hiển thị lỗi trực quan
        loadingDiv.style.color = "red";
        loadingDiv.innerText = "❌ Lỗi: " + err.message;
        console.error("Lỗi chi tiết:", err);
    }
}

// --- 4. HÀM LƯU TRỮ DỮ LIỆU ---
function saveChatStep(role, content) {
    const history = JSON.parse(localStorage.getItem('vinh_chat_history')) || [];
    history.push({ role, content });
    localStorage.setItem('vinh_chat_history', JSON.stringify(history));
}

// --- 5. ĐĂNG KÝ SỰ KIỆN ---
sendBtn.onclick = handleSendMessage;

// Gửi tin nhắn khi nhấn phím Enter
userInput.onkeypress = (event) => {
    if (event.key === 'Enter') handleSendMessage();
};

// Xóa sạch lịch sử khi nhấn nút Xóa
clearBtn.onclick = () => {
    if (confirm("Bạn có chắc muốn xóa hết lịch sử trò chuyện?")) {
        localStorage.removeItem('vinh_chat_history');
        chatDisplay.innerHTML = '';
    }
};