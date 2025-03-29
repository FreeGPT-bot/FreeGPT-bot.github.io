from flask import Flask, request, jsonify, render_template
from g4f.client import Client
import threading

app = Flask(__name__)
client = Client()
lock = threading.Lock()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        prompt = request.json.get('prompt')
        if not prompt:
            return jsonify({"error": "Пустой запрос"}), 400
        
        with lock:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                timeout=60  # Увеличенный таймаут
            )
            return jsonify({"response": response.choices[0].message.content})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
