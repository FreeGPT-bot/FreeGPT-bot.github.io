async function sendMessage() {
    const prompt = userInput.value.trim();
    if (!prompt) return;
    
    // Показываем сообщение пользователя
    addMessage(prompt, true);
    userInput.value = '';
    
    // Показываем индикатор загрузки
    const loadingMsg = addMessage("Arbyz AI думает...", false);
    loadingMsg.querySelector('.message-content').classList.add('typing');
    
    try {
        const startTime = Date.now();
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        // Имитируем задержку для плавности (минимум 1 сек)
        const minDelay = 1000 - (Date.now() - startTime);
        if (minDelay > 0) await new Promise(r => setTimeout(r, minDelay));
        
        // Заменяем индикатор на ответ
        if (data.response) {
            loadingMsg.querySelector('.message-content').textContent = '';
            await typeWriter(loadingMsg.querySelector('.message-content'), data.response);
        } else {
            loadingMsg.querySelector('.message-content').textContent = 
                data.error || "Неизвестная ошибка";
        }
    } catch (err) {
        loadingMsg.querySelector('.message-content').textContent = 
            "Ошибка соединения с сервером";
        console.error("Fetch error:", err);
    } finally {
        loadingMsg.querySelector('.message-content').classList.remove('typing');
    }
}
