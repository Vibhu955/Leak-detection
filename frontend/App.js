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
      const response = await fetch("http://192.168.1.100/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: signal }), // Send signal as a string
      });

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
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsWaterFlowing(true);
            setOutput("1"); // Set output as a string
            sendSignal("1"); // Send "1" as a string
          }}
        >
          <Text style={styles.buttonText}>On</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsWaterFlowing(false);
            setOutput("0"); // Set output as a string
            sendSignal("0"); // Send "0" as a string
          }}
        >
          <Text style={styles.buttonText}>Off</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.outputText}>Output: {output}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: 200,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  leakageText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
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
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
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
    color: "green",
  },
});