document.addEventListener('DOMContentLoaded', function() {
    console.log("Скрипт загружен!"); // Проверка загрузки JS
    
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    // Проверка элементов
    if (!chatBox || !userInput || !sendButton) {
        console.error("Не найдены элементы интерфейса!");
        return;
    }
    console.log("Все элементы найдены");

    // Функция добавления сообщения
    function addMessage(text, isUser) {
        console.log(`Добавляем сообщение: ${text}`);
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">
                <i class="bi bi-clock"></i> ${new Date().toLocaleTimeString()}
            </div>
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    // Обработчик кнопки
    sendButton.addEventListener('click', async function() {
        console.log("Кнопка нажата!");
        
        const prompt = userInput.value.trim();
        if (!prompt) {
            console.warn("Пустой запрос");
            return;
        }
        
        console.log("Отправляем запрос:", prompt);
        const userMsg = addMessage(prompt, true);
        userInput.value = '';
        
        // Индикатор загрузки
        const botMsg = addMessage("Arbyz AI набирает ответ...", false);
        botMsg.querySelector('.message-content').classList.add('typing');
        
        try {
            console.log("Отправка запроса на сервер...");
            const startTime = Date.now();
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            console.log("Ответ получен, статус:", response.status);
            
            const data = await response.json();
            console.log("Данные ответа:", data);
            
            // Удаляем индикатор и показываем ответ
            botMsg.querySelector('.message-content').textContent = '';
            botMsg.querySelector('.message-content').classList.remove('typing');
            
            if (data.response) {
                botMsg.querySelector('.message-content').textContent = data.response;
            } else {
                botMsg.querySelector('.message-content').textContent = 
                    data.error || "Неизвестная ошибка сервера";
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            botMsg.querySelector('.message-content').textContent = 
                "Ошибка соединения с сервером";
        }
    });

    // Обработчик Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log("Нажат Enter");
            sendButton.click();
        }
    });
    
    console.log("Инициализация завершена");
});
