import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "./api"; // Make sure to import your API config

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  // Updated steps
  const [step, setStep] = useState("email"); // 'email', 'otp', 'new_password', 'success'
  const [loading, setLoading] = useState(false);

  // States for steps
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const inputRefs = useRef([]);

  // --- Step 1: Send the OTP to the user's email ---
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API.baseURL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Check Your Email", data.message);
        setStep("otp"); // Move to the OTP screen
      } else {
        Alert.alert("Error", data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API.baseURL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        setStep("new_password"); // Move to the new password screen
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Reset the Password ---
  const handleResetPassword = async () => {
    const enteredOtp = otp.join("");
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // We still send the OTP here for the final reset action
      const response = await fetch(`${API.baseURL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: enteredOtp,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success!", data.message);
        setStep("success"); // Show success message
        // Navigate back to Login after a delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        // This should rarely happen if OTP was pre-verified, but good to have
        Alert.alert("Reset Failed", data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper for OTP inputs ---
  const handleChangeOTP = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    // Move to previous input on delete
    if (!text && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderEmailStep = () => (
    <>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you an OTP to reset your
        password.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </>
  );

  const renderOtpStep = () => (
    <>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>We sent a 6-digit OTP to {email}.</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChangeOTP(text, index)}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep("email")} disabled={loading}>
        <Text style={styles.backText}>Back to Email</Text>
      </TouchableOpacity>
    </>
  );

  // --- New Render Function ---
  const renderNewPasswordStep = () => (
    <>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Your OTP was successful. Please enter a new password.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#888"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <Text style={styles.title}>Success!</Text>
      <Text style={styles.subtitle}>
        Your password has been reset. Redirecting you to the login page...
      </Text>
      <ActivityIndicator size="large" color="#e0ba86" />
    </>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/reset-password.png")}
        style={styles.image}
        resizeMode="contain"
      />
      {step === "email" && renderEmailStep()}
      {step === "otp" && renderOtpStep()}
      {step === "new_password" && renderNewPasswordStep()}
      {step === "success" && renderSuccessStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e5df", // Main background
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4b3832", // Dark text for contrast
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6f4e37", // Slightly darker for readability
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    width: "100%",
  },
  input: {
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#e0ba86", // Warm tone
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    width: "100%",
    minHeight: 48, // For loading indicator
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  backText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "90%", // Make it a bit wider
  },
  otpInput: {
    width: 45,
    height: 55,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8c7b7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    color: "#333",
  },
});