from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import joblib
from flask_cors import CORS

app = Flask(__name__) #Flask object instantiation
cors= CORS(app) #CORS object instantiation

#  Load trained LSTM model
model = tf.keras.models.load_model("lstm_pipeline_leak_model.h5")

#  Load the scaler (Ensure you save it in `leakage.ipynb` as `scaler.pkl`)
scaler = joblib.load("scaler.pkl")


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Ensure JSON request
        if not request.is_json:
            return jsonify({"error": "Request must be in JSON format"}), 415
        
        data = request.get_json()
        print(data)
        if not data:
            return jsonify({"error": "Empty JSON request"}), 400
        
        #  Get sensor values from request
        sensor1 = float(data.get("Sensor1_Pressure", 0))
        sensor2 = float(data.get("Sensor2_Pressure", 0))
        pump = float(data.get("Pump_Pressure", 0))
        # sensor1=78.9098521595476
        # sensor2=76.1695048814787
        # pump=154.08742890328
        if(sensor1 - sensor2>15):
            return jsonify({"Leakage: 1"})
        
        #  Preprocess input
        input_data = np.array([[sensor1, sensor2, pump]])  # (1,3)
        input_scaled = scaler.transform(input_data)  # Normalize

        #  Reshape input to (1, 10, 3) for LSTM
        sequence = np.tile(input_scaled, (10, 1))  # Repeat input 10 times
        input_reshaped = sequence.reshape(1, 10, 3)

        #  Make prediction
        prediction = model.predict(input_reshaped)
        result = int(prediction[0][0] > 0.5)  # Convert to 0 or 1

        return jsonify({"Leakage": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

