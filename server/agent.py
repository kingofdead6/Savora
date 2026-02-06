from huggingface_hub import InferenceClient
import os


store: dict[str, list[dict]] = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = []
    return store[session_id]



class ChatAgent:
    def __init__(self, token: str, model_name: str):
        self.client = InferenceClient(model=model_name, token=token)
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        try:
            with open("prompt.txt", "r", encoding="utf-8") as f:
                return f.read().strip()
        except:
            return "You are a helpful assistant."

    def chat(self, user_input: str, session_id: str = "default") -> str:
        try:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_input},
            ]

            response = self.client.chat_completion(
                messages=messages,
                max_tokens=800,
                temperature=0.7,          # lower for more consistent JSON
                top_p=0.9,
            )

            reply = response.choices[0].message.content.strip()

            # Optional: clean if model adds extra text
            if reply.startswith("```json"):
                reply = reply.split("```json")[1].split("```")[0].strip()

            return reply

        except Exception as e:
            print(f"[ERROR] {e}")
            return '{"recipes": []}'