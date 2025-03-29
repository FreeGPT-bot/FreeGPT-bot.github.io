document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    
    let isProcessing = false;
    let currentBotMessage = null;
    let recognition = null;

    // Проверка JSON ответа
    async function parseJSON(response) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : {};
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            throw new Error("Invalid server response");
        }
    }

    // Функция плавного появления текста
    async function typeWriter(element, text, speed = 20) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // Добавление сообщения
    function addMessage(content, isUser, isImage = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = isImage ? document.createElement('img') : document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isImage) {
            contentDiv.src = content;
            contentDiv.style.maxWidth = '100%';
        } else {
            contentDiv.textContent = content;
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.innerHTML = `<i class="bi bi-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        if (!isUser) currentBotMessage = messageDiv;
        return contentDiv;
    }

    // Отправка запроса с обработкой ошибок
    async function safeFetch(url, options) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await parseJSON(response);
        } catch (error) {
            console.error('Fetch error:', error);
            return { error: error.message };
        }
    }

    // Инициализация голосового ввода
    function initVoiceRecognition() {
        try {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
            };
            
            recognition.onerror = function(event) {
                console.error('Voice recognition error', event.error);
                addMessage('⚠️ Ошибка голосового ввода', false);
            };
        } catch (e) {
            console.error('Voice recognition not supported', e);
            voiceButton.disabled = true;
            voiceButton.title = 'Голосовой ввод не поддерживается';
        }
    }

    // Обработчик голосового ввода
    voiceButton.addEventListener('click', function() {
        if (recognition) {
            if (recognition.recording) {
                recognition.stop();
                voiceButton.classList.remove('active');
            } else {
                recognition.start();
                voiceButton.classList.add('active');
            }
        }
    });

    // Отправка сообщения
    async function sendMessage() {
        if (isProcessing) return;
        
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        isProcessing = true;
        userInput.disabled = true;
        sendButton.disabled = true;
        
        addMessage(prompt, true);
        userInput.value = '';
        
        const loadingMsg = addMessage("✍️ Печатает...", false);
        
        try {
            const data = await safeFetch('/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ prompt })
            });
            
            chatBox.removeChild(loadingMsg);
            
            if (data.error) {
                addMessage(`❌ ${data.error}`, false);
            } else {
                addMessage(data.response, false);
            }
        } catch (error) {
            chatBox.removeChild(loadingMsg);
            addMessage("⚠️ Ошибка соединения", false);
        } finally {
            isProcessing = false;
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

    // Инициализация голосового ввода при загрузке
    initVoiceRecognition();
});
