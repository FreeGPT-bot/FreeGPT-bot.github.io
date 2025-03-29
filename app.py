from flask import Flask, render_template, request, jsonify
from g4f import ChatCompletion

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        prompt = request.json.get('prompt')
        response = ChatCompletion.create(
            model='gpt-4',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
