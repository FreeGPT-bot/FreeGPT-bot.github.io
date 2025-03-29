document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    let currentBotMessage = null;

    // Функция для добавления сообщения с анимацией
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        timeDiv.innerHTML = `<i class="bi bi-clock"></i> ${timeString}`;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        if (!isUser) {
            currentBotMessage = messageDiv;
        }
        
        return messageDiv;
    }

    // Функция для плавного появления текста
    async function typeWriter(element, text, speed = 20) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // Показать индикатор набора
    function showTypingIndicator() {
        if (currentBotMessage) {
            currentBotMessage.querySelector('.message-content').className = 'message-content typing-indicator';
        } else {
            const indicator = addMessage('Arbyz AI набирает ответ...', false);
            currentBotMessage = indicator;
            indicator.querySelector('.message-content').className = 'message-content typing-indicator';
        }
    }

    // Отправить сообщение
    async function sendMessage() {
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        addMessage(prompt, true);
        userInput.value = '';
        showTypingIndicator();
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            if (currentBotMessage) {
                const contentDiv = currentBotMessage.querySelector('.message-content');
                contentDiv.classList.remove('typing-indicator');
                await typeWriter(contentDiv, data.response);
            }
        } catch (error) {
            console.error('Error:', error);
            if (currentBotMessage) {
                currentBotMessage.querySelector('.message-content').textContent = 'Ошибка соединения';
            }
        }
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Первое сообщение
    addMessage('Привет! Я Arbyz AI, ваш нейросетевой помощник. Чем могу помочь?', false);
});
