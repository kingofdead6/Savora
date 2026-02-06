# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import ChatAgent
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.getenv("HF_API_TOKEN")

if not HF_TOKEN:
    raise ValueError("HF_API_TOKEN is not set in .env file.")

TEXT_MODEL = os.getenv("TEXT_MODEL", "meta-llama/Llama-3.2-3B-Instruct")

print(f"Using Hugging Face token: {HF_TOKEN[:10]}... (hidden)")
print(f"Model: {TEXT_MODEL}")

def get_agent():
    return ChatAgent(token=HF_TOKEN, model_name=TEXT_MODEL)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        agent = get_agent()
        reply = agent.chat(message, session_id=session_id)

        return jsonify({
            "response": reply,
            "model": TEXT_MODEL
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Recipe Suggestion API Starting... 🚀")
    app.run(host="0.0.0.0", port=5000, debug=True)