import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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

  const [isEditing, setIsEditing] = useState(false);

  // OTP state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Sample user data (later can be fetched from DB)
  const [profile, setProfile] = useState({
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 912 345 6789",
    address: "Manila, Philippines",
    picture: "https://via.placeholder.com/120", // default picture
  });

  // Handle text changes
  const handleChange = (key, value) => {
    setProfile({ ...profile, [key]: value });
  };

  // Pick image from gallery or camera
  const changeProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    Alert.alert("Change Profile Picture", "Choose a source:", [
      {
        text: "Camera",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!result.canceled) {
            setProfile({ ...profile, picture: result.assets[0].uri });
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
            setProfile({ ...profile, picture: result.assets[0].uri });
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Handle "Done" → show OTP modal
  const handleDone = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    console.log("OTP sent to:", profile.phone, "=>", newOtp); // simulate OTP sending

    setShowOTPModal(true);
  };

  // Verify OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
      setShowOTPModal(false);
      setOtp("");
    } else {
      Alert.alert("Error", "Invalid OTP. Try again.");
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
        <Image source={{ uri: profile.picture }} style={styles.profileImage} />
        <TouchableOpacity style={styles.changePicButton} onPress={changeProfilePicture}>
          <Text style={styles.changePicText}>Change</Text>
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
          <Text style={styles.info}>{profile.name}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => handleChange("email", text)}
          />
        ) : (
          <Text style={styles.info}>{profile.email}</Text>
        )}

        <Text style={styles.label}>Phone Number</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => handleChange("phone", text)}
          />
        ) : (
          <Text style={styles.info}>{profile.phone}</Text>
        )}

        <Text style={styles.label}>Address</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={profile.address}
            onChangeText={(text) => handleChange("address", text)}
          />
        ) : (
          <Text style={styles.info}>{profile.address}</Text>
        )}
      </View>

      {/* Edit / Done Button */}
      {isEditing ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "green" }]}
          onPress={handleDone}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      {/* OTP Modal */}
      <Modal visible={showOTPModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <Text style={styles.modalText}>
              A verification code was sent to {profile.phone}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={verifyOtp}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red", marginTop: 10 }]}
              onPress={() => setShowOTPModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16,  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: -150,
    width: 900,
    height: 900,
    opacity: 0.50,
    zIndex: -1,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", fontFamily: "Poppins-Bold" },

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
  label: { fontSize: 14, fontWeight: "600", marginTop: 10, color: "#555", fontFamily: "Poppins-Bold" },
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
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontFamily: "Poppins-Bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, fontFamily: "Poppins-Bold" },
  modalText: { fontSize: 14, textAlign: "center", marginBottom: 10, fontFamily: "Poppins-Regular" },

  
});
