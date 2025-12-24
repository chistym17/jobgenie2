import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class BaseGeminiService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY in environment variables.")
        
        genai.configure(api_key=self.api_key)
        
        model_name_raw = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
        self.model_name = model_name_raw.lower().replace(" ", "-").strip()
        if self.model_name != model_name_raw:
            print(f"[GEMINI_SERVICE] Model name normalized from '{model_name_raw}' to '{self.model_name}'")
        
        self.model = genai.GenerativeModel(self.model_name)

