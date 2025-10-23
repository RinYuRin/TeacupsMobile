"use client"
import { useState, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar as RNStatusBar,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  Alert,
} from "react-native"
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Checkbox from "expo-checkbox";
import API from "./api";

SplashScreen.preventAutoHideAsync()

// Long text for Terms and Conditions
const TERMS_AND_CONDITIONS_TEXT = `Welcome to TeaCUPS! These Terms and Conditions ("Terms") govern your access to and use of the TeaCUPS mobile application (the "App"), whether as a user or admin. TeaCUPS ("we", "us", or "our") provides a platform for browsing, ordering, and managing tea and coffee shop items through a mobile device.

By accessing or using the App, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you should discontinue use of the App immediately.

1. Definitions
“App” refers to the TeaCUPS mobile application.
“User” refers to any customer using the App to browse or place orders.
“Admin” refers to authorized personnel who manage product listings, orders, and notifications through the App.
“You” or “Your” refers to the individual using the App, either as a user or an admin.

2. Eligibility
To use the TeaCUPS App, you must:
Be at least 13 years of age.
Have the legal capacity to enter into these Terms.
For admin access, be authorized by the TeaCUPS business owner or management.

3. Account Registration
To access the App’s features, you must create an account by providing a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials.
You agree to:
Provide accurate and updated information.
Not share your login credentials with others.
Notify us immediately of any unauthorized use of your account.
We reserve the right to suspend or terminate any account that violates these Terms.

4. App Features
The TeaCUPS App includes the following functions:
For Users:
Account registration and login/logout
Browse milk tea and coffee items
Add items to cart and proceed to checkout
Receive push notifications (e.g., order status, promotions)
Send messages to admins or customer support
View and edit profile information
For Admins:
Manage products and pricing
View and update order statuses
Send notifications to users
Access user messages and respond to inquiries
Monitor system activity

5. Messaging and Notifications
The App provides a messaging feature to allow communication between users and admins. All messages and notifications are stored in the system and may be monitored for support or moderation purposes.
You agree not to use messaging features to send spam, abuse, or inappropriate content.

6. Orders and Checkout
Users may browse menu items and place orders through the App’s checkout system. All orders are subject to:
Availability of items
Confirmation by the admin
Full payment at the time of ordering (if applicable)
Orders cannot be canceled or refunded once processed, unless permitted by our Refund Policy.

7. User Responsibilities
You agree to use the App only for lawful purposes and in accordance with these Terms. You agree not to:
Violate any local or national laws
Interfere with the App’s functionality or security
Attempt to gain unauthorized access to admin-only features
Misuse the messaging or notification system

8. Admin Responsibilities
Admins are responsible for:
Managing item availability and order tracking
Ensuring prompt communication with users
Keeping the platform professional and secure
Misuse of admin privileges may result in suspension or removal of access.

9. Privacy
Your use of the App is also governed by our [Privacy Policy], which explains how we collect, store, and use your personal information such as email, password, and transaction history.

10. Intellectual Property
All logos, trademarks, content, images, and software in the TeaCUPS App are owned or licensed by TeaCUPS. You may not copy, reproduce, or distribute any part of the App without our written permission.

11. Account Termination
We reserve the right to suspend or terminate any user or admin account at any time for:
Breach of these Terms
Inappropriate behavior or illegal activity
Fraudulent orders or impersonation
You may also delete your account at any time through the profile settings.

12. Limitation of Liability
To the fullest extent permitted by law, TeaCUPS shall not be liable for any damages arising from:
Use or inability to use the App
Errors or omissions in content
Delays in order processing or fulfillment
Unauthorized access to your account

13. Modifications to Terms
TeaCUPS may update these Terms at any time. We will notify you of major changes through the App or by email. Continued use of the App means you accept the updated Terms.

14. Governing Law
These Terms shall be governed by the laws of the [Insert Country/Region], without regard to conflict of law principles.

15. Contact Us
If you have questions or concerns regarding these Terms, please contact us at:
TeaCUPS Customer Support
Email: [insert email address]
Phone: [insert phone number]
Address: [insert office address]`

