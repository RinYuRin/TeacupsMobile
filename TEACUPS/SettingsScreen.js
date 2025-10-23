import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useFonts } from "expo-font";

export default function SettingsScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Password</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("ChangePassword")}>
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.option, { backgroundColor: "#C4956C" }]}
        onPress={() => navigation.replace("Login")} // sends user back to login
      >
        <Text style={[styles.optionText, { color: "#fff", textAlign: "center", fontFamily: "Poppins-Bold" }]}>
          Log Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  option: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: { fontSize: 16 },
});
