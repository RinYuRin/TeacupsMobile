import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

export default function OnboardingScreen({ navigation }) {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const handleLogIn = () => navigation.navigate("Login");
  const handleSignUp = () => navigation.navigate("SignUp");

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <View style={styles.backgroundLogoContainer}>
        <Image
          source={{
            uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ftOk1rEbdmPNVQbP0tIKrVO5WkC35c.png",
          }}
          style={styles.backgroundLogo}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>WELCOME</Text>
        <Text style={styles.onBoardTitle}>ON BOARD</Text>
        <Text style={styles.description}>
          {"Step into flavor and your\n"}
          {"perfect teacups await!"}
        </Text>
        <Text style={styles.subDescription1}>Wanna taste these aroma?</Text>
        <Text style={styles.subDescription}>
          {"Create an account and\n"}
          {"you're ready to go!"}
        </Text>
        <View style={styles.buttonShadowWrapper}>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.logInText}>Already have an account?</Text>
          <Text style={styles.logInText}>
            Tap to{" "}
            <Text onPress={handleLogIn} style={styles.underline}>
              log in!
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#816356",
    position: "relative",
  },
  backgroundLogoContainer: {
    position: "absolute",
    top: "73.2%",
    left: "47%",
    transform: [{ translateX: -125 }, { translateY: -125 }],
    zIndex: 0,
  },
  backgroundLogo: {
    width: 275,
    height: 275,
    opacity: 1,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
    marginBottom: 0,
    lineHeight: 50,
    fontFamily: "Poppins-Bold",
  },
  onBoardTitle: {
    fontSize: 40,
    fontWeight: "300",
    color: "white",
    letterSpacing: 4,
    marginTop: 0,
    marginBottom: 60,
    lineHeight: 40,
    fontFamily: "Poppins-Light",
  },
  description: {
    fontSize: 17,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: "Poppins-Light",
  },
  subDescription1: {
    fontSize: 17,
    color: "white",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
    opacity: 0.9,
    fontFamily: "Poppins-Light",
  },
  subDescription: {
    fontSize: 17,
    color: "white",
    textAlign: "center",
    marginBottom: 260,
    lineHeight: 20,
    opacity: 0.9,
    fontFamily: "Poppins-Light",
  },
  buttonShadowWrapper: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  signUpButton: {
    width: 230,
    height: 60,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 50,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  logInText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: 1,
    fontFamily: "Poppins-Light",
  },
  underline: {
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: "white",
    fontFamily: "Poppins-Bold",
  },
});