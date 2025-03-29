document.getElementById('sendButton').addEventListener('click', async () => {
    const prompt = document.getElementById('userInput').value;
    if (!prompt) return;

    // Добавляем сообщение пользователя
    addMessage(prompt, 'user');
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        addMessage(data.response, 'bot');
    } catch (error) {
        addMessage('Ошибка соединения', 'error');
    }
});

function addMessage(text, type) {
    const chatBox = document.getElementById('chatBox');
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
}
