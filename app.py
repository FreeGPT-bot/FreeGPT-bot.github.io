from flask import Flask, request, jsonify, render_template
from g4f.client import Client
import asyncio
import concurrent.futures

app = Flask(__name__)

# Создаем пул потоков для асинхронных задач
executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

async def async_chat(prompt):
    try:
        client = Client()
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Ошибка нейросети: {str(e)}"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    prompt = request.json.get('prompt')
    
    # Запускаем асинхронную функцию в отдельном потоке
    future = executor.submit(
        lambda p: asyncio.run(async_chat(p)),
        prompt
    )
    
    try:
        result = future.result(timeout=30)  # Таймаут 30 секунд
        return jsonify({"response": result})
    except concurrent.futures.TimeoutError:
        return jsonify({"error": "Превышено время ожидания"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
