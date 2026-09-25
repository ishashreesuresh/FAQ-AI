# NexaFAQ AI — Intelligent FAQ Assistant

> **CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs**

🔗 **Live AI Studio App:** https://nexafaq-ai-intelligent-faq-assistant.ai.studio

This repository contains the NexaFAQ AI Intelligent FAQ Assistant project, including the standalone Python/Flask NLP implementation and the interactive web application.

## Project Structure

```
├── CodeAlpha_NexaFAQ_AI/
│   ├── backend/
│   │   ├── app.py
│   │   ├── nlp_engine.py
│   │   └── requirements.txt
│   ├── data/
│   │   └── faqs.json
│   ├── frontend/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── README.md
│   └── .gitignore
├── src/
├── data/
│   └── faqs.json
└── package.json
```

## Features

- Natural-language FAQ matching
- TF-IDF and cosine-similarity based retrieval
- Confidence-aware fallback responses
- Structured FAQ dataset
- Interactive web interface
- Dark/light theme support
- Local browser interaction and project explorer

## Run the Python NLP Version

```bash
cd CodeAlpha_NexaFAQ_AI
python -m venv venv
```

### Windows

```bash
.\venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py
```

Then open `http://localhost:5000`.

## Live Project

The deployed/interactive version is available here:

**https://nexafaq-ai-intelligent-faq-assistant.ai.studio**

## Verified Test Cases

1. "How do I reset my password?" → High-confidence match
2. "I forgot my password" → High-confidence match
3. "Can I change my email address?" → High-confidence match
4. "Where can I see my payment details?" → High-confidence match
5. "How do I cancel my subscription?" → High-confidence match
6. "I can't log into my account" → High-confidence match
7. "How do I contact support?" → High-confidence match
8. "Can I change my profile information?" → High-confidence match
9. "How do I update my notification settings?" → High-confidence match
10. "What happens to my data?" → High-confidence match
11. "What is the capital of Japan?" → Low-confidence fallback

## Internship

**CodeAlpha — Artificial Intelligence Internship**  
**Task:** Chatbot for FAQs  
**Project:** NexaFAQ AI — Intelligent FAQ Assistant
