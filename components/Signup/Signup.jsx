import React, { useState, useCallback, useMemo } from "react";
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
    label: "Date of Birth",
    key: "dob",
    icon: "calendar-outline",
    placeholder: "YYYY-MM-DD",
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

const InputField = React.memo(({ 
  field, 
  value, 
  onChangeText, 
  isActive, 
  onFocus, 
  onBlur, 
  passwordVisible, 
  togglePasswordVisibility 
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{field.label}</Text>
    <View
      style={[
        styles.inputContainer,
        {
          borderColor: isActive ? "#007bff" : value ? "#28a745" : "#dee2e6",
          backgroundColor: isActive ? "#fff" : "#f8f9fa",
        },
      ]}
    >
      <Ionicons
        name={field.icon}
        size={wp("5%")}
        color={isActive ? "#007bff" : value ? "#28a745" : "#6c757d"}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={field.placeholder}
        keyboardType={field.keyboardType}
        secureTextEntry={field.isPassword && !passwordVisible}
        autoCapitalize={field.key === "email" ? "none" : "words"}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {field.isPassword && (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={wp("5%")}
            color="#6c757d"
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
));

export default function Signup({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dob: "",
    phoneNumber: "",
    password: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async () => {
    try {
      // Input Validation
      if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber || !formData.dob) {
        return alert("Please fill in all fields before submitting.");
      }
  
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/signup`, formData);
  
      // Check if response exists before accessing properties
      if (response?.status === 201) {
        alert(response.data.message || "Account created successfully!");
        navigation.navigate("Login");
      }
    } catch (error) {
      // Standardized error handling
      alert(error?.response?.data?.message || "Error signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  const togglePasswordVisibility = useCallback((key) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [key]: !prev[key] // Toggle visibility for this specific field
    }));
  }, []);
  
  const renderInputField = useCallback(({ field }) => (
    <InputField
      key={field.key}
      field={field}
      value={formData[field.key]}
      onChangeText={(value) => handleChange(field.key, value)}
      isActive={activeField === field.key}
      onFocus={() => setActiveField(field.key)}
      onBlur={() => setActiveField(null)}
      passwordVisible={passwordVisibility[field.key] || false}
      togglePasswordVisibility={() => togglePasswordVisibility(field.key)}
    />
  ), [formData, activeField, passwordVisibility, handleChange, togglePasswordVisibility]);
  
  const headerContent = useMemo(() => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={wp("6%")} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.subtitle}>
          Already have an account?{" "}
          <Text style={styles.link}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  const formFields = useMemo(() => 
    INPUT_FIELDS.map((field, index) => renderInputField({ field, index })),
    [renderInputField]
  );

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
          {headerContent}

          <View style={styles.card}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }}
              style={styles.backgroundImage}
            />
            <View style={styles.formContainer}>
              {formFields}

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
    paddingHorizontal: wp("5%"),
    paddingTop: hp("5%"),
    paddingBottom: hp("3%"),
  },
  header: {
    marginBottom: hp("3%"),
  },
  backButton: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  title: {
    fontSize: wp("8%"),
    fontWeight: "bold",
    color: "white",
    marginBottom: hp("1%"),
  },
  subtitle: {
    fontSize: wp("4%"),
    color: "rgba(255, 255, 255, 0.8)",
  },
  link: {
    color: "white",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: wp("5%"),
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
    height: hp("20%"),
    resizeMode: "cover",
  },
  formContainer: {
    padding: wp("5%"),
  },
  inputWrapper: {
    marginBottom: hp("2%"),
  },
  label: {
    fontSize: wp("3.5%"),
    color: "#495057",
    marginBottom: hp("0.5%"),
    marginLeft: wp("1%"),
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: wp("3%"),
    overflow: "hidden",
  },
  inputIcon: {
    padding: wp("3%"),
  },
  input: {
    flex: 1,
    fontSize: wp("4%"),
    padding: wp("3%"),
    color: "#495057",
  },
  eyeIcon: {
    padding: wp("3%"),
  },
  buttonContainer: {
    marginTop: hp("2%"),
  },
  button: {
    backgroundColor: "#4158d0",
    padding: hp("2%"),
    borderRadius: wp("3%"),
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
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  terms: {
    marginTop: hp("2%"),
    textAlign: "center",
    color: "#6c757d",
    fontSize: wp("3.5%"),
  },
  termsLink: {
    color: "#4158d0",
    fontWeight: "600",
  },
});