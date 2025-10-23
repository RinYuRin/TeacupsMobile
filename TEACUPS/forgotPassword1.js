import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleResetPassword = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    alert(`OTP sent to ${email}`);
    setShowOTP(true);
  };

  const handleChangeOTP = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOTP = () => {
    const enteredOTP = otp.join("");
    if (enteredOTP === "123456") {
      alert("OTP Verified! You can now reset your password.");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/reset-password.png")} // ✅ Add your image in assets folder
        style={styles.image}
        resizeMode="contain"
      />

      {!showOTP ? (
        <>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We have sent a 6-digit OTP to your email.</Text>

          {/* OTP Boxes */}
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

          {/* Verify OTP Button */}
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          {/* Back to Email */}
          <TouchableOpacity onPress={() => setShowOTP(false)}>
            <Text style={styles.backText}>Back to Email</Text>
          </TouchableOpacity>
        </>
      )}
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
    marginBottom: 30,
    width: "80%",
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
  },
});
