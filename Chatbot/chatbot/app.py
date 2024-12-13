from flask import Flask, request, jsonify
from chatbot import process_input
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json['message']
    print(f"User input: {user_input}")

    response = process_input(user_input)
    print(f"Chatbot response: {response}")
    
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001, threaded=True)
print("Flask API is ready.")
