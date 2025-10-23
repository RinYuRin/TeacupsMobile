"use client";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import API from "./api";


SplashScreen.preventAutoHideAsync();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

const handleLogin = async () => {
    try {
      const response = await fetch(`${API.baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
          Alert.alert(
            "Login Successful",
            `Welcome back, ${data.user.username || data.user.email}!`
          );

          // --- NAVIGATION LOGIC ---
          // Check the role from the response and navigate
          if (data.user.role === "admin") {
            navigation.navigate("Dashboard"); // Navigate to Admin Dashboard
          } else {
            navigation.navigate("Userhome"); // Navigate to User Home
          }
          // --- END NAVIGATION LOGIC ---
        } else {
          Alert.alert("Error", "User data missing in response.");
        }
      } else {
        // Show error message from backend
        Alert.alert("Login Failed", data.message || "Invalid email or password.");
      }
    } catch (error) {
      Alert.alert("Network error", "Could not connect to server: " + error.message);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.fullScreenContainer} onLayout={onLayoutRootView}>
      <Image
        source={require("./assets/image/image1.png")}
        style={styles.bgIconLeft}
        resizeMode="contain"
      />
      <Image
        source={require("./assets/image/image2.png")}
        style={styles.bgIconRight}
        resizeMode="contain"
      />
      <RNStatusBar barStyle="light-content" backgroundColor="#806153" />
      <View style={styles.headerBar} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.topIllustrationContainer}>
            <Image source={require("./assets/image/coffe.png")} style={styles.topIllustration} />
            <View style={styles.topTextOverlay}>
              <Text style={styles.logInTitle}>LOG IN</Text>
              <Text style={styles.toContinueText}>TO CONTINUE</Text>
            </View>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Email"
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#555"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Image
                    source={
                      showPassword
                        ? require("./assets/image/password=show.png")
                        : require("./assets/image/password=hide.png")
                    }
                    style={styles.iconImage}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#F8F0E3",
  },
  headerBar: {
    height: 20,
    backgroundColor: "#806153",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  keyboardAvoidingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 100,
  },
  topIllustrationContainer: {

    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 56,
    marginTop: 0,
  },
  topIllustration: {
    width: 320,
    height: 350,
    resizeMode: "contain",
  },
  topTextOverlay: {
    position: "absolute",
    alignItems: "center",
    top: "24%",
    transform: [{ translateY: -20 }],
  },
  logInTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: -10,
    fontFamily: "Poppins-ExtraBold",
  },
  toContinueText: {
    fontSize: 26,
    color: "#000000",
    fontFamily: "Poppins-Light",
  },
  formContainer: {
    width: "75%",
    alignItems: "center",
    marginBottom: 20,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
    fontFamily: "Poppins-Regular",
    paddingLeft: 5,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
    fontFamily: "Poppins-Regular",
    paddingLeft: 5,
  },
  eyeIcon: {
    padding: 5,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: "#000",
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins-LightItalic",
  },
  loginButton: {
    backgroundColor: "#AD9761",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 14,
    color: "#555",
    fontFamily: "Poppins-Regular",
  },
  signUpLink: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontFamily: "Poppins-Bold",
  },
  bgIconLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    marginLeft: -35,
    width: 150,
    height: 150,
    opacity: 0.9,
    zIndex: 0,
  },
  bgIconRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    marginRight: -35,
    width: 150,
    height: 150,
    opacity: 0.9,
    zIndex: 0,
  },
});
