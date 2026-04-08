"""
Configuration Test Script
Tests MongoDB connection and API keys
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

load_dotenv()

def test_configuration() -> bool:
    """Test all required configuration"""
    print("Testing Configuration...")
    print("-" * 50)
    
    errors = []
    warnings = []
    
    # Test MongoDB URI
    mongo_uri: str | None = os.environ.get('MONGO_URI')
    if not mongo_uri:
        errors.append("MONGO_URI not found in .env file")
    elif '<' in mongo_uri or '>' in mongo_uri:
        errors.append("MONGO_URI contains placeholder values")
    else:
        print("✓ MongoDB URI found")
        # Test connection
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            client.server_info()
            print("✓ MongoDB connection successful")
            client.close()
        except Exception as e:
            errors.append(f"MongoDB connection failed: {str(e)}")
    
    # Test OpenWeather API Key
    api_key: str | None = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        warnings.append("OPENWEATHER_API_KEY not found (API will use fallback data)")
    elif len(api_key) < 10:
        warnings.append("OPENWEATHER_API_KEY appears invalid")
    else:
        print("✓ OpenWeather API key found")
    
    # Test JWT Secret
    jwt_secret: str | None = os.environ.get('JWT_SECRET_KEY')
    if not jwt_secret:
        warnings.append("JWT_SECRET_KEY not found (using default)")
    else:
        print("✓ JWT secret key found")
    
    # Print results
    print("-" * 50)
    
    if warnings:
        print("\n⚠ WARNINGS:")
        for w in warnings:
            print(f"  - {w}")
    
    if errors:
        print("\n✗ ERRORS:")
        for e in errors:
            print(f"  - {e}")
        print("\n[FAILED] Configuration test failed!")
        return False
    else:
        print("\n[SUCCESS] All configuration tests passed!")
        return True

if __name__ == '__main__':
    success: bool = test_configuration()
    sys.exit(0 if success else 1)
