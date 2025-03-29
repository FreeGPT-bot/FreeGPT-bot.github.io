from flask import Flask, request, jsonify, render_template
from g4f.client import Client
import asyncio
from threading import Thread

app = Flask(__name__)
client = Client()

def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        prompt = request.json.get('prompt')
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
