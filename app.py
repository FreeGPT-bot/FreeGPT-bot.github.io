from flask import Flask, request, jsonify, render_template
from g4f.client import Client
import asyncio
import threading

app = Flask(__name__)

# Создаем отдельный event loop для асинхронных задач
loop = asyncio.new_event_loop()

def run_async(coro):
    def wrapper():
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    return wrapper()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        prompt = request.json.get('prompt')
        client = Client()
        
        # Синхронный вызов асинхронного кода
        response = run_async(
            client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
        )
        
        return jsonify({
            "response": response.choices[0].message.content
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Ошибка нейросети: {str(e)}"
        }), 500

# Запускаем event loop в отдельном потоке
def run_loop():
    asyncio.set_event_loop(loop)
    loop.run_forever()

threading.Thread(target=run_loop, daemon=True).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
