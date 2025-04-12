from flask import Flask, render_template, request, jsonify
from groq import Groq
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

def generate_response(user_query):
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY", "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"))
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "you are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": user_query,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        logging.error(f"Error generating response: {str(e)}")
        return str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message', '')
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
            
        ai_response = generate_response(user_message)
        return jsonify({'response': ai_response})
    except Exception as e:
        logging.error(f"Chat endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
