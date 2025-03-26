import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";

export default function Signup({navigation}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

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
          <TextInput style={styles.input} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} keyboardType="email-address" />

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            {/* <Picker
            selectedValue={selectedCode}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCode(itemValue)}
          >
            <Picker.Item label="+91" value="+91" />
            <Picker.Item label="+90" value="+90" />
            <Picker.Item label="+1" value="+1" />
            <Picker.Item label="+44" value="+44" />
            <Picker.Item label="+61" value="+61" />
          </Picker> */}
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

          <TouchableOpacity style={styles.button}>
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
  picker: {
    width: wp("20%"),
    height: hp("6%"),
    backgroundColor: "#e1d8d8",
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
