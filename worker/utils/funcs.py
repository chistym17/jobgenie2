import datetime

def sanitize_resume(resume):
    if isinstance(resume, dict):
        return {k: sanitize_resume(v) for k, v in resume.items()}
    elif isinstance(resume, list):
        return [sanitize_resume(i) for i in resume]
    elif hasattr(resume, 'binary') or 'bson' in str(type(resume)):
        return str(resume)
    elif isinstance(resume, (datetime.datetime, datetime.date)):
        return resume.isoformat()
    else:
        return resume


def sanitize_error_message(error: Exception | str) -> str:
    """
    Sanitize error messages from API services (Gemini, Google AI, etc.)
    to show user-friendly messages instead of technical details.
    
    Args:
        error: Exception object or error string
        
    Returns:
        User-friendly error message
    """
    error_str = str(error).lower()
    
    # Check for API quota/rate limit errors
    if any(keyword in error_str for keyword in [
        '429',
        'quota',
        'exceeded',
        'rate limit',
        'rate_limit',
        'too many requests',
        'billing',
        'plan',
    ]):
        return "AI service is temporarily unavailable. Please try again later."
    
    # Check for API connection/authentication errors
    if any(keyword in error_str for keyword in [
        'api key',
        'api_key',
        'authentication',
        'credentials',
        'unauthorized',
        '403',
        '401',
        'connection',
        'timeout',
        'network',
    ]):
        return "AI service is temporarily unavailable. Please try again later."
    
    # Check for Google/Gemini specific errors
    if any(keyword in error_str for keyword in [
        'google',
        'gemini',
        'generativelanguage',
        'vertex',
        'generativeai',
    ]):
        return "AI service is temporarily unavailable. Please try again later."
    
    # For other errors, return a generic message
    # This prevents exposing internal system details
    return "Processing failed. Please try again later."

