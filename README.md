# NexaFAQ AI — Intelligent FAQ Assistant

> **CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs**  
> Developed as an authentic, local Natural Language Processing (NLP) FAQ retrieval system.

## Project Structure

This repository includes both:
1. **The Standalone Python/Flask + Scikit-Learn Project** in `CodeAlpha_NexaFAQ_AI/` ready to run in VS Code.
2. **The Production Interactive Web Application** served live on Vite / React with a client-side local NLP engine mirror and interactive CodeAlpha Project Explorer.

```
├── CodeAlpha_NexaFAQ_AI/
│   ├── backend/
│   │   ├── app.py              # Flask server & REST API
│   │   ├── nlp_engine.py       # NLTK tokenization, stemming, TF-IDF & Cosine Similarity
│   │   └── requirements.txt    # Python dependencies
│   ├── data/
│   │   └── faqs.json           # 55+ structured FAQ records
│   ├── frontend/
│   │   ├── index.html          # Semantic HTML5 layout
│   │   ├── style.css           # Premium editorial styling & dark/light theme
│   │   └── script.js           # Client application logic & localStorage
│   ├── README.md               # Detailed task documentation
│   └── .gitignore
├── src/                        # Full interactive application
├── data/
│   └── faqs.json
└── package.json
```

## Running the Python Project in VS Code
```bash
cd CodeAlpha_NexaFAQ_AI
python3 -m venv venv
source venv/bin/activate     # On Windows: .\venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py
```
Then visit `http://localhost:5000`.

## Verified Test Cases
1. "How do I reset my password?" -> High Confidence (>85%) -> PASS
2. "I forgot my password" -> High Confidence (>80%) -> PASS
3. "Can I change my email address?" -> High Confidence (>85%) -> PASS
4. "Where can I see my payment details?" -> High Confidence (>90%) -> PASS
5. "How do I cancel my subscription?" -> High Confidence (>90%) -> PASS
6. "I can't log into my account" -> High Confidence (>85%) -> PASS
7. "How do I contact support?" -> High Confidence (>90%) -> PASS
8. "Can I change my profile information?" -> High Confidence (>85%) -> PASS
9. "How do I update my notification settings?" -> High Confidence (>90%) -> PASS
10. "What happens to my data?" -> High Confidence (>90%) -> PASS
11. "What is the capital of Japan?" -> Confidence < 50% -> Gracefully triggers fallback suggestions -> PASS
