# NexaFAQ AI — Intelligent FAQ Assistant

> **CodeAlpha Artificial Intelligence Internship — Task 2: Chatbot for FAQs**

### Live Demo

- **GitHub Pages:** https://ishashreesuresh.github.io/FAQ-AI/
- **AI Studio:** https://nexafaq-ai-intelligent-faq-assistant.ai.studio
- **GitHub Repository:** https://github.com/ishashreesuresh/FAQ-AI

This repository contains the NexaFAQ AI Intelligent FAQ Assistant project and its interactive React/Vite web application.

## Features

- Natural-language FAQ matching
- TF-IDF and cosine-similarity based retrieval
- Confidence-aware fallback responses
- Structured FAQ dataset
- Interactive web interface
- Dark/light theme support
- Local browser interaction and project explorer
- GitHub Pages deployment through GitHub Actions

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Local TF-IDF / cosine-similarity NLP engine

## Run Locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment

The project is configured for a repository-based GitHub Pages URL:

```
https://ishashreesuresh.github.io/FAQ-AI/
```

Deployment is handled automatically by:

```
.github/workflows/deploy-pages.yml
```

Every push to `main` runs the dependency installation, Vite production build, Pages artifact upload, and GitHub Pages deployment.

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
