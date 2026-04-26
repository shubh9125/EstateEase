import sys
import json
import joblib
import pandas as pd

model = joblib.load("anomaly_model.pkl")
city_encoder = joblib.load("city_encoder.pkl")
type_encoder = joblib.load("type_encoder.pkl")

data = json.loads(sys.argv[1])

city = data["city"].lower()
property_type = data["propertyType"].lower()

if city not in city_encoder.classes_:
    city_encoded = 0
else:
    city_encoded = city_encoder.transform([city])[0]

if property_type not in type_encoder.classes_:
    type_encoded = 0
else:
    type_encoded = type_encoder.transform([property_type])[0]

row = pd.DataFrame([{
    "price": data["price"],
    "description_length": len(data["description"]),
    "title_length": len(data["title"]),
    "city_encoded": city_encoded,
    "type_encoded": type_encoded,
    "image_count": data.get("imageCount", 0),
    "seller_listing_count": data.get("sellerListingCount", 1)
}])

prediction = model.predict(row)[0]
score = model.decision_function(row)[0]

result = {
    "isAnomaly": prediction == -1,
    "score": float(score)
}

print(json.dumps(result))