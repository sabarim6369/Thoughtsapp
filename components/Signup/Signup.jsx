import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import API_URL from "../../api";
import axios from "axios";  // Import axios to make API requests

export default function Signup({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState(""); // Add state for username
  const [email, setEmail] = useState(""); // Add state for email
  const [dob, setDob] = useState(""); // Add state for date of birth
  const [phoneNumber, setPhoneNumber] = useState(""); // Add state for phone number
  const [password, setPassword] = useState(""); // Add state for password

  const handleSubmit = async () => {
    try {
      // Sending user details to the backend API
      const response = await axios.post(`${API_URL}/auth/signup`, {
        username,
        email,
        password,
        phoneNumber,
        dob,
      });

      if (response.status === 201) {
        alert("User created successfully!");
        navigation.navigate("Login"); // Navigate to login page on success
      }
    } catch (error) {
      console.error(error);
      alert("Error signing up. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={["#rgba(7, 242, 223, 1)", "#rgba(69, 143, 208, 1)"]}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={wp("6%")} color="black" />
          </TouchableOpacity>

          <Text style={styles.title}>Create an account</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.subtitle}>
              Already have an account? <Text style={styles.link}>Login</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={styles.phoneInput}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <Text style={styles.label}>Set Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={wp("5%")}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp("5%"),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    paddingVertical: wp("3%"),
    paddingHorizontal: wp("5%"),
    width: wp("85%"),
    alignSelf: "center",
  },
  title: {
    fontSize: wp("9%"),
    fontWeight: "bold",
    marginVertical: hp("1.5%"),
  },
  subtitle: {
    fontSize: wp("4%"),
    color: "gray",
  },
  link: {
    color: "#007bff",
    fontWeight: "bold",
  },
  label: {
    fontSize: wp("4%"),
    color: "gray",
    marginTop: hp("2%"),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("2%"),
    padding: hp("1.5%"),
    fontSize: wp("4%"),
    marginTop: hp("0.5%"),
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("2%"),
    marginTop: hp("0.5%"),
  },
  phoneInput: {
    flex: 1,
    padding: hp("1.5%"),
    fontSize: wp("4%"),
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("2%"),
    alignItems: "center",
    paddingHorizontal: wp("2%"),
    marginTop: hp("0.5%"),
  },
  passwordInput: {
    flex: 1,
    padding: hp("1.5%"),
    fontSize: wp("4%"),
  },
  button: {
    backgroundColor: "#007bff",
    padding: hp("2%"),
    borderRadius: wp("2%"),
    marginTop: hp("3%"),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});
