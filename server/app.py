from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

@app.route('/', methods=['POST'])
def receive_data():
    data = request.json
    return jsonify({"received_data": data})

if __name__ == '__main__':
    app.run(debug=True)