// Long text for Privacy Policy
const PRIVACY_POLICY_TEXT = `Privacy Policy – TeaCUPS Mobile Application
TeaCUPS ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the TeaCUPS mobile app, whether as a user or an admin.

1. Information We Collect
We collect the following types of data:
Personal Information: name, email address, password, profile picture (if uploaded)
Usage Data: app usage patterns, device type, OS version, IP address
Order Information: product selections, purchase history, transaction records
Communication Data: messages, feedback, and support inquiries

2. How We Use Your Information
We use your data to:
Provide and maintain the App’s services
Process orders and notify you of updates
Manage user and admin profiles
Respond to inquiries and customer service requests
Improve the performance and security of the App

3. Sharing of Information
We do not sell your personal data. We may share information with:
Authorized admin staff (for processing orders and managing the system)
Third-party service providers (for hosting, analytics, or payment services)
Authorities, if required by law or to protect rights and safety

4. Data Security
We implement appropriate security measures to protect your data, including encrypted passwords and restricted admin access.

5. User Rights
You may:
Update your profile information
Request deletion of your account and data
Opt out of notifications or promotional emails

6. Changes to This Policy
We may update this policy from time to time. Continued use of the App after changes indicates acceptance.

7. Contact Us
Email: [Insert Support Email]
Phone: [Insert Phone Number]
Address: [Insert Company Address]`

// Long text for Refund Policy (Agreement)
const REFUND_POLICY_TEXT = `Refund Policy – TeaCUPS Mobile Application
Thank you for ordering from TeaCUPS! We aim to provide the best service and product quality. Please review our Refund Policy:

1. Eligibility for Refunds
Refunds may be issued in the following cases:
The order was canceled by the admin before preparation
The wrong item was delivered
The item delivered was damaged or spoiled upon arrival

2. Non-Refundable Situations
Change of mind after checkout
Incorrect order made by the customer
Delays caused by factors outside our control (e.g., traffic or third-party delivery issues)

3. How to Request a Refund
To request a refund, contact us within 24 hours of the incident with:
Order ID
Description of the issue
Photo evidence (if applicable)

4. Refund Method
Approved refunds will be processed via the original payment method within 5–7 business days.

5. Contact for Refunds
Email: [Insert Support Email]
Subject: "Refund Request – Order #[Order Number]"`

