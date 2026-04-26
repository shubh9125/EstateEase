import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("property_data.csv")

city_encoder = LabelEncoder()
type_encoder = LabelEncoder()

df["city_encoded"] = city_encoder.fit_transform(df["city"])
df["type_encoded"] = type_encoder.fit_transform(df["property_type"])

X = df[[
    "price",
    "description_length",
    "title_length",
    "city_encoded",
    "type_encoded",
    "image_count",
    "seller_listing_count"
]]

model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X)

joblib.dump(model, "anomaly_model.pkl")
joblib.dump(city_encoder, "city_encoder.pkl")
joblib.dump(type_encoder, "type_encoder.pkl")

print("Model trained and saved")