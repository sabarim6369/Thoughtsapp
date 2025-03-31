import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import API_URL from "../../api";

const INPUT_FIELDS = [
  {
    label: "Full Name",
    key: "username",
    icon: "person-outline",
    placeholder: "John Doe",
  },
  {
    label: "Email",
    key: "email",
    icon: "mail-outline",
    placeholder: "johndoe@example.com",
    keyboardType: "email-address",
  },
  {
    label: "Phone Number",
    key: "phoneNumber",
    icon: "call-outline",
    placeholder: "+1234567890",
    keyboardType: "phone-pad",
  },
  {
    label: "Password",
    key: "password",
    icon: "lock-closed-outline",
    isPassword: true,
    placeholder: "••••••••",
  },
];

// Memoize the InputField component
const InputField = memo(function InputField({ field, value, onChange, passwordVisible, togglePasswordVisibility }) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{field.label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name={field.icon}
          size={24}
          color="#6c757d"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder}
          keyboardType={field.keyboardType}
          secureTextEntry={field.isPassword && !passwordVisible}
          autoCapitalize={field.key === "email" ? "none" : "words"}
        />
        {field.isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#6c757d"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Calculate static styles once
const ICON_SIZE = wp("5%");
const BUTTON_ICON_SIZE = wp("6%");
const STYLES = {
  scrollPaddingH: wp("5%"),
  scrollPaddingTop: hp("5%"),
  scrollPaddingBottom: hp("3%"),
  headerMargin: hp("3%"),
  backButtonSize: wp("12%"),
  backButtonRadius: wp("6%"),
  backButtonMargin: hp("2%"),
  titleSize: wp("8%"),
  titleMargin: hp("1%"),
  subtitleSize: wp("4%"),
  cardRadius: wp("5%"),
  imageHeight: hp("20%"),
  formPadding: wp("5%"),
  inputMargin: hp("2%"),
  labelSize: wp("3.5%"),
  labelMargin: hp("0.5%"),
  labelPadding: wp("1%"),
  inputRadius: wp("3%"),
  inputPadding: wp("3%"),
  inputFontSize: wp("4%"),
  buttonMargin: hp("2%"),
  buttonPadding: hp("2%"),
  buttonTextSize: wp("4.5%"),
  termsMargin: hp("2%"),
  termsFontSize: wp("3.5%"),
};

export default function Signup({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoize handlers
  const handleTogglePassword = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber) {
        alert("Please fill in all fields before submitting.");
        return;
      }

      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/signup`, formData);
      alert(response?.data?.message || "Account created successfully!");
      navigation.navigate("Login");
    } catch (error) {
      let errorMessage = "Error signing up. Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || `Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, navigation]);

  // Memoize input change handler creator
  const createChangeHandler = useCallback((key) => {
    return (value) => setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <LinearGradient
      colors={["#rgba(7, 242, 223, 1)", "#rgba(69, 143, 208, 1)"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={BUTTON_ICON_SIZE} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.subtitle}>
                Already have an account?{" "}
                <Text style={styles.link}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }}
              style={styles.backgroundImage}
            />
            <View style={styles.formContainer}>
              {INPUT_FIELDS.map((field) => (
                <InputField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={createChangeHandler(field.key)}
                  passwordVisible={field.isPassword && passwordVisible}
                  togglePasswordVisibility={handleTogglePassword}
                />
              ))}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.terms}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: STYLES.scrollPaddingH,
    paddingTop: STYLES.scrollPaddingTop,
    paddingBottom: STYLES.scrollPaddingBottom,
  },
  header: {
    marginBottom: STYLES.headerMargin,
  },
  backButton: {
    width: STYLES.backButtonSize,
    height: STYLES.backButtonSize,
    borderRadius: STYLES.backButtonRadius,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: STYLES.backButtonMargin,
  },
  title: {
    fontSize: STYLES.titleSize,
    fontWeight: "bold",
    color: "white",
    marginBottom: STYLES.titleMargin,
  },
  subtitle: {
    fontSize: STYLES.subtitleSize,
    color: "rgba(255, 255, 255, 0.8)",
  },
  link: {
    color: "white",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: STYLES.cardRadius,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backgroundImage: {
    width: "100%",
    height: STYLES.imageHeight,
    resizeMode: "cover",
  },
  formContainer: {
    padding: STYLES.formPadding,
  },
  inputWrapper: {
    marginBottom: STYLES.inputMargin,
  },
  label: {
    fontSize: STYLES.labelSize,
    color: "#495057",
    marginBottom: STYLES.labelMargin,
    marginLeft: STYLES.labelPadding,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: STYLES.inputRadius,
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  inputIcon: {
    padding: STYLES.inputPadding,
  },
  input: {
    flex: 1,
    fontSize: STYLES.inputFontSize,
    padding: STYLES.inputPadding,
    color: "#495057",
  },
  eyeIcon: {
    padding: STYLES.inputPadding,
  },
  buttonContainer: {
    marginTop: STYLES.buttonMargin,
  },
  button: {
    backgroundColor: "#4158d0",
    padding: STYLES.buttonPadding,
    borderRadius: STYLES.inputRadius,
    alignItems: "center",
    shadowColor: "#4158d0",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#a8b1ff",
  },
  buttonText: {
    color: "white",
    fontSize: STYLES.buttonTextSize,
    fontWeight: "bold",
  },
  terms: {
    marginTop: STYLES.termsMargin,
    textAlign: "center",
    color: "#6c757d",
    fontSize: STYLES.termsFontSize,
  },
  termsLink: {
    color: "#4158d0",
    fontWeight: "600",
  },
});