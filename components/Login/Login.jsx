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
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({navigation}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const handleLogin = async () => {
    setLoading(true); 
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
            rememberMe
        });

        console.log("Full Response:", response.data); // Log full response

        if (response.status === 200) {
            const { token, userId, ...otherData } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', userId.toString());
            console.log('Login successful:', response.data);

            setEmail("");
            setPassword("");
            navigation.navigate("Home", { userData: response.data }); // Pass full data to the next screen
        }
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        alert(error.response?.data?.message || "Login failed. Please try again.");
    }
    finally {
      setLoading(false); // Stop loading
    }
};


  return (
    <LinearGradient colors={["#07F2DF", "#458FD0"]} style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={wp("6%")} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Login</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.subtitle}>
            Don't have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} keyboardType="email-address"     value={email}
          onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
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

        <View style={styles.rememberContainer}>
          <TouchableOpacity
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>  {loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>
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
    paddingVertical: hp("3%"),
    paddingHorizontal: wp("5%"),
    width: wp("85%"),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: wp("8%"),
    fontWeight: "bold",
    marginVertical: hp("1.5%"),
    textAlign:"center"
  },
  subtitle: {
    fontSize: wp("4%"),
    color: "gray",
    textAlign: "center",
    flexDirection: "row",  // Ensure inline layout
    justifyContent: "center", // Center align content
    alignItems: "center",
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
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2%"),
  },
  rememberText: {
    fontSize: wp("4%"),
    color: "gray",
    marginLeft: wp("2%"),
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "gray",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("2%"),
  },
  checkboxChecked: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
});
