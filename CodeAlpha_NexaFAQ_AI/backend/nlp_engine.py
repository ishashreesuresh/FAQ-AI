"""
NexaFAQ AI - NLP Preprocessing & Matching Engine
CodeAlpha Artificial Intelligence Internship - Task 2: Chatbot for FAQs

This module provides the local NLP pipeline:
- Text Cleaning & Normalization
- Tokenization & Stopwords Removal
- Stemming via PorterStemmer
- TF-IDF Vectorization (Scikit-Learn)
- Cosine Similarity Matching
- Configurable Confidence Scoring
"""

import re
import string
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

# NLP and Machine Learning Libraries
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Ensure required NLTK datasets are downloaded quietly
def ensure_nltk_resources():
    """Ensure punkt and stopwords corpora are available."""
    for resource in ['punkt', 'punkt_tab', 'stopwords']:
        try:
            nltk.data.find(f'tokenizers/{resource}' if 'punkt' in resource else f'corpora/{resource}')
        except LookupError:
            try:
                nltk.download(resource, quiet=True)
            except Exception:
                pass

ensure_nltk_resources()

# Initialize stemmer and stopwords
_stemmer = PorterStemmer()
try:
    _stop_words = set(stopwords.words('english'))
except Exception:
    # Fallback common English stopwords if NLTK corpora download is restricted
    _stop_words = {
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
        "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
        'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's",
        'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
        'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
        'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
        'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
        'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
        'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
        'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'all', 'any',
        'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
        'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're',
        've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't",
        'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't",
        'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn',
        "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't",
        'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
    }


CANONICAL_MAP = {
    'log in': 'login',
    'sign in': 'login',
    'signin': 'login',
    'logged': 'login',
    'logging': 'login',
    'settings': 'setting',
    'notifications': 'notification',
    'payments': 'payment',
    'cancellation': 'cancel',
    'cancelling': 'cancel',
    'canceled': 'cancel',
    'resetting': 'reset',
    'recovering': 'recover',
    'recovery': 'recover',
    'passwords': 'password',
    'invoices': 'invoice',
    'accounts': 'account',
    'profiles': 'profile',
    'supports': 'support',
    'assisting': 'assist',
    'assistance': 'support',
    'helping': 'help',
    'customer support': 'support'
}


def preprocess_text(text: str) -> str:
    """
    NLP preprocessing pipeline:
    1. Lowercase text
    2. Expand contractions (e.g. can't -> cannot)
    3. Normalize canonical variations (log in -> login, personal data -> privacy)
    4. Remove punctuation & special characters
    5. Tokenize into words
    6. Filter stopwords
    7. Perform Porter Stemming
    8. Return cleaned tokens joined as string
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Lowercase
    cleaned = text.lower().strip()

    # 2. Contraction unfolding
    cleaned = re.sub(r"\bcan't\b|\bcant\b", "cannot", cleaned)
    cleaned = re.sub(r"\bwon't\b", "will not", cleaned)
    cleaned = re.sub(r"n't\b", " not", cleaned)
    cleaned = re.sub(r"'re\b", " are", cleaned)
    cleaned = re.sub(r"'s\b", " is", cleaned)
    cleaned = re.sub(r"'d\b", " would", cleaned)
    cleaned = re.sub(r"'ll\b", " will", cleaned)
    cleaned = re.sub(r"'ve\b", " have", cleaned)
    cleaned = re.sub(r"'m\b", " am", cleaned)

    # 3. Canonical domain phrase mapping
    cleaned = re.sub(r"\blog\s+in\b", "login", cleaned)
    cleaned = re.sub(r"\bsign\s+in\b", "login", cleaned)
    cleaned = re.sub(r"\bpersonal\s+data\b", "personal data privacy", cleaned)
    cleaned = re.sub(r"\buser\s+data\b", "user data privacy", cleaned)
    cleaned = re.sub(r"\bcustomer\s+support\b", "support customer_support", cleaned)

    # 4. Remove punctuation and special symbols
    cleaned = re.sub(r'[' + re.escape(string.punctuation) + r']', ' ', cleaned)

    # 5. Tokenize (word_tokenize or regex fallback)
    try:
        tokens = word_tokenize(cleaned)
    except Exception:
        tokens = re.findall(r'\b[a-z0-9]+\b', cleaned)

    # 6. Canonical token mapping, stopword filtering & 7. Stemming
    processed_tokens = []
    for token in tokens:
        canonical = CANONICAL_MAP.get(token, token)
        if canonical not in _stop_words and len(canonical) > 1:
            stemmed = _stemmer.stem(canonical)
            processed_tokens.append(stemmed)

    # If all tokens were filtered out (e.g. very short query of common words), keep stems of raw tokens
    if not processed_tokens and tokens:
        processed_tokens = [_stemmer.stem(CANONICAL_MAP.get(t, t)) for t in tokens if len(t) > 1]

    return " ".join(processed_tokens)


class FAQEngine:
    """
    Vectorization and similarity engine for FAQ retrieval.
    Precomputes the TF-IDF matrix once on startup.
    """

    def __init__(self, high_confidence: float = 0.65, min_confidence: float = 0.40):
        self.high_confidence = high_confidence
        self.min_confidence = min_confidence
        self.faqs: List[Dict[str, Any]] = []
        self.processed_corpus: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.categories: List[str] = []

    def build_faq_index(self, faqs_data: List[Dict[str, Any]]) -> None:
        """
        Builds the TF-IDF index once from the FAQ dataset.
        Combines questions (weighted) + keywords + category for rich representation.
        """
        if not faqs_data:
            raise ValueError("FAQ dataset cannot be empty.")

        self.faqs = faqs_data
        self.categories = sorted(list({faq.get("category", "General") for faq in faqs_data}))
        self.processed_corpus = []

        for faq in self.faqs:
            question = faq.get("question", "")
            keywords = " ".join(faq.get("keywords", []))
            category = faq.get("category", "")
            # Question tokens given priority weight in representation
            combined_text = f"{question} {question} {keywords} {category}"
            preprocessed = preprocess_text(combined_text)
            self.processed_corpus.append(preprocessed)

        # Initialize and fit TF-IDF vectorizer (unigrams and bigrams)
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.processed_corpus)

    def find_best_match(self, query: str, category_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates cosine similarity between user query and all indexed FAQs.
        Applies confidence thresholds (High >= 80%, Medium 50-79%, Low < 50%).
        """
        if not self.vectorizer or self.tfidf_matrix is None:
            return {
                "success": False,
                "error": "FAQ index is not built. Please initialize the engine first."
            }

        cleaned_query = query.strip() if query else ""
        if not cleaned_query:
            return {
                "success": False,
                "error": "Empty message received. Please type a question."
            }

        if len(cleaned_query) < 3:
            return {
                "success": False,
                "error": "Question is too short. Please provide more details."
            }

        processed_query = preprocess_text(cleaned_query)
        if not processed_query:
            # Query only contained filtered symbols or stop words
            return {
                "success": True,
                "is_match": False,
                "confidence": 0.0,
                "confidence_level": "low",
                "answer": "I couldn't find a reliable answer for that question. Please try rephrasing with specific keywords.",
                "suggested_categories": self.categories[:5],
                "sample_questions": [
                    "How can I reset my password?",
                    "Where can I see my payment details?",
                    "How do I contact support?"
                ]
            }

        # Vectorize query
        query_vector = self.vectorizer.transform([processed_query])

        # Compute cosine similarities across the entire corpus
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # If a category filter is active, mask out non-matching categories
        if category_filter and category_filter.lower() != "all":
            filtered_similarities = []
            for i, score in enumerate(similarities):
                if self.faqs[i].get("category", "").lower() == category_filter.lower():
                    filtered_similarities.append((score, i))
                else:
                    filtered_similarities.append((-1.0, i))
            scores_array = np.array([item[0] for item in filtered_similarities])
            best_idx = int(np.argmax(scores_array))
            best_score = float(scores_array[best_idx])
        else:
            best_idx = int(np.argmax(similarities))
            best_score = float(similarities[best_idx])

        # Extract top 3 candidates for alternatives / debugging
        top_indices = np.argsort(similarities)[::-1][:3]
        alternatives = []
        for idx in top_indices:
            if idx != best_idx and similarities[idx] > 0.15:
                alternatives.append({
                    "id": self.faqs[idx]["id"],
                    "question": self.faqs[idx]["question"],
                    "category": self.faqs[idx]["category"],
                    "score": round(float(similarities[idx]), 3)
                })

        confidence_pct = round(best_score * 100, 1)

        # Threshold evaluation
        if best_score >= self.high_confidence:
            confidence_level = "high"
            is_match = True
            answer = self.faqs[best_idx]["answer"]
        elif best_score >= self.min_confidence:
            confidence_level = "medium"
            is_match = True
            answer = self.faqs[best_idx]["answer"]
        else:
            confidence_level = "low"
            is_match = False
            answer = "I couldn't find a reliable answer for that question."

        matched_faq = self.faqs[best_idx] if best_idx >= 0 else None

        result = {
            "success": True,
            "is_match": is_match,
            "confidence": round(best_score, 4),
            "confidence_percentage": confidence_pct,
            "confidence_level": confidence_level,
            "query_preprocessed": processed_query,
            "alternatives": alternatives
        }

        if is_match and matched_faq:
            result.update({
                "answer": answer,
                "category": matched_faq.get("category", "General"),
                "matched_question": matched_faq.get("question", ""),
                "faq_id": matched_faq.get("id"),
                "keywords": matched_faq.get("keywords", [])
            })
        else:
            result.update({
                "answer": answer,
                "category": None,
                "matched_question": None,
                "suggested_categories": self.categories[:5],
                "sample_questions": [
                    "How can I reset my password?",
                    "Where can I see my payment details?",
                    "How do I cancel my subscription?",
                    "How do I contact support?",
                    "What happens to my data?"
                ]
            })

        return result
