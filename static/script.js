document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    const imageGenToggle = document.getElementById('imageGenToggle');
    const modelDropdown = document.getElementById('modelDropdown');
    
    let isProcessing = false;
    let currentBotMessage = null;
    let recognition = null;
    let isListening = false;
    let currentModel = 'gpt-4o-mini';
    let isImageGenMode = false;

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
            contentDiv.style.borderRadius = '10px';
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
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                isListening = true;
                voiceButton.classList.add('active');
                addMessage("🎤 Слушаю...", false);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                sendMessage(); // Автоматически отправляем после распознавания
            };

            recognition.onerror = (event) => {
                console.error('Ошибка распознавания:', event.error);
                addMessage(`❌ Ошибка голосового ввода: ${event.error}`, false);
                voiceButton.classList.remove('active');
                isListening = false;
            };

            recognition.onend = () => {
                if (isListening) {
                    recognition.start(); // Продолжаем слушать
                } else {
                    voiceButton.classList.remove('active');
                }
            };

        } catch (e) {
            console.error('Голосовой ввод не поддерживается:', e);
            voiceButton.disabled = true;
            voiceButton.title = 'Голосовой ввод не поддерживается в вашем браузере';
            addMessage("⚠️ Ваш браузер не поддерживает голосовой ввод", false);
        }
    }

    // Обработчик кнопки голосового ввода
    voiceButton.addEventListener('click', async () => {
        if (!recognition) {
            initVoiceRecognition();
            return;
        }

        if (isListening) {
            isListening = false;
            recognition.stop();
        } else {
            try {
                // Запрашиваем разрешение на микрофон
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                
                isListening = true;
                recognition.start();
            } catch (error) {
                console.error('Ошибка доступа к микрофону:', error);
                addMessage("❌ Не удалось получить доступ к микрофону. Пожалуйста, разрешите доступ.", false);
            }
        }
    });

    // Выбор модели
    document.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            currentModel = this.dataset.model;
            modelDropdown.textContent = `Модель: ${currentModel}`;
            addMessage(`✅ Выбрана модель: ${currentModel}`, false);
        });
    });

    // Переключение режима генерации изображений
    imageGenToggle.addEventListener('click', function() {
        isImageGenMode = !isImageGenMode;
        this.classList.toggle('active', isImageGenMode);
        userInput.placeholder = isImageGenMode 
            ? "Опишите изображение для генерации..." 
            : "Введите ваш вопрос...";
        
        addMessage(isImageGenMode 
            ? "🖼️ Режим генерации изображений активирован" 
            : "📝 Режим чата активирован", false);
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
        
        const loadingMsg = addMessage(
            isImageGenMode ? "🎨 Генерирую изображение..." : "✍️ Печатает...", 
            false
        );
        
        try {
            const data = await safeFetch('/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    prompt,
                    model: currentModel,
                    isImageGen: isImageGenMode
                })
            });
            
            chatBox.removeChild(loadingMsg.parentElement);
            
            if (data.error) {
                addMessage(`❌ Ошибка: ${data.error}`, false);
            } else if (isImageGenMode && data.imageUrl) {
                const img = document.createElement('img');
                img.src = data.imageUrl;
                img.style.maxWidth = '100%';
                img.style.borderRadius = '10px';
                addMessage(img, false, true);
            } else if (data.response) {
                addMessage(data.response, false);
            }
        } catch (error) {
            chatBox.removeChild(loadingMsg.parentElement);
            addMessage(`⚠️ Ошибка соединения: ${error.message}`, false);
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
});
