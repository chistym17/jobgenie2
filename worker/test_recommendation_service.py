import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
model_name_raw = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
model_name = model_name_raw.lower().replace(" ", "-").strip()

print(f"[TEST] Testing Recommendation Service Configuration...")
print(f"[TEST] API Key present: {'Yes' if api_key else 'No'}")
print(f"[TEST] Model name: {model_name}")
print(f"[TEST] Original model name: {model_name_raw}")

if not api_key:
    print("[TEST] ❌ ERROR: GOOGLE_API_KEY not found in environment")
    exit(1)

try:
    print(f"[TEST] Creating Gemini client...")
    genai_client = genai.Client(api_key=api_key)
    print(f"[TEST] ✅ Client created successfully")
    
    print(f"[TEST] Making test API call with model: {model_name}...")
    response = genai_client.models.generate_content(
        model=model_name,
        contents=["Say hello in one word"]
    )
    
    result = response.text.strip()
    print(f"[TEST] ✅ SUCCESS!")
    print(f"[TEST] Response: {result}")
    print(f"[TEST] Configuration is working correctly!")
    
except Exception as e:
    print(f"[TEST] ❌ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    print(f"[TEST] Traceback:")
    traceback.print_exc()
    exit(1)

