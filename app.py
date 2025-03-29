from flask import Flask, jsonify, render_template, request
from g4f.client import Client  # Используем новый синтаксис g4f
import asyncio

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        prompt = request.json.get('prompt')
        
        # Синхронная обертка для асинхронного кода
        async def get_response():
            client = Client()
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        
        # Запускаем асинхронный код в синхронном контексте
        response = asyncio.run(get_response())
        return jsonify({"response": response})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
