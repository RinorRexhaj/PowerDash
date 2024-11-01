from flask import Flask, jsonify, request
from flask_cors import CORS
from rake_nltk import Rake
import nltk
nltk.download('stopwords')
nltk.download('punkt_tab')
nltk.download('wordnet')
nltk.download('omw-1.4')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

@app.route('/', methods=['POST'])
def receive_data():
    data = request.json 
    print(data)
    rake_nltk_var = Rake()
    if "prompt" in data:
        rake_nltk_var.extract_keywords_from_text(data["prompt"])
        keyword_extracted = rake_nltk_var.get_ranked_phrases()
        return jsonify({"keywords": keyword_extracted})
    else:
        return jsonify({"error": "No 'text' field provided in the request data"}), 400

if __name__ == '__main__':
    app.run(debug=True)
