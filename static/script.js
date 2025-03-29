document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    let isProcessing = false;

    // Функция плавного появления текста
    async function typeWriter(element, text, speed = 20) {
        element.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // Добавление сообщения с анимацией
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.innerHTML = `<i class="bi bi-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatBox.appendChild(messageDiv);
        
        // Анимация появления сообщения
        setTimeout(() => {
            messageDiv.style.opacity = 1;
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        return contentDiv;
    }

    // Обработчик отправки
    async function handleSend() {
        if (isProcessing) return;
        
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        isProcessing = true;
        userInput.disabled = true;
        sendButton.disabled = true;
        
        // Показываем сообщение пользователя
        addMessage(prompt, true);
        userInput.value = '';
        
        // Индикатор загрузки
        const botContent = addMessage('', false);
        botContent.classList.add('typing-animation');
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            botContent.classList.remove('typing-animation');
            
            if (data.response) {
                await typeWriter(botContent, data.response);
            } else {
                botContent.textContent = data.error || 'Произошла ошибка';
            }
        } catch (error) {
            botContent.textContent = 'Ошибка соединения';
            console.error('Error:', error);
        } finally {
            isProcessing = false;
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }
    
    // Назначение обработчиков
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
});
