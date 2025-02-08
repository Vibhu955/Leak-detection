import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import Animation from "./Animation"; // Ensure this path is correct

export default function App() {
  const [isWaterFlowing, setIsWaterFlowing] = useState(false);
  const [sensor1, setSensor1] = useState("");
  const [sensor2, setSensor2] = useState("");
  const [pump, setPump] = useState("");
  const [leakage, setLeakage] = useState(null);
  const [output, setOutput] = useState("0"); // "1" for On, "0" for Off (as strings)

  const opacity = useSharedValue(0);

  const sendPostRequest = async () => {
    const data = {
      Sensor1_Pressure: parseFloat(sensor1) || 0,
      Sensor2_Pressure: parseFloat(sensor2) || 0,
      Pump_Pressure: parseFloat(pump) || 0,
    };

    try {
      const response = await fetch(
        "https://leak-detection.onrender.com/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result && typeof result.Leakage !== "undefined") {
        setLeakage(result.Leakage);
      } else {
        setLeakage("Error: Unexpected response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setLeakage("Error fetching data");
    }
  };

  const sendSignal = async (signal) => {
    try {
      const response = await fetch(
        "https://leak-detection.onrender.com/send_signal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signal }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.text();
      console.log("Signal sent successfully:", result);
    } catch (error) {
      console.error("Error sending signal:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AquaAlert</Text>

      <TextInput
        style={styles.input}
        placeholder="Sensor 1 Pressure"
        keyboardType="numeric"
        value={sensor1}
        onChangeText={setSensor1}
      />
      <TextInput
        style={styles.input}
        placeholder="Sensor 2 Pressure"
        keyboardType="numeric"
        value={sensor2}
        onChangeText={setSensor2}
      />
      <TextInput
        style={styles.input}
        placeholder="Pump Pressure"
        keyboardType="numeric"
        value={pump}
        onChangeText={setPump}
      />

      <TouchableOpacity style={styles.button} onPress={sendPostRequest}>
        <Text style={styles.buttonText}>Calculate Leakage</Text>
      </TouchableOpacity>

      {leakage !== null && (
        <Text style={styles.leakageText}>Leakage: {leakage}</Text>
      )}

      <Animated.View style={[styles.animationContainer, { opacity }]}>
        <Animation
          source={require("./assets/water-flow.json")}
          isPlaying={isWaterFlowing}
          style={styles.animation}
        />
      </Animated.View>

      <View style={styles.buttonContainer}>
        {isWaterFlowing ? (
          <TouchableOpacity
            style={[styles.button, styles.offButton]}
            onPress={() => {
              setIsWaterFlowing(false);
              setOutput("0");
              sendSignal("0");
            }}
          >
            <Text style={styles.buttonText}>Off</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.onButton]}
            onPress={() => {
              setIsWaterFlowing(true);
              setOutput("1");
              sendSignal("1");
            }}
          >
            <Text style={styles.buttonText}>On</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.outputText}>Output: {output}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: 250,
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 15,
    backgroundColor: "#fff",
  },
  leakageText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#ff4d4d",
  },
  animationContainer: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  onButton: {
    backgroundColor: "#28a745",
  },
  offButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  outputText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
});
