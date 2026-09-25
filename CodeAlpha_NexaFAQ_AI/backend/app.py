"""
NexaFAQ AI - Flask Backend Server
CodeAlpha Artificial Intelligence Internship - Task 2: Chatbot for FAQs

Endpoints:
- POST /api/chat     : Process user question and return matched FAQ with confidence
- GET  /api/health   : Server and NLP engine health status
- GET  /api/faqs     : Retrieve full knowledge base
- GET  /             : Serves frontend static application
"""

import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from nlp_engine import FAQEngine

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("NexaFAQ")

# Resolve absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "faqs.json")
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

# Initialize Flask application
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# Load FAQ dataset and initialize NLP engine once on startup
engine = FAQEngine(high_confidence=0.80, min_confidence=0.50)

def initialize_knowledge_base():
    """Load FAQ dataset and build TF-IDF matrix once on startup."""
    try:
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Knowledge base not found at: {DATA_PATH}")

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            faqs = json.load(f)

        logger.info(f"Loaded {len(faqs)} FAQ records from {DATA_PATH}")
        engine.build_faq_index(faqs)
        logger.info("TF-IDF matrix built successfully. Ready to process queries.")
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base: {e}")
        raise e

initialize_knowledge_base()


# ==========================================
# API Endpoints
# ==========================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend and NLP index status."""
    return jsonify({
        "status": "ok",
        "service": "NexaFAQ AI Backend",
        "faqs_indexed": len(engine.faqs),
        "categories": engine.categories,
        "high_confidence_threshold": engine.high_confidence,
        "min_confidence_threshold": engine.min_confidence
    }), 200


@app.route("/api/faqs", methods=["GET"])
def get_faqs():
    """Return the entire FAQ knowledge base with optional category filtering."""
    category = request.args.get("category")
    if category and category.lower() != "all":
        filtered = [f for f in engine.faqs if f.get("category", "").lower() == category.lower()]
        return jsonify({"count": len(filtered), "faqs": filtered}), 200
    return jsonify({"count": len(engine.faqs), "faqs": engine.faqs}), 200


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Main NLP matching endpoint.
    Accepts: { "message": "user question", "category": "optional category filter" }
    Returns: Matched FAQ, similarity score, confidence level, and clean answer.
    """
    try:
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({
                "success": False,
                "error": "Invalid request body. Expected JSON with a 'message' field."
            }), 400

        user_message = data.get("message", "")
        category_filter = data.get("category", "All")

        if not user_message or not isinstance(user_message, str) or not user_message.strip():
            return jsonify({
                "success": False,
                "error": "Empty message. Please enter a valid question."
            }), 400

        # Run NLP matching pipeline
        result = engine.find_best_match(user_message, category_filter=category_filter)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error handling /api/chat: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal NLP processing error occurred. Please try again shortly."
        }), 500


# ==========================================
# Static Frontend Serving
# ==========================================

@app.route("/")
def serve_index():
    """Serves the frontend single-page application."""
    if os.path.exists(os.path.join(FRONTEND_DIR, "index.html")):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({"message": "NexaFAQ AI Backend is running. Frontend static directory not populated."}), 200


@app.route("/<path:path>")
def serve_static(path):
    """Serves frontend static assets (CSS, JS, images)."""
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting NexaFAQ AI server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
