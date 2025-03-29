document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    function addMessage(text, isUser) {
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
    }

    sendButton.addEventListener('click', async function() {
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        addMessage(prompt, true);
        userInput.value = '';
        
        const botMessage = addMessage("Обработка запроса...", false);
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            if (data.error) {
                botMessage.querySelector('.message-content').textContent = data.error;
            } else {
                botMessage.querySelector('.message-content').textContent = data.response;
            }
        } catch (error) {
            botMessage.querySelector('.message-content').textContent = 
                "Ошибка соединения с сервером";
        }
    });
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendButton.click();
    });
});
