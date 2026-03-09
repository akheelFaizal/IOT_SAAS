import json
from main import predict_consumption, PredictionRequest, DeviceInput

payload = PredictionRequest(
  devices=[
    DeviceInput(device="AC", hours=5.0, power=1500.0, room="bedroom"),
    DeviceInput(device="TV", hours=3.0, power=120.0, room="living_room"),
    DeviceInput(device="Fan", hours=6.0, power=75.0, room="bedroom")
  ],
  temperature=28.0,
  day_of_week="weekday",
  time_of_day="evening"
)

try:
    response = predict_consumption(payload)
    print("Response JSON:\n", json.dumps(response, indent=2))
except Exception as e:
    print("Error:", e)
