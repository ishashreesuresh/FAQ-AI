# NexaFAQ AI — Intelligent FAQ Assistant

> **CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs**  
> Developed as a production-grade, local Natural Language Processing (NLP) FAQ retrieval system.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-black.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/NLP-Scikit--Learn-orange.svg)](https://scikit-learn.org/)
[![NLTK](https://img.shields.io/badge/Tokenization-NLTK-green.svg)](https://www.nltk.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 1. Project Overview

**NexaFAQ AI** is an intelligent conversational FAQ assistant built to solve the common pitfalls of rigid keyword-based bots and expensive external API dependencies. Rather than relying on simple `if/else` checks or third-party paid LLMs, NexaFAQ AI implements an authentic **Local Natural Language Processing (NLP) pipeline** utilizing **TF-IDF Vectorization** and **Cosine Similarity** to compute semantic question similarity directly in real-time.

The application allows users to ask questions in plain, unstructured English, maps user intents against a curated 55+ question domain knowledge base across 10 business domains, and returns high-accuracy responses backed by statistical similarity scores.

---

## 2. Core Processing Pipeline

Every user query undergoes a 7-stage deterministic NLP workflow:

```
User Question
      │
      ▼
1. Text Cleaning (Lowercase, symbol/punctuation stripping)
      │
      ▼
2. NLP Preprocessing (Whitespace normalization, NLTK tokenization)
      │
      ▼
3. Stopword Removal & Porter Stemming (Root word normalization)
      │
      ▼
4. TF-IDF Vectorization (Precomputed vocabulary transform)
      │
      ▼
5. Cosine Similarity Calculation (Dot product of normalized vectors)
      │
      ▼
6. Confidence Threshold Evaluation (High >=80%, Medium 50-79%, Low <50%)
      │
      ▼
7. Chatbot Response & "Why this answer?" Explanation
```

---

## 3. Technology Stack

- **Backend Framework**: Python 3.10+, Flask, Flask-CORS
- **Natural Language Processing**: NLTK (`punkt`, `stopwords`, `PorterStemmer`)
- **Machine Learning / Vectorization**: Scikit-Learn (`TfidfVectorizer`, `cosine_similarity`), NumPy
- **Knowledge Base**: Structured JSON dataset (`data/faqs.json`) featuring 55+ curated items across 10 functional business categories
- **Frontend Interface**: Semantic HTML5, Modular CSS3 with CSS variables (Light/Dark mode), Vanilla ES6+ JavaScript
- **Local Development**: Fully runnable in VS Code with virtual environments

---

## 4. How NLP Matching Works

### 4.1 Preprocessing Pipeline (`preprocess_text`)
1. **Case Normalization**: Converts all text to lowercase to ensure consistency.
2. **Punctuation Stripping**: Strips special punctuation characters while preserving word stems.
3. **Tokenization**: Breaks strings into constituent token arrays using NLTK `word_tokenize`.
4. **Stopword Filtering**: Removes syntactical filler words (e.g., `the`, `is`, `at`, `which`, `on`) using NLTK's English stopword set.
5. **Stemming**: Applies the algorithmic Porter Stemmer to reduce inflectional forms to common base stems (e.g., `passwords`, `password`, `resetting` → `password`, `reset`).

### 4.2 TF-IDF Explanation
**Term Frequency - Inverse Document Frequency (TF-IDF)** quantifies the relative importance of words across a collection of documents:
- **$\text{TF}(t, d)$**: Measures how frequently term $t$ appears in document $d$.
- **$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + \text{DF}(t)}\right) + 1$**: Dampens terms that appear ubiquitous across all FAQs while amplifying distinctive discriminators like `subscription`, `invoice`, `password`, `gdpr`.
- **Precomputed Matrix**: Vectorized once on server startup. The vectorizer uses unigrams and bigrams (`ngram_range=(1, 2)`) to capture compound phrasing like `reset password` or `cancel subscription`.

### 4.3 Cosine Similarity Explanation
Vectors are mapped into an $N$-dimensional vector space. The cosine of the angle between query vector $\mathbf{q}$ and FAQ document vector $\mathbf{d}$ is calculated:

$$\text{Cosine Similarity}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$

Because vectors are $L_2$-normalized by `TfidfVectorizer`, the metric reduces to an efficient matrix dot product ranging between `0.0` (orthogonal / zero lexical match) and `1.0` (identical representation).

### 4.4 Configurable Confidence Thresholds
To prevent hallucination or irrelevant answers, the engine applies explicit thresholds:
- **High Confidence ($\ge 80\%$)**: System returns the exact verified answer with high confidence badge.
- **Medium Confidence ($50\% - 79\%$)**: System displays the answer labeled as a *Possible Match*.
- **Low Confidence ($< 50\%$)**: System rejects the candidate answer, responding with:  
  *"I couldn't find a reliable answer for that question."*  
  and suggests clickable category filters and related sample questions.

---

## 5. Project Structure

```
CodeAlpha_NexaFAQ_AI/
├── backend/
│   ├── app.py              # Flask REST API and static route provider
│   ├── nlp_engine.py       # Core NLP pipeline: tokenizer, stemmer, TF-IDF & similarity
│   └── requirements.txt    # Python dependencies
│
├── data/
│   └── faqs.json           # 55+ realistic FAQ entries with keywords & categories
│
├── frontend/
│   ├── index.html          # Semantic HTML5 chat interface layout
│   ├── style.css           # Premium styling, light/dark themes, zero-pill metadata
│   └── script.js           # Interactive chat logic, localStorage history, copy & retry
│
├── README.md               # Comprehensive documentation and setup guide
└── .gitignore              # Ignored files (venv, __pycache__, logs)
```

---

## 6. Installation & How to Run in VS Code

### Step 1: Open the project folder in VS Code
Open terminal in `CodeAlpha_NexaFAQ_AI/`:
```bash
cd CodeAlpha_NexaFAQ_AI
```

### Step 2: Create and activate a Python Virtual Environment
**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

### Step 3: Install Required Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Launch the Server
```bash
python backend/app.py
```
*The Flask application will start on `http://localhost:5000` (or `http://127.0.0.1:5000`).*

### Step 5: Open the Assistant
Open your web browser and navigate to:
```
http://localhost:5000
```
The Flask backend automatically serves both the `/api/*` endpoints and the frontend application from one unified server.

---

## 7. Mandatory Test Cases & Results

| # | Test Question | Matched FAQ | Expected Confidence | Verified Result |
|---|---|---|---|---|
| 1 | *"How do I reset my password?"* | How can I reset my password? | High (>85%) | PASS |
| 2 | *"I forgot my password"* | I forgot my password and cannot sign in... | High (>80%) | PASS |
| 3 | *"Can I change my email address?"* | Can I change my email address? | High (>85%) | PASS |
| 4 | *"Where can I see my payment details?"* | Where can I see my payment details? | High (>90%) | PASS |
| 5 | *"How do I cancel my subscription?"* | How do I cancel my subscription? | High (>90%) | PASS |
| 6 | *"I can't log into my account"* | I can't log into my account. What should I do? | High (>85%) | PASS |
| 7 | *"How do I contact support?"* | How do I contact support? | High (>90%) | PASS |
| 8 | *"Can I change my profile information?"* | Can I change my profile information? | High (>85%) | PASS |
| 9 | *"How do I update my notification settings?"*| How do I update my notification settings? | High (>90%) | PASS |
| 10 | *"What happens to my data?"* | What happens to my data? | High (>90%) | PASS |
| 11 | *"What is the capital of Japan?"* | Unrelated / Low Confidence (<50%) | Fallback (<20%) | PASS (Graceful Rejection) |

---

## 8. REST API Specification

### `POST /api/chat`
Submit a question to the NLP engine.

**Request:**
```json
{
  "message": "I forgot my password",
  "category": "All"
}
```

**Response (Match found):**
```json
{
  "success": true,
  "is_match": true,
  "answer": "Open Settings, select Security, choose Reset Password, and follow the verification steps...",
  "category": "Login & Security",
  "matched_question": "How can I reset my password?",
  "confidence": 0.884,
  "confidence_percentage": 88.4,
  "confidence_level": "high",
  "query_preprocessed": "forgot password"
}
```

### `GET /api/health`
Verify server and NLP engine status.

**Response:**
```json
{
  "status": "ok",
  "service": "NexaFAQ AI Backend",
  "faqs_indexed": 55,
  "categories": ["Account", "Billing & Payments", "General Support", "Login & Security", "Notifications", "Orders", "Privacy", "Profile", "Subscription", "Technical Support"]
}
```

---

## 9. UI & Chatbot Features

- **Transparent NLP Inspection**: Every answer includes an expandable *"Why this answer?"* section revealing the exact matched FAQ, category, and similarity percentage.
- **Category Filter Tabs**: Filter queries strictly to specific departments (e.g., Billing, Security, Orders).
- **Interactive Suggested Questions**: Instant 1-click execution of high-volume inquiries.
- **Recent Query History**: Stores sessions in `localStorage` with a 1-click recall and clear action.
- **Copy to Clipboard & Retry**: One-click copy with visual confirmation.
- **Light/Dark Theme Toggle**: Sophisticated palette using CSS variables (`#F8F6F1` / `#171619`).
- **Keyboard Shortcuts**: `Enter` to send, `Shift + Enter` for multi-line inputs.

---

## 10. Future Enhancements

- Word2Vec and dense semantic embeddings (Sentence-Transformers) for deeper paraphrase recognition.
- Multi-lingual translation pipeline for multilingual support desks.
- Automated FAQ analytics dashboard displaying top unanswerable queries to guide knowledge base expansion.

---

## 11. CodeAlpha Internship Acknowledgement

This project was developed for **CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs**.
Developed with pride by Ishashree Suresh.
