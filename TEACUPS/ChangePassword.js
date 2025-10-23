import React, { useState, useEffect } from "react"; // 1. Import useEffect
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 2. Import AsyncStorage

// 3. IMPORT YOUR API CONFIG
import api from "./api";

// 4. NO MORE AuthContext import!

export default function ChangePassword({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
  });

  // 5. Remove useAuth() and add useState for userId
  // const { user } = useAuth(); // (REMOVED)
  const [userId, setUserId] = useState(null); // (ADDED)

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 6. ADD useEffect to load the user ID from AsyncStorage on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id); // Set the ID to state
        } else {
          // No user found, maybe send them back to login
          Alert.alert("Error", "You are not logged in.");
          navigation.replace("Login");
        }
      } catch (e) {
        console.error("Failed to load user ID:", e);
      }
    };
    loadUserId();
  }, []); // Empty array means this runs once when the screen loads

  const handleSave = async () => {
    // 1. Client-side validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    // 7. Update validation to use the userId from state
    if (!userId) {
      Alert.alert("Error", "Could not find user. Please log in again.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // 8. Update payload to use userId from state
      const payload = {
        userId: userId, // Use the ID from state
        oldPassword: oldPassword,
        newPassword: newPassword,
      };

      // 3. Make the API call (this part is the same)
      const response = await fetch(
        `${api.baseURL}/admin/user/change-pass`, // This endpoint is from your adminRoutes.js
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred.");
      }

      // 6. Handle success
      Alert.alert("Success", data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigation.goBack();
    } catch (error) {
      // 7. Handle errors
      Alert.alert("Error", error.message);
    } finally {
      // 8. Stop loading
      setLoading(false);
    }
  };

  if (!fontsLoaded || !userId) { // Added !userId to the loading check
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* You can use an ActivityIndicator here too */}
        <Text>Loading...</Text>
      </View>
    );
  }

  // The rest of your component (the JSX) remains exactly the same...
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        secureTextEntry // Added this back in
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholderTextColor="#888"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry // Added this back in
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor="#888"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry // Added this back in
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#888"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles remain exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F5F5" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Poppins-Bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
  button: {
    padding: 14,
    backgroundColor: "#C4956C",
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9E7A59",
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});