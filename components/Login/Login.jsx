import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");
  // Timer for OTP resend
  React.useEffect(() => {
    let interval;
    if (remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remainingTime]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSendOTP = async () => {
    setEmailError("");
    if (!validateEmail(forgotEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
  
    setOtpLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { email: forgotEmail });
  
      alert(response.data.message); // Show only the message
  
      if (response.status === 200) {
        setGeneratedOtp(response.data.otp);
        setStep(2);
        setOtpSent(true);
        setRemainingTime(60); // 60 seconds cooldown
        setOtpError("");
      }
    } catch (error) {
      console.error("Error Response:", error.response);
  
      alert(error.response?.data?.message || "Failed to send OTP"); // Show only the error message
  
      setOtpError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  
  
  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
  
    // Compare entered OTP with generated OTP
    if (otp !== generatedOtp) {
      alert("Invalid OTP");
      setOtpError("Invalid OTP");
      return;
    }
  
    alert("OTP verified successfully!");
    setStep(3); // Proceed to the next step
    setOtpError(""); // Clear any previous errors
  };
  
  

  const handleResetPassword = async () => {
    setPasswordError("");
    
    // if (!validatePassword(newPassword)) {
    //   setPasswordError("Password must be at least 8 characters long");
    //   return;
    // }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email: forgotEmail,
       
        newPassword
      });
      if (response.status === 200) {
        alert("Password reset successful! Please login with your new password.");
        setShowForgotModal(false);
        resetForgotPasswordState();
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setStep(1);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
    setOtpError("");
    setPasswordError("");
    setEmailError("");
  };

  const handleLogin = async () => {
    setLoading(true); 
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password,
            rememberMe
        });

        if (response.status === 200) {
            const { token, userId,email, ...otherData } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', userId.toString());
            await AsyncStorage.setItem('email',email);
            
            setUsername("");
            setPassword("");
            navigation.navigate("Home", { userData: response.data });
        }
    } catch (error) {
        alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderForgotPasswordContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalSubtitle}>Enter your account's email address to receive a verification code</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              value={forgotEmail}
              onChangeText={(text) => {
                setForgotEmail(text);
                setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TouchableOpacity 
              style={[styles.button, otpLoading && styles.buttonDisabled]} 
              onPress={handleSendOTP}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalSubtitle}>
              We've sent a verification code to {forgotEmail}
            </Text>
            <TextInput
              style={[styles.input, styles.otpInput, otpError && styles.inputError]}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ''));
                setOtpError("");
              }}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
            />
            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
            <TouchableOpacity 
              style={[styles.button, otpLoading && styles.buttonDisabled]} 
              onPress={handleVerifyOTP}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.resendButton, remainingTime > 0 && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={remainingTime > 0}
            >
              <Text style={styles.resendText}>
                {remainingTime > 0 
                  ? `Resend code in ${remainingTime}s` 
                  : "Resend code"}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Create a new password for your account</Text>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError && styles.inputError]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry={!passwordVisible}
                placeholder="Enter new password"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons
                  name={passwordVisible ? "eye" : "eye-off"}
                  size={wp("5%")}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry={!passwordVisible}
                placeholder="Confirm new password"
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <TouchableOpacity 
              style={[styles.button, otpLoading && styles.buttonDisabled]} 
              onPress={handleResetPassword}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        );
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

        <Text style={styles.label}>Username</Text>
        <TextInput 
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword} 
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye" : "eye-off"}
              size={wp("5%")}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.rememberContainer}>
          <TouchableOpacity
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember Me</Text>
        </View> */}

        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={() => setShowForgotModal(true)}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showForgotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowForgotModal(false);
          resetForgotPasswordState();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowForgotModal(false);
                resetForgotPasswordState();
              }}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            {renderForgotPasswordContent()}
          </View>
        </View>
      </Modal>
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
    textAlign: "center"
  },
  subtitle: {
    fontSize: wp("4%"),
    color: "gray",
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
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
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: wp("3.5%"),
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: hp("1%"),
  },
  forgotPasswordText: {
    color: "#007bff",
    fontSize: wp("4%"),
  },
  button: {
    backgroundColor: "#007bff",
    padding: hp("2%"),
    borderRadius: wp("2%"),
    marginTop: hp("3%"),
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: wp("80%"),
  },
  modalTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: wp("4%"),
    color: "gray",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  otpInput: {
    textAlign: "center",
    letterSpacing: 2,
    fontSize: wp("6%"),
  },
  resendButton: {
    marginTop: hp("2%"),
    alignItems: "center",
  },
  resendText: {
    color: "#007bff",
    fontSize: wp("4%"),
  },
});