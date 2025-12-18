import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

from services.recommender_service import RecommenderService

def test_json_parsing():
    print("=" * 60)
    print("TEST 1: JSON Parsing with Malformed JSON")
    print("=" * 60)
    
    service = RecommenderService()
    
    malformed_json = """
    [
      {
        "Job Title": "Software Engineer",
        "Company Name": "Tech Corp",
        "Description": "We need someone with 5+ years of Python experience. Must know React, Node.js, and have experience with AWS. The role involves building scalable APIs and working with microservices architecture."
      }
    ]
    """
    
    try:
        result = service._parse_json_safely(malformed_json)
        print("✅ JSON parsing successful!")
        print(f"Parsed {len(result)} items")
        print(json.dumps(result, indent=2))
        return True
    except Exception as e:
        print(f"❌ JSON parsing failed: {e}")
        return False

def test_json_extraction():
    print("\n" + "=" * 60)
    print("TEST 2: JSON Extraction from Markdown")
    print("=" * 60)
    
    service = RecommenderService()
    
    markdown_response = """
    Here are the job recommendations:
    
    ```json
    [
      {
        "Job Title": "Backend Developer",
        "Company Name": "StartupXYZ",
        "Match Score": 90
      }
    ]
    ```
    
    These are the best matches for you.
    """
    
    extracted = service._extract_json_from_response(markdown_response)
    print(f"Extracted JSON:\n{extracted}")
    
    try:
        result = service._parse_json_safely(extracted)
        print("✅ Extraction and parsing successful!")
        print(json.dumps(result, indent=2))
        return True
    except Exception as e:
        print(f"❌ Extraction/parsing failed: {e}")
        return False

def test_recommendation_service():
    print("\n" + "=" * 60)
    print("TEST 3: Full Recommendation Service (with dummy data)")
    print("=" * 60)
    
    service = RecommenderService()
    
    dummy_jobs_text = """
    Job 1: Software Engineer at Google
    Location: Mountain View, CA
    Requirements: Python, React, 5+ years experience
    Salary: $150k-200k
    
    Job 2: Full Stack Developer at Meta
    Location: Menlo Park, CA
    Requirements: JavaScript, Node.js, AWS
    Salary: $140k-180k
    
    Job 3: Backend Engineer at Amazon
    Location: Seattle, WA
    Requirements: Java, Spring Boot, Microservices
    Salary: $130k-170k
    """
    
    print("Testing with dummy job data...")
    print("Note: This will make an actual API call to Gemini")
    
    try:
        from services.prompts import get_recommendation_prompt
        prompt = get_recommendation_prompt(dummy_jobs_text)
        
        print("\nSending request to Gemini...")
        response = service.genai_client.models.generate_content(
            model=service.model_name,
            contents=[prompt]
        )
        
        print("✅ Got response from Gemini")
        print(f"Response length: {len(response.text)} characters")
        print(f"\nFirst 500 chars:\n{response.text[:500]}")
        
        json_str = service._extract_json_from_response(response.text)
        print(f"\nExtracted JSON length: {len(json_str)} characters")
        
        recommendations = service._parse_json_safely(json_str)
        
        print(f"\n✅ Successfully parsed {len(recommendations)} recommendations!")
        print("\nParsed recommendations:")
        print(json.dumps(recommendations, indent=2))
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "=" * 60)
    print("WORKER RECOMMENDATION SERVICE TEST")
    print("=" * 60)
    
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ ERROR: GOOGLE_API_KEY not found in environment")
        print("Please set it in your .env file")
        return
    
    print(f"✅ API Key found")
    print(f"✅ Model: {os.getenv('GEMINI_MODEL_NAME', 'gemini-2.0-flash')}")
    
    results = []
    
    results.append(("JSON Parsing", test_json_parsing()))
    results.append(("JSON Extraction", test_json_extraction()))
    
    user_input = input("\nRun full API test? This will call Gemini API (y/n): ")
    if user_input.lower() == 'y':
        results.append(("Full Service Test", test_recommendation_service()))
    else:
        print("Skipping full API test")
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    if all_passed:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed")

if __name__ == "__main__":
    main()

