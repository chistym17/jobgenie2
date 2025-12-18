import os
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

def test_recommender_service():
    print("=" * 60)
    print("TEST: RecommenderService with Dummy Data")
    print("=" * 60)
    
    from services.recommender_service import RecommenderService
    
    service = RecommenderService()
    
    dummy_jobs_text = """
    Job Title: Senior Software Engineer
    Company: TechCorp Inc.
    Location: San Francisco, CA
    Type: Full-time
    Salary: $150k-200k
    Requirements: Python, React, AWS, 5+ years
    Description: We are looking for an experienced software engineer...
    
    Job Title: Full Stack Developer
    Company: StartupXYZ
    Location: Remote
    Type: Full-time
    Salary: $120k-160k
    Requirements: JavaScript, Node.js, MongoDB
    Description: Join our team to build amazing products...
    
    Job Title: Backend Engineer
    Company: CloudSystems
    Location: New York, NY
    Type: Full-time
    Salary: $140k-180k
    Requirements: Java, Spring Boot, Microservices
    Description: We need a backend engineer to scale our platform...
    """
    
    print("Testing JSON extraction and parsing...")
    print(f"Model: {service.model_name}")
    print(f"API Key: {'✅ Set' if service.api_key else '❌ Missing'}")
    
    try:
        from services.prompts import get_recommendation_prompt
        prompt = get_recommendation_prompt(dummy_jobs_text)
        
        print("\n📤 Sending request to Gemini...")
        response = service.genai_client.models.generate_content(
            model=service.model_name,
            contents=[prompt]
        )
        
        print("✅ Received response from Gemini")
        print(f"Response length: {len(response.text)} characters")
        
        print("\n📝 Extracting JSON...")
        json_str = service._extract_json_from_response(response.text)
        print(f"Extracted JSON length: {len(json_str)} characters")
        
        print("\n🔧 Parsing JSON...")
        recommendations = service._parse_json_safely(json_str)
        
        print(f"\n✅ SUCCESS! Parsed {len(recommendations)} recommendations")
        print("\n" + "-" * 60)
        for i, job in enumerate(recommendations[:3], 1):
            print(f"\nJob {i}:")
            print(f"  Title: {job.get('Job Title', 'N/A')}")
            print(f"  Company: {job.get('Company Name', 'N/A')}")
            print(f"  Match Score: {job.get('Match Score', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_json_parsing_edge_cases():
    print("\n" + "=" * 60)
    print("TEST: JSON Parsing Edge Cases")
    print("=" * 60)
    
    from services.recommender_service import RecommenderService
    service = RecommenderService()
    
    test_cases = [
        ("Valid JSON", '[{"Job Title": "Engineer", "Match Score": 85}]'),
        ("JSON with unescaped quotes", '[{"Job Title": "Engineer with "quotes"", "Match Score": 85}]'),
        ("JSON with trailing comma", '[{"Job Title": "Engineer", "Match Score": 85},]'),
        ("JSON in markdown", '```json\n[{"Job Title": "Engineer"}]\n```'),
    ]
    
    passed = 0
    for name, test_json in test_cases:
        try:
            result = service._parse_json_safely(test_json)
            print(f"✅ {name}: PASSED")
            passed += 1
        except Exception as e:
            print(f"❌ {name}: FAILED - {e}")
    
    print(f"\nResults: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)

def main():
    print("\n" + "=" * 60)
    print("WORKER TASKS TEST SUITE")
    print("=" * 60)
    
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ ERROR: GOOGLE_API_KEY not found")
        print("Please set it in your .env file")
        return
    
    results = []
    
    print("\n1. Testing JSON parsing edge cases...")
    results.append(("JSON Edge Cases", test_json_parsing_edge_cases()))
    
    print("\n2. Testing RecommenderService with dummy data...")
    user_input = input("Run full API test? (calls Gemini API) (y/n): ")
    if user_input.lower() == 'y':
        results.append(("RecommenderService", test_recommender_service()))
    else:
        print("Skipping API test")
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    print("\n" + ("🎉 All tests passed!" if all_passed else "⚠️  Some tests failed"))

if __name__ == "__main__":
    main()

