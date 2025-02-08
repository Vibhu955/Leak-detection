from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import joblib
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


#  Load trained LSTM model
model = tf.keras.models.load_model("lstm_pipeline_leak_model.h5")

#  Load the scaler (Ensure you save it in `leakage.ipynb` as `scaler.pkl`)
scaler = joblib.load("scaler.pkl")

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Ensure JSON request
        if not request.is_json:
            return jsonify({"error": "Request must be in JSON format"}), 415
        
        data = request.get_json()
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
    
current_signal = 0  # Default state

signal_state = 0  # Global variable to store the signal

@app.route('/get_signal', methods=['GET'])
def get_signal():
    return jsonify(str(signal_state))  # Return as string for ESP32 compatibility

@app.route('/send_signal', methods=['POST'])
def send_signal():
    global signal_state
    data = request.json
    new_signal = data.get("signal")

    if new_signal not in ["0", "1"]:  # Ensure only 0 or 1 is allowed
        return jsonify({"error": "Invalid input. Only 0 or 1 is allowed."}), 400

    if new_signal != signal_state:  # Toggle only when different input is received
        signal_state = new_signal
        return jsonify({"message": "Signal updated", "current_signal": signal_state})

    return jsonify({"message": "No change", "current_signal": signal_state})

@app.route('/reset_signal', methods=['POST'])
def reset_signal():
    global signal_state
    signal_state = 0
    return jsonify({"message": "Signal reset", "current_signal": signal_state})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    app.run(debug=True)

