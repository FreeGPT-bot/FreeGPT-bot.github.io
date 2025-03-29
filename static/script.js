document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Функция добавления сообщения
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.innerHTML = `<i class="bi bi-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Обработчик отправки
    async function sendMessage() {
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        // Показываем сообщение пользователя сразу
        addMessage(prompt, true);
        userInput.value = '';
        
        // Индикатор загрузки
        const loadingMsg = addMessage("Arbyz AI печатает...", false);
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            // Заменяем индикатор на ответ
            loadingMsg.querySelector('.message-content').textContent = 
                data.response || data.error || "Пустой ответ";
                
        } catch (error) {
            loadingMsg.querySelector('.message-content').textContent = 
                "Ошибка соединения";
            console.error("Ошибка:", error);
        }
    }
    
    // Назначение обработчиков
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
});
