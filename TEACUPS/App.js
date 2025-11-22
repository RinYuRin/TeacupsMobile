"use client";
import React, { useCallback } from "react";
import { StyleSheet, View, Platform, StatusBar as NativeStatusBar } from "react-native"; // Removed SafeAreaView from here
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import { toastConfig } from "./toastConfig.js";

// ✅ IMPORT 1: Import the correct Safe Area components
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; // Using Expo's status bar is often more reliable, but standard RN works too.

// Screens
import LoginScreen from "./login";
import SignUpScreen from "./signup";
import ForgotPassword from "./forgotPassword";
import Dashboard from "./dashboard";
import SettingsScreen from "./SettingsScreen";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import Report from "./Report";
import Userhome from "./Userhome";
import ProductDetails from "./ProductDetails";
import AddToCharts from "./addtocharts";
import NotificationsPanel from "./NotificationsPanel";
import OnboardingScreen from "./OnboardingScreen";
import UserProfile from "./UserProfile";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
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

  if (!fontsLoaded) return null;

  const GLOBAL_BG_COLOR = "#FDF5E6"; 

  return (
    // ✅ FIX PART 1: Wrap the entire app in SafeAreaProvider
    <SafeAreaProvider style={{ backgroundColor: GLOBAL_BG_COLOR }}>
      
      {/* ✅ FIX PART 2: Set translucent to TRUE.
          This allows the content to draw under the bar, but SafeAreaView (below) 
          will instantly push it down with padding. This prevents the "jump" glitch. 
      */}
      <StatusBar 
        translucent={true} 
        backgroundColor="transparent" 
        style="dark" // This sets the text color to dark
      />

      {/* ✅ FIX PART 3: Use SafeAreaView from context, with edges set to top only or standard */}
      <SafeAreaView 
        style={{ flex: 1, backgroundColor: GLOBAL_BG_COLOR }} 
        edges={['top', 'left', 'right']} // This forces the padding immediately
      >
        <View style={{ flex: 1, backgroundColor: GLOBAL_BG_COLOR }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Onboarding"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="Report" component={Report} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="ChangePassword" component={ChangePassword} />
              <Stack.Screen name="Userhome" component={Userhome} />
              <Stack.Screen name="ProductDetails" component={ProductDetails} />
              <Stack.Screen name="AddToCharts" component={AddToCharts} />
              <Stack.Screen name="Notifications" component={NotificationsPanel} />
              <Stack.Screen name="Profile" component={UserProfile} />
            </Stack.Navigator>
          </NavigationContainer>
          
          <Toast config={toastConfig} position="top" visibilityTime={3000} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    // ... your existing styles remain unchanged ...
    container: {
    flex: 1,
    backgroundColor: "#816356",
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