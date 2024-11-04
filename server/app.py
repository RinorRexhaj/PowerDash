from flask import Flask, jsonify, request
from flask_cors import CORS
from rake_nltk import Rake
import nltk
from nltk import pos_tag, word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet, stopwords
nltk.download('stopwords')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
rake_nltk_var = Rake()
lemmatizer = WordNetLemmatizer()

@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

@app.route('/prompt', methods=['POST'])
def analyze_prompt():
    data = request.json 
    prompt = data["prompt"]
    if not prompt:
        return jsonify({"error": "No 'prompt' field provided in the request data"}), 400
    words = word_tokenize(prompt)
    pos_tags = pos_tag(words)
    lemmas = [
        {"word": lemmatizer.lemmatize(word), "type": pos}
        for word, pos in pos_tags
    ]
    synonyms = get_synonyms(words)
    return jsonify({"words": lemmas, "synonyms": synonyms})
    
@app.route('/lemma', methods=['POST'])
def lemmatize_columns():
    data = request.json 
    lemmatizer = WordNetLemmatizer()
    if "columns" in data:
        lemmatized_words = [lemmatizer.lemmatize(word) for word in data["columns"]]
        return jsonify(lemmatized_words)
    else:
        return jsonify({"error": "No 'columns' field provided in the request data"}), 400
    
def get_synonyms(keywords):
    synonyms_dict = {}
    for word in keywords:
        synonyms = set() 
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                synonyms.add(lemma.name())
        synonyms_dict[word] = list(synonyms)
    return synonyms_dict

if __name__ == '__main__':
    app.run(debug=True)
