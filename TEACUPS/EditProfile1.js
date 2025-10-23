import React, { useState, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import API from "./api"; // Assuming you have an api.js file with your baseURL

// Receive 'route' prop to get the currentUser passed during navigation
export default function SettingsScreen({ navigation, route }) {
  // Get the user object passed from the previous screen
  // This is crucial for the component to work
  const { currentUser } = route.params;

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for profile data
  const [profile, setProfile] = useState({
    username: "",
    nickname: "",
    email: "",
    phone: "",
    address: "",
    picture: "https://via.placeholder.com/120", // Default placeholder
  });

  // State to hold the new image asset for upload
  const [newImage, setNewImage] = useState(null);

  // Load the current user's data into the state when the component loads
  useEffect(() => {
    if (currentUser) {
      setProfile({
        username: currentUser.username || "",
        nickname: currentUser.nickname || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        picture: currentUser.image || "https://via.placeholder.com/120",
      });
    }
  }, [currentUser]); // Re-run if currentUser object changes

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Handle text changes in the input fields
  const handleChange = (key, value) => {
    setProfile({ ...profile, [key]: value });
  };

  // Pick image from gallery or camera
  const changeProfilePicture = async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos."
      );
      return;
    }

    // Show options to choose from Camera or Gallery
    Alert.alert("Change Profile Picture", "Choose a source:", [
      {
        text: "Camera",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 1,
          });
          if (!result.canceled) {
            // Show the new image locally
            setProfile({ ...profile, picture: result.assets[0].uri });
            // Store the asset for upload
            setNewImage(result.assets[0]);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!result.canceled) {
            // Show the new image locally
            setProfile({ ...profile, picture: result.assets[0].uri });
            // Store the asset for upload
            setNewImage(result.assets[0]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Handle "Done" -> Save profile to backend
  const handleSaveProfile = async () => {
    if (!currentUser || !currentUser._id) {
        Alert.alert("Error", "No user is logged in. Please restart the app.");
        return;
    }

    setIsLoading(true);

    // Create FormData to send text and image data together
    const formData = new FormData();

    // Append all user data
    formData.append("userId", currentUser._id);
    formData.append("username", profile.username);
    formData.append("nickname", profile.nickname);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("address", profile.address);

    // If a new image was selected, append it to the form data
    if (newImage) {
      const fileType = newImage.uri.split(".").pop();
      const fileName = newImage.uri.split("/").pop();
      
      // FormData needs the image in a specific format
      formData.append("image", {
        uri: newImage.uri,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    try {
      // Send the POST request to the backend
      const res = await fetch(`${API.baseURL}/admin/user/update-profile`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", data.message);
        // Update profile state with the saved data (which has the new ImageKit URL)
        setProfile({
          username: data.user.username,
          nickname: data.user.nickname,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address,
          picture: data.user.image, // Use the new URL from the server
        });
        setNewImage(null); // Clear the staged image
        setIsEditing(false); // Exit edit mode
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert("Error", "An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("./assets/milk-tea.png")} // Make sure this asset exists
        style={styles.bgImage}
        resizeMode="contain"
      />

      {/* Main Content */}
      <Text style={styles.title}>Profile</Text>

      {/* Profile Picture */}
      <View style={styles.pictureContainer}>
        <Image source={{ uri: profile.picture }} style={styles.profileImage} />
        {isEditing && ( // Only show "Change" button when editing
          <TouchableOpacity
            style={styles.changePicButton}
            onPress={changeProfilePicture}
          >
            <Text style={styles.changePicText}>Change</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Information */}
      <View style={styles.profileBox}>
        {/* Username (was 'Name') */}
        <Text style={styles.label}>Username</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.username}
            onChangeText={(text) => handleChange("username", text)}
            placeholder="Enter username"
          />
        ) : (
          <Text style={styles.info}>{profile.username || "N/A"}</Text>
        )}

        {/* Nickname (New Field) */}
        <Text style={styles.label}>Nickname</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.nickname}
            onChangeText={(text) => handleChange("nickname", text)}
            placeholder="Enter nickname"
          />
        ) : (
          <Text style={styles.info}>{profile.nickname || "N/A"}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="Enter email"
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
            placeholder="Enter phone number"
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
            placeholder="Enter address"
          />
        ) : (
          <Text style={styles.info}>{profile.address || "N/A"}</Text>
        )}
      </View>

      {/* Edit / Done Button */}
      {isEditing ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "green" }]}
          onPress={handleSaveProfile} // Save when "Done" is pressed
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Done</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsEditing(true)} // Enter edit mode
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Stylesheet
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
    backgroundColor: "#eee", // Background color for placeholder
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
  info: {
    fontSize: 16,
    paddingVertical: 8, // Increased padding for better readability
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#f9f9f9",
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