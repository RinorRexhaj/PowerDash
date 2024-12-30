from flask import Flask, jsonify, request
from flask_cors import CORS
import spacy
import re
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
nlp = spacy.load("en_core_web_sm")
lemmatizer = WordNetLemmatizer()

actions = [
    ["filter", "remove", "refine", "include", "exclude", "segment", "narrow", "without"],
    ["select", "choose", "retrieve", "query", "isolate", "highlight", "subset", "show", "pick", "extract", "return"],
    ["sort", "order", "rank", "organize", "arrange", "rank", "sequence", "prioritize", "order by", "align", "categorize"],
    ["chart", "graph", "plot", "diagram", "tableau", "presentation", "display"],
]

parameters = [
    {
        "type": "less",
        "actions": ["select", "filter"],
        "keywords": ["less", "lower", "before", "under", "below", "smaller", "fewer"]
    },
    {
        "type": "more",
        "actions": ["select", "filter"],
        "keywords": ["more", "higher", "after", "over", "above", "larger", "greater", "bigger"]
    },
    {
        "type": "between",
        "actions": ["select", "filter"],
        "keywords": ["between", "middle", "range", "interval", "from", "to", "within", "spanning"]
    },
    {
        "type": "top",
        "actions": ["select", "filter"],
        "keywords": ["top", "most", "best", "first", "highest", "leading", "maximum", "max", "peak", "uppermost", "upmost", "prime", "foremost", "elite", "superior", "earliest"]
    },
    {
        "type": "bottom",
        "actions": ["select", "filter"],
        "keywords": ["bottom", "lowest", "last", "least", "minimum", "min", "trailing", "end", "base", "foot", "tail", "inferior", "latest"]
    }, 
    {
        "type": "ascending",
        "actions": ["sort"],    
        "keywords": ["ascending", "ascend", "upward", "increasing", "a-z", "z", "chronological", "earliest", "highest"]
    },
    {
        "type": "descending",
        "actions": ["sort"],
        "keywords": ["descending", "descend", "downward", "decreasing", "z-a", "a", "reverse", "latest", "lowest"]
    }
]

columns = set()

action_type = None
parameter = None
column = None
value = None
fallback_column = None
fallback_action = None

@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

@app.route('/create', methods=['POST'])
def create_prompt():
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
    return jsonify({"words": lemmas})

@app.route('/search', methods=['POST'])
def analyze_prompt():
    data = request.json 
    prompt = data["prompt"]
    if not prompt:
        return jsonify({"error": "No 'prompt' field provided in the request data"}), 400
    doc = nlp(prompt)
    lemmas = [
        {
            "a_text": token.text,        
            "word": token.lemma_,    
            "pos": token.pos_,        
            "tag": token.tag_,        
            "dep": token.dep_,        
            "head": token.head.text,  
            "is_stop": token.is_stop  
        }
        for token in doc
    ]
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    actions_parameters = extract_actions_and_parameters(lemmas)
    return jsonify({"words": lemmas, "entities": entities, "actions": actions_parameters})
    
@app.route('/lemma', methods=['POST'])
def lemmatize_columns():
    data = request.json 
    if "cols" in data:
        lemmatized_words = []
        for col in data["cols"]:
            doc = nlp(col)
            newCol = " ".join([token.lemma_ for token in doc])
            lemmatized_words.append(newCol)
            columns.add(newCol)
        return jsonify(lemmatized_words)
    else:
        return jsonify({"error": "No 'columns' field provided in the request data"}), 400
    
def extract_actions (prompt):
    actions_arr = set()
    prompt = [word.lower() for word in prompt]
    for action in actions:
        for word in action:
            if word in prompt:
                actions_arr.add(action[0])
    return list(actions_arr)

def get_parameter_type(word):
    params_set = set()
    words = [w.lower() for w in word]
    prompt = " ".join(words)

    for word in words:
        for param, action in parameters, actions:
            action_parameter = {}
            act = ""
            paramt = ""
            if word in action:
                act = action[0]
            if word in param["keywords"]:
                params_set.add(param["type"])
    return list(params_set)

def extract_actions_and_parameters(prompt):
    words = [w["word"].lower() for w in prompt]
    tokens = [w["a_text"].lower() for w in prompt]
    max_col_length = max(len(col.split(" ")) for col in columns)
    result = []

    def get_action(word):
        for action in actions:
            if word in action:
                return action[0]
        return None

    def get_parameter(word, action):
        for param in parameters:
            if word in param["keywords"] and action in param["actions"]:
                return param["type"]
        return None

    def get_column(words):
        global columns
        words = " ".join(words)
        for column in columns:
            if " ".join(sorted(column.split(" "))) in " ".join(sorted(words.split(" "))):
                return column
            
        best_match = None
        max_matches = 0
        for col in columns:
            col_words = col.split(" ")
            match_count = sum(1 for w in col_words if w in words)
            if match_count > max_matches:
                max_matches = match_count
                best_match = col
        if best_match:
            return best_match
        return None

    def get_value(word):
        if re.match(r"^\d+(\.\d+)?$", word):
            return float(word) if '.' in word else int(word)
        return None
    
    def all_values(sort):
        global fallback_action, fallback_column, action_type, column, parameter, value
        return (action_type or fallback_action) and (column or fallback_column) and (parameter or sort) and (value or sort)

    def reset_values(sort):
        global fallback_action, fallback_column, action_type, column, parameter, value
        fallback_action = "" if sort else action_type
        fallback_column = "" if sort else column
        action_type = ""
        column = ""
        parameter = ""
        value = ""
    
    for i, word in enumerate(words):
        global fallback_action, fallback_column, action_type, column, parameter, value
        if not action_type:
            action_type = get_action(word)
        if not parameter:
            new_action = action_type or fallback_action
            parameter = get_parameter(tokens[i], new_action)
        if not column:
            if not any(word in col.split(" ") for col in columns):
                column = ""
            else:
                column = get_column(words[i:i + max_col_length + 1])
                fallback_column = column if column != "" else ""
        if not value:
            value = get_value(word)
        if action_type == "sort" and not any(action["action"] == "sort" for action in result) and all_values(True):    
            if not parameter or i == len(words) - 1:
                result.append({
                    "action": action_type or fallback_action,
                    "column": column or fallback_column,
                    "parameter": parameter or "ascending"
                })
                reset_values(True)
        elif action_type != "sort" and all_values(False):
            if not column: 
                column = fallback_column
            result.append({
                "action": action_type or fallback_action,
                "column": column or fallback_column,
                "parameter": parameter,
                "value": value
            })
            reset_values(False)

    return result

if __name__ == '__main__':
    app.run(debug=True)
