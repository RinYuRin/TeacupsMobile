import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api";

export default function SettingsScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  });

  const [isEditing, setIsEditing] = useState(false);

  // State for user ID
  const [userId, setUserId] = useState(null);

  // Profile data state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    picture: null, // This holds the URI for display
  });

  // --- 1. Load User Data on Mount ---
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id);
          setProfile({
            name: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            picture: user.image || null, // Set current profile image from DB
          });
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
        Alert.alert("Error", "Could not load your profile.");
      }
    };
    loadUserProfile();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Handle text changes
  const handleChange = (key, value) => {
    setProfile({ ...profile, [key]: value });
  };

  // --- 2. Image Picker (Simplified to match UserProfile.js) ---
  const changeProfilePicture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfile({ ...profile, picture: uri }); // Set new image for display
      }
    } catch (err) {
      console.error("pickImage error:", err);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  // --- 3. Handle Profile Update (Fixed API route) ---
  const handleUpdateProfile = async () => {
    if (!userId) return;

    try {
      // Create FormData to send text and image
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("username", profile.name);
      formData.append("nickname", ""); // Using "" as EditProfile doesn't have a nickname field
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);

      // Check if the profile.picture is a *new* local image (i.e., not an http url)
      if (profile.picture && !profile.picture.startsWith("http")) {
        if (Platform.OS === "web") {
          const response = await fetch(profile.picture);
          const blob = await response.blob();
          const fileType = blob.type.split("/")[1] || "jpg";
          const fileName = `profile.${fileType}`;
          formData.append("image", blob, fileName);
        } else {
          // --- NATIVE UPLOAD ---
          const fileType = profile.picture.split(".").pop().split("?")[0];
          let mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

          formData.append("image", {
            uri: profile.picture,
            name: `profile.${fileType}`,
            type: mimeType,
          });
        }
      }

      // --- 🚨 API ROUTE FIX 🚨 ---
      // Pointing to the correct user route, same as UserProfile.js
      const response = await fetch(`${API.baseURL}/user/update-profile`, {
        method: "POST",
        body: formData,
        // No 'Content-Type' header needed, fetch adds it for FormData
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage with new user data
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        Alert.alert("Success", data.message);
        setIsEditing(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (e) {
      console.error("handleUpdateProfile error:", e);
      Alert.alert("Error", "An error occurred while updating.");
    }
  };

  // --- 4. Logout Function --- (Renumbered from 5)
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("./assets/milk-tea.png")}
        style={styles.bgImage}
        resizeMode="contain"
      />

      {/* Main Content */}
      <Text style={styles.title}>Profile</Text>

      {/* Profile Picture */}
      <View style={styles.pictureContainer}>
        <TouchableOpacity
          onPress={changeProfilePicture}
          disabled={!isEditing} // Disable if not editing
        >
          <Image
            source={
              profile.picture
                ? { uri: profile.picture }
                : require("./assets/profile.png") // Fallback
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changePicButton}
          onPress={changeProfilePicture}
          disabled={!isEditing} // Disable if not editing
        >
          <Text style={styles.changePicText}>
            {isEditing ? "Change" : "Profile Picture"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.profileBox}>
        <Text style={styles.label}>Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => handleChange("name", text)}
          />
        ) : (
          <Text style={styles.info}>{profile.name || "N/A"}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.info}>{profile.email || "N/A"}</Text>
        )}

        <Text style={styles.label}>Phone Number</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => handleChange("phone", text)}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.info}>{profile.phone || "N/A"}</Text>
        )}

        <Text style={styles.label}>Address</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.address}
            onChangeText={(text) => handleChange("address", text)}
          />
        ) : (
          <Text style={styles.info}>{profile.address || "N/A"}</Text>
        )}
      </View>

      {/* Action Buttons */}
      {isEditing ? (
        <>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={handleUpdateProfile} // Use updated function
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ccc" }]}
            onPress={() => setIsEditing(false)} // Cancel editing
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          {/* REMOVED CHANGE PASSWORD BUTTON */}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "#D9534F", marginTop: 20 }, // Added margin to separate from Cancel
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ccc", marginTop: 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}

      {/* REMOVED PASSWORD CHANGE MODAL */}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bgImage: {
    position: "absolute",
    top: 0,
    left: -150,
    width: 900,
    height: 900,
    opacity: 0.5,
    zIndex: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },

  pictureContainer: { alignItems: "center", marginBottom: 20 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#825639",
  },
  changePicButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#825639",
  },
  changePicText: { color: "#fff", fontSize: 14, fontFamily: "Poppins-Regular" },

  profileBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#555",
    fontFamily: "Poppins-Bold",
  },
  info: { fontSize: 16, paddingVertical: 4, fontFamily: "Poppins-Regular" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },
  button: {
    padding: 14,
    backgroundColor: "#A56E1C",
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});