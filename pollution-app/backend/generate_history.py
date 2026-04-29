from pymongo import MongoClient
from datetime import datetime, timedelta
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI: str | None = os.environ.get('MONGO_URI')
if not MONGO_URI or '<' in MONGO_URI or '>' in MONGO_URI:
    print("MongoDB URI is missing or still contains placeholders in .env")
    print("Set MONGO_URI before running this script.")
    raise SystemExit(1)

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client.enviro
except Exception as exc:
    print(f"Failed to connect to MongoDB: {exc}")
    raise SystemExit(1)

cities: list[str] = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Patna", "Bhopal", "Bhubaneswar", "Chandigarh", "Guwahati", "Kochi",
    "Surat", "Kanpur", "Nagpur", "Indore", "Visakhapatnam",
    "Vadodara", "Coimbatore", "Ludhiana", "Ranchi", "Raipur",
    "Thiruvananthapuram", "Srinagar", "Jammu"
]
base_aqi_values: dict[str, int] = {
    'Delhi': 165,
    'Mumbai': 105,
    'Bangalore': 82,
    'Chennai': 95,
    'Kolkata': 148,
    'Hyderabad': 118,
    'Pune': 102,
    'Ahmedabad': 132,
    'Jaipur': 126,
    'Lucknow': 146,
    'Patna': 152,
    'Bhopal': 112,
    'Bhubaneswar': 98,
    'Chandigarh': 104,
    'Guwahati': 108,
    'Kochi': 76,
    'Surat': 114,
    'Kanpur': 158,
    'Nagpur': 106,
    'Indore': 109,
    'Visakhapatnam': 93,
    'Vadodara': 121,
    'Coimbatore': 84,
    'Ludhiana': 142,
    'Ranchi': 116,
    'Raipur': 119,
    'Thiruvananthapuram': 72,
    'Srinagar': 90,
    'Jammu': 111,
}

print("🚀 Generating historical AQI data...\n")

for city in cities:
    print(f"📊 Generating data for {city}...")
    
    # Clear old data
    db.aqi_history.delete_many({'city': city})
    
    base_aqi: int = base_aqi_values.get(city, 100)
    
    for i in range(60, 0, -1):
        timestamp: datetime = datetime.now() - timedelta(days=i)
        variance: float = np.random.normal(0, 15)
        daily_variance = np.sin(i / 10) * 20
        aqi: int = max(30, min(300, base_aqi + variance + daily_variance))
        
        db.aqi_history.insert_one({
            'city': city,
            'aqi': round(aqi, 1),
            'pm25': round(aqi * 0.4, 2),
            'pm10': round(aqi * 0.6, 2),
            'co': round(200 + np.random.normal(0, 50), 2),
            'no2': round(20 + np.random.normal(0, 5), 2),
            'o3': round(50 + np.random.normal(0, 10), 2),
            'timestamp': timestamp
        })
    
    print(f"   ✅ Generated 60 records for {city}")

print("\n🎉 Historical data generation complete!")
print(f"   Total records: {db.aqi_history.count_documents({})}")

client.close()

