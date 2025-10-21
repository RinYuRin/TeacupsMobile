import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api"; // Import your API config

export default function UserProfile({ navigation, route }) {
  const [editing, setEditing] =useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for user ID
  const [userId, setUserId] = useState(null);

  // Profile data
  const [editProfile, setEditProfile] = useState({
    username: "",
    nickname: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null); // This holds the URI for display

  // Change password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, colorScheme), [width, colorScheme]);

  // --- 1. Load User Data on Mount ---
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id);
          setEditProfile({
            username: user.username || "",
            nickname: user.nickname || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
          });
          if (user.image) {
            setProfileImage(user.image); // Set current profile image from DB
          }
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
        Alert.alert("Error", "Could not load your profile.");
      }
    };
    loadUserProfile();
  }, []);

  // --- 2. Image Picker ---
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri); // Set new image for display
        // We won't update editProfile.image here, we'll handle the URI in handleUpdateProfile
      }
    } catch (err) {
      console.error("pickImage error:", err);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  // --- 3. Handle Profile Update (Save Button) ---
  const handleUpdateProfile = async () => {
    if (!userId) return;

    try {
      // Create FormData to send text and image
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("username", editProfile.username);
      formData.append("nickname", editProfile.nickname);
      formData.append("email", editProfile.email);
      formData.append("phone", editProfile.phone);
      formData.append("address", editProfile.address);

      // Check if the profileImage is a *new* local image (i.e., not an http url)
      if (profileImage && !profileImage.startsWith("http")) {
        
        if (Platform.OS === 'web') {
          // --- WEB UPLOAD ---
          // 1. Convert the local URI (blob: or data:) to a Blob
          const response = await fetch(profileImage);
          const blob = await response.blob();
          
          // 2. Get the file type from the Blob
          const fileType = blob.type.split('/')[1] || 'jpg';
          const fileName = `profile.${fileType}`;

          // 3. Append the Blob as a file
          formData.append("image", blob, fileName);

        } else {
          // --- NATIVE UPLOAD (Your original code) ---
          const fileType = profileImage.split(".").pop().split("?")[0];
          let mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
          
          formData.append("image", {
            uri: profileImage,
            name: `profile.${fileType}`,
            type: mimeType,
          });
        }
      }
      // Send to the backend
      const response = await fetch(`${API.baseURL}/user/update-profile`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage with new user data
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        // Call the onSave prop to update Userhome.js
        const cb = route?.params?.onSave;
        if (typeof cb === "function") {
          cb(data.user);
        }

        Alert.alert("Success", data.message);
        setEditing(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (e) {
      console.error("handleUpdateProfile error:", e);
      Alert.alert("Error", "An error occurred while updating.");
    }
  };

  // --- 4. Handle Password Change (Save Button) ---
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch(`${API.baseURL}/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
      } else {
        Alert.alert("Error", data.message || "Password change failed.");
      }
    } catch (e) {
      console.error("handlePasswordChange error:", e);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  // --- 5. Logout Function ---
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Profile Header */}
          <View style={styles.header}>
            <TouchableOpacity
              disabled={!editing}
              onPress={editing ? pickImage : undefined}
              style={styles.headerLeft}
            >
              <Image
                source={
                  profileImage ? { uri: profileImage } : require("./assets/profile.png")
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
              {editing && <Text style={styles.uploadText}>Tap to change photo</Text>}
            </TouchableOpacity>

            {/* Display data from state */}
            <View style={styles.headerRight}>
              <Text style={styles.nameText}>{editProfile.username || "Your Name"}</Text>
              <Text style={styles.emailText}>{editProfile.email || "your@email.com"}</Text>
              {editProfile.address ? <Text style={styles.emailText}>{editProfile.address}</Text> : null}
            </View>
          </View>

          {/* General Settings */}
          {!editing && !showPassword && (
            <>
              {/* ... (Other options: Edit Profile, Change Password, etc.) ... */}
              <Text style={styles.sectionTitle}>General</Text>
              <TouchableOpacity style={styles.option} onPress={() => setEditing(true)}>
                <Text style={styles.optionText}>Edit Profile</Text>
                <Text style={styles.subText}>Change profile picture, number, E-mail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={() => setShowPassword(true)}>
                <Text style={styles.optionText}>Change Password</Text>
                <Text style={styles.subText}>Update and strengthen account security</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Terms of Use</Text>
                <Text style={styles.subText}>Read our terms and conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Bind GCash</Text>
                <Text style={styles.subText}>Securely bind GCash for payment</Text>
              </TouchableOpacity>
              <View style={styles.rowBetween}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.logoutButton]}
                  onPress={handleLogout} // Use new logout function
                >
                  <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Edit Profile Form */}
          {editing && (
            <>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Name"
                  placeholderTextColor={styles.placeholderColor.color}
                  value={editProfile.username}
                  onChangeText={(t) => setEditProfile({ ...editProfile, username: t })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Nickname"
                  placeholderTextColor={styles.placeholderColor.color}
                  value={editProfile.nickname}
                  onChangeText={(t) => setEditProfile({ ...editProfile, nickname: t })}
                />
              </View>
              {/* ... (Email, Phone, Address inputs) ... */}
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Email"
                  placeholderTextColor={styles.placeholderColor.color}
                  value={editProfile.email}
                  onChangeText={(t) => setEditProfile({ ...editProfile, email: t })}
                  keyboardType="email-address"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Phone"
                  placeholderTextColor={styles.placeholderColor.color}
                  value={editProfile.phone}
                  onChangeText={(t) => setEditProfile({ ...editProfile, phone: t })}
                  keyboardType="phone-pad"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={styles.placeholderColor.color}
                value={editProfile.address}
                onChangeText={(t) => setEditProfile({ ...editProfile, address: t })}
              />

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleUpdateProfile} // Use new update function
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setEditing(false)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Change Password Form */}
          {showPassword && (
            <>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Old Password"
                placeholderTextColor={styles.placeholderColor.color}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={styles.placeholderColor.color}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor={styles.placeholderColor.color}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handlePasswordChange} // Use new password change function
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setShowPassword(false)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... (createStyles function remains unchanged)
function createStyles(width, colorScheme) {
  const isLarge = width >= 700;
  const bg = colorScheme === "dark" ? "#0B0B0B" : "#fff";
  const text = colorScheme === "dark" ? "#F2F2F2" : "#000";
  const subText = colorScheme === "dark" ? "#CFCFCF" : "#555";
  const border = colorScheme === "dark" ? "#2B2B2B" : "#ccc";
  const inputBg = colorScheme === "dark" ? "#121212" : "#fff";
  const placeholderColor = colorScheme === "dark" ? "#9A9A9A" : "#8A8A8A";

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: bg },
    flex: { flex: 1 },
    container: {
      padding: isLarge ? 32 : 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: isLarge ? "row" : "row",
      alignItems: "center",
      marginBottom: isLarge ? 24 : 20,
      justifyContent: "flex-start",
      minHeight: isLarge ? 120 : 72,
      zIndex: 20,
      backgroundColor: bg, // ensure header background prevents overlap
    },
    headerLeft: {
      alignItems: "center",
      marginRight: isLarge ? 24 : 15,
      minWidth: isLarge ? 140 : 80,
    },
    headerRight: {
      flex: 1,
      justifyContent: "center",
    },
    profileImage: {
      width: isLarge ? 100 : 60,
      height: isLarge ? 100 : 60,
      borderRadius: isLarge ? 50 : 30,
      marginBottom: 6,
    },
    uploadText: {
      fontSize: 12,
      color: subText,
      textAlign: "center",
      marginTop: 4,
    },
    nameText: { fontSize: isLarge ? 22 : 18, fontWeight: "bold", color: text },
    emailText: { fontSize: isLarge ? 16 : 14, color: subText },
    sectionTitle: { fontSize: isLarge ? 22 : 20, fontWeight: "bold", marginBottom: 16, color: text },
    option: {
      padding: 15,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: inputBg,
    },
    optionText: { fontSize: 16, color: text },
    subText: { fontSize: 14, color: subText },
    input: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      padding: isLarge ? 14 : 10,
      marginBottom: 12,
      backgroundColor: inputBg,
      color: text,
    },
    placeholderColor: { color: placeholderColor },
    button: {
      backgroundColor: "#E2C7AE",
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: "center",
      minWidth: 120,
    },
    buttonText: { color: "#1f1f1f", fontWeight: "600" },
    logoutButton: { backgroundColor: "#D9534F" },
    logoutText: { color: "#fff" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    formRow: {
      flexDirection: isLarge ? "row" : "column",
      justifyContent: "space-between",
    },
    halfInput: {
      flex: 1,
      marginRight: isLarge ? 12 : 0,
    },
  });
}