# app.py (full updated version)
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import ChatAgent
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup  # for scraping
import json

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get token ONLY from .env
HF_TOKEN = os.getenv("HF_API_TOKEN")

# If no token is found → crash early (better to know immediately)
if not HF_TOKEN:
    raise ValueError("HF_API_TOKEN is not set in .env file. Please add it.")

TEXT_MODEL = os.getenv("TEXT_MODEL", "meta-llama/Llama-3.2-3B-Instruct")

print(f"Using Hugging Face token: {HF_TOKEN[:10]}... (hidden for safety)")
print(f"Model: {TEXT_MODEL}")

# No need for per-user tokens anymore → always use the same one
def get_agent():
    return ChatAgent(token=HF_TOKEN, model_name=TEXT_MODEL)

# New: Scrape Google Images for a URL (no API key needed)
def get_google_image(query):
    try:
        # Format query for search
        search_query = query + " recipe"  # add "recipe" for better food images
        url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}&tbm=isch"
        
        # Fake browser headers to avoid blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find image tags and grab the first valid URL (skip base64 thumbnails)
        for img in soup.find_all('img'):
            img_url = img.get('data-src') or img.get('src')
            if img_url and 'http' in img_url and not img_url.startswith('data:'):
                return img_url
        
        return None
    except Exception as e:
        print(f"Image scrape error for '{query}': {e}")
        return None  # fallback if fails

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
        raw_reply = agent.chat(message, session_id=session_id)

        # Parse the JSON from AI
        try:
            parsed = json.loads(raw_reply)
            recipes = parsed.get("recipes", [])
            
            # Add image to each recipe
            for recipe in recipes:
                image_url = get_google_image(recipe["title"])
                recipe["image"] = image_url or "https://via.placeholder.com/600x400?text=No+Image+Found"  # fallback placeholder

            # Return enhanced JSON
            return jsonify({
                "response": json.dumps({"recipes": recipes}),  # send back as string if needed, or just {"recipes": recipes}
                "model": TEXT_MODEL
            })
        except json.JSONDecodeError:
            return jsonify({"response": raw_reply})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Optional clear route (you can keep or remove)
@app.route("/clear", methods=["POST"])
def clear():
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    print("Recipe Suggestion API Starting... 🚀")
    app.run(host="0.0.0.0", port=5000, debug=True)  # debug=True is fine for development