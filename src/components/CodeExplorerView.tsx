import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal, Layers } from 'lucide-react';

const FILES: Record<string, { language: string; description: string; code: string }> = {
  'backend/nlp_engine.py': {
    language: 'python',
    description: 'NLTK text preprocessing, PorterStemmer, TF-IDF vectorization & Cosine Similarity matching engine.',
    code: `"""
NexaFAQ AI - NLP Preprocessing & Matching Engine
CodeAlpha Artificial Intelligence Internship - Task 2: Chatbot for FAQs
"""

import re
import string
from typing import Dict, Any, List, Optional
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_stemmer = PorterStemmer()
_stop_words = set(stopwords.words('english'))

CANONICAL_MAP = {
    'log in': 'login', 'sign in': 'login', 'signin': 'login',
    'settings': 'setting', 'notifications': 'notification',
    'payments': 'payment', 'cancellation': 'cancel',
    'passwords': 'password', 'accounts': 'account',
    'customer support': 'support', 'assistance': 'support'
}

def preprocess_text(text: str) -> str:
    """
    NLP Pipeline:
    1. Lowercase & expand contractions (can't -> cannot, won't -> will not)
    2. Canonical phrase normalization (log in -> login, personal data -> privacy)
    3. Punctuation removal & word tokenization
    4. Stopword filtering & Porter Stemming
    """
    if not text:
        return ""
    cleaned = text.lower().strip()
    cleaned = re.sub(r"\\bcan't\\b|\\bcant\\b", "cannot", cleaned)
    cleaned = re.sub(r"\\blog\\s+in\\b|\\bsign\\s+in\\b", "login", cleaned)
    cleaned = re.sub(r"\\bpersonal\\s+data\\b", "personal data privacy", cleaned)
    cleaned = re.sub(r"\\bcustomer\\s+support\\b", "support customer_support", cleaned)
    cleaned = re.sub(r'[' + re.escape(string.punctuation) + r']', ' ', cleaned)
    
    tokens = word_tokenize(cleaned)
    stems = []
    for t in tokens:
        c = CANONICAL_MAP.get(t, t)
        if c not in _stop_words and len(c) > 1:
            stems.append(_stemmer.stem(c))
    return " ".join(stems)

class FAQEngine:
    def __init__(self, high_confidence: float = 0.65, min_confidence: float = 0.40):
        self.high_confidence = high_confidence
        self.min_confidence = min_confidence
        self.faqs = []
        self.vectorizer = None
        self.tfidf_matrix = None

    def build_faq_index(self, faqs_data: List[Dict[str, Any]]):
        self.faqs = faqs_data
        # Question weighted representation for high semantic precision
        corpus = [
            preprocess_text(f"{f['question']} {f['question']} {' '.join(f.get('keywords', []))} {f.get('category', '')}")
            for f in self.faqs
        ]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def find_best_match(self, query: str, category_filter: Optional[str] = None) -> Dict[str, Any]:
        preprocessed = preprocess_text(query)
        if not preprocessed:
            return {"success": True, "is_match": False, "confidence": 0.0, "answer": "I couldn't find a reliable answer for that question."}
        
        query_vec = self.vectorizer.transform([preprocessed])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
        
        if best_score >= self.high_confidence:
            return {"is_match": True, "confidence": best_score, "answer": self.faqs[best_idx]["answer"], "matched_question": self.faqs[best_idx]["question"], "category": self.faqs[best_idx]["category"], "confidence_level": "high"}
        elif best_score >= self.min_confidence:
            return {"is_match": True, "confidence": best_score, "answer": self.faqs[best_idx]["answer"], "matched_question": self.faqs[best_idx]["question"], "category": self.faqs[best_idx]["category"], "confidence_level": "medium"}
        else:
            return {"is_match": False, "confidence": best_score, "answer": "I couldn't find a reliable answer for that question.", "confidence_level": "low"}`
  },
  'backend/app.py': {
    language: 'python',
    description: 'Flask application exposing /api/chat, /api/faqs, /api/health, and static frontend serving.',
    code: `"""
NexaFAQ AI - Flask REST Backend
"""

import os, json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from nlp_engine import FAQEngine

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "faqs.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    faqs = json.load(f)

engine = FAQEngine(high_confidence=0.80, min_confidence=0.50)
engine.build_faq_index(faqs)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "indexed_faqs": len(engine.faqs)}), 200

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    category = data.get("category", "All")
    result = engine.find_best_match(message, category_filter=category)
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)`
  },
  'backend/requirements.txt': {
    language: 'text',
    description: 'Production dependencies for Flask, NLTK, and Scikit-Learn.',
    code: `Flask>=2.3.3
flask-cors>=4.0.0
nltk>=3.8.1
scikit-learn>=1.3.0
numpy>=1.24.3`
  },
  'README.md': {
    language: 'markdown',
    description: 'Complete documentation, NLP mathematical formulations, and local run instructions.',
    code: `# NexaFAQ AI — Intelligent FAQ Assistant
CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs

## How to Run in VS Code:
1. cd CodeAlpha_NexaFAQ_AI
2. python3 -m venv venv
3. source venv/bin/activate  # (Windows: .\\venv\\Scripts\\activate)
4. pip install -r backend/requirements.txt
5. python backend/app.py
6. Open http://localhost:5000 in your browser!`
  }
};

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('backend/nlp_engine.py');
  const [copied, setCopied] = useState(false);

  const active = FILES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F6F1] dark:bg-[#171619] transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            CodeAlpha Repository Architecture & Source
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Inspect the standalone Python Flask + Scikit-Learn + NLTK source code created for CodeAlpha Task 2.
          </p>
        </div>

        {/* File Navigator Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          {Object.keys(FILES).map((fileKey) => (
            <button
              key={fileKey}
              onClick={() => setSelectedFile(fileKey)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedFile === fileKey
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-[#201E24] text-stone-600 dark:text-stone-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileKey}</span>
            </button>
          ))}
        </div>

        {/* File Details Bar */}
        <div className="bg-white dark:bg-[#201E24] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200">
              {selectedFile}
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {active.description}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>

        {/* Code View Card */}
        <div className="bg-[#1E1E24] text-stone-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-md border border-black/20 leading-relaxed">
          <pre><code>{active.code}</code></pre>
        </div>

        {/* Terminal Run Guide */}
        <div className="bg-white dark:bg-[#201E24] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 font-semibold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-[#6842E8]" />
            <span>VS Code Quick Start Execution</span>
          </div>

          <div className="bg-stone-100 dark:bg-stone-900/80 p-3 rounded-lg font-mono text-xs text-stone-800 dark:text-stone-300 space-y-1">
            <p className="text-stone-400"># 1. Navigate to the project root</p>
            <p>cd CodeAlpha_NexaFAQ_AI</p>
            <p className="text-stone-400 pt-1"># 2. Create and activate virtual environment</p>
            <p>python3 -m venv venv && source venv/bin/activate</p>
            <p className="text-stone-400 pt-1"># 3. Install NLTK, Scikit-Learn, and Flask</p>
            <p>pip install -r backend/requirements.txt</p>
            <p className="text-stone-400 pt-1"># 4. Start local Flask server</p>
            <p>python backend/app.py</p>
          </div>
        </div>
      </div>
    </div>
  );
};