// Helper function to render text with bolded numbered headings
const renderNumberedText = (text) => {
  const lines = text.split("\n")
  return lines.map((line, index) => {
    // Regex to match a number followed by a dot and optional space at the beginning of a line
    const isNumberedHeading = line.match(/^\d+\.\s/)
    if (isNumberedHeading) {
      // If it's a numbered heading, apply boldText style to the entire line
      return (
        <Text key={index} style={[styles.modalText, styles.boldText]}>
          {line}
        </Text>
      )
    }
    // If not a numbered heading, render with default modalText style
    return (
      <Text key={index} style={styles.modalText}>
        {line}
      </Text>
    )
  })
}

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [showAgreementModal, setShowAgreementModal] = useState(false) // New state for Agreement modal

  const [role, setRole] = useState("user");

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    if (!acceptTerms || !acceptPolicy) {
      Alert.alert(
        "Error",
        "You must accept both the Terms and Conditions and the Policy and Agreement!"
      );
      return;
    }

    try {
      const response = await fetch(`${API.baseURL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }), // Send role
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Signup Failed", data.message || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Signup fetch error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  const handleLogin = () => {
    console.log("Login pressed");
    navigation.navigate("Login");
  };

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.fullScreenContainer} onLayout={onLayoutRootView}>
      <RNStatusBar barStyle="light-content" backgroundColor="#806153" />
      <View style={styles.headerBar} />
      {/* Removed scrollEnabled={false} from the main ScrollView to make it scrollable */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.topIllustrationContainer}>
          <Image source={require("./assets/image/signup.png")} style={styles.topIllustration} />
          <View style={styles.topTextOverlay}>
            <Text style={styles.logInTitle}>SIGN UP</Text>
            <Text style={styles.toContinueText}>TO CONTINUE</Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputRowContainer}>
            <View style={styles.inputArea}>
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
            <Image source={require("./assets/image/email.png")} style={styles.inputSideIcon} />
          </View>
          {/* Password Input */}
          <View style={styles.inputRowContainer}>
            <View style={styles.inputArea}>
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
            <Image source={require("./assets/image/pass.png")} style={styles.inputSideIcon} />
          </View>
          {/* Confirm Password Input */}
          <View style={styles.inputRowContainer}>
            <View style={styles.inputArea}>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#555"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Image
                    source={
                      showConfirmPassword
                        ? require("./assets/image/password=show.png")
                        : require("./assets/image/password=hide.png")
                    }
                    style={styles.iconImage}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Image source={require("./assets/image/copass.png")} style={styles.inputSideIcon} />
          </View>

          {/* Terms and Conditions Checkbox */}
          <View style={styles.termsContainer}>
            <Checkbox
              value={acceptTerms}
              onValueChange={setAcceptTerms}
              color={acceptTerms ? "#AD9761" : "#CCC"}
              style={styles.checkbox}
            />
            <Text style={styles.termsText}>
              I have accept the{" "}
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={styles.termsLink}>Terms</Text>
              </TouchableOpacity>{" "}
              and{" "}
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={styles.termsLink}>Conditions</Text>
              </TouchableOpacity>
            </Text>
          
          {/* Policy and Agreement Checkbox */}
          <View style={styles.termsContainer}>
            <Checkbox
              value={acceptPolicy}
              onValueChange={setAcceptPolicy}
              color={acceptPolicy ? "#AD9761" : "#CCC"}
              style={styles.checkbox}
            />
            <Text style={styles.termsText}>
              I have accept the{" "}
              <TouchableOpacity onPress={() => setShowPolicyModal(true)}>
                <Text style={styles.termsLink}>Policy</Text>
              </TouchableOpacity>{" "}
              and{" "}
              <TouchableOpacity onPress={() => setShowAgreementModal(true)}>
                <Text style={styles.termsLink}>Agreement</Text>
              </TouchableOpacity>
            </Text>
          </View>
          </View>
          {/* 3. Add UI for Role Selection (Switch) */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { flex: 1, fontSize: 14 }]}>
              Sign up as Admin:
            </Text>
            <Switch
              trackColor={{ false: "#CCC", true: "#AD9761" }}
              thumbColor={role === "admin" ? "#f4f3f4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(isAdmin) => setRole(isAdmin ? "admin" : "user")}
              value={role === "admin"}
              style={{ marginLeft: 10 }}
            />
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
            <Text style={styles.loginButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Already have an Account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.signUpLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Removed the bottomIllustrations container */}

      {/* Terms and Conditions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTermsModal(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Terms and Conditions</Text>
                <ScrollView style={styles.modalScrollView}>{renderNumberedText(TERMS_AND_CONDITIONS_TEXT)}</ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPolicyModal}
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPolicyModal(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
                <ScrollView style={styles.modalScrollView}>{renderNumberedText(PRIVACY_POLICY_TEXT)}</ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Refund Policy (Agreement) Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAgreementModal}
        onRequestClose={() => setShowAgreementModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAgreementModal(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Refund Policy</Text>
                <ScrollView style={styles.modalScrollView}>{renderNumberedText(REFUND_POLICY_TEXT)}</ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
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
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 100, // Keep padding to ensure content isn't cut off at the bottom
  },
  topIllustrationContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 70,
    marginTop: 35,
  },
  topIllustration: {
    width: 365.27,
    height: 267,
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
    color: "#00000",
    marginBottom: -10,
    fontFamily: "Poppins-Bold",
  },
  toContinueText: {
    fontSize: 26,
    color: "#00000",
    letterSpacing: 2,
    fontFamily: "Poppins-Light",
  },
  formContainer: {
    width: "75%",
    alignItems: "center",
    marginBottom: 20,
  },
  inputRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  inputArea: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    height: 40,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
    fontFamily: "Poppins-Regular",
    paddingLeft: 5,
    borderBottomWidth: 0,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 0,
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
  inputSideIcon: {
    width: 47,
    height: 47,
    marginLeft: -15,
    resizeMode: "contain",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center", // Aligns checkbox and text vertically
    width: "100%", // Takes full width of formContainer
    marginBottom: 10,
    marginTop: 5,
    zIndex: 1,
    // Removed marginLeft: 50
  },
  checkbox: {
    marginRight: 8, // Adjusted gap
  },
  termsText: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins-Regular",
    flex: 1, // Allows text to wrap naturally within remaining space
    // Removed padding: -2
  },
  termsLink: {
    fontSize: 12,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontFamily: "Poppins-Bold",
    color: "#000000",
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 30,
    display: "none",
  },
  forgotPasswordText: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins-Light",
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
  // Removed bottomIllustrations styles as the component is removed
  // bottomIllustrations: {
  //   position: "absolute",
  //   bottom: 0,
  //   width: "100%",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   paddingHorizontal: 0,
  //   margin: 0,
  //   zIndex: 1,
  // },
  // bottomLeftImage: {
  //   width: 160,
  //   height: 162.39,
  //   resizeMode: "contain",
  //   alignSelf: "flex-end",
  //   marginLeft: -15,
  // },
  // bottomRightImage: {
  //   width: 145,
  //   height: 216.26,
  //   resizeMode: "contain",
  //   alignSelf: "flex-end",
  //   marginRight: -15,
  // },
  // Modal Styles (reused for all three modals)
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    height: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  modalScrollView: {
    width: "100%",
    marginBottom: 0,
    flex: 1,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Base font for all modal text
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
  },
  boldText: {
    fontFamily: "Poppins-Bold", // Apply Poppins-Bold to the entire heading line
  },
})
