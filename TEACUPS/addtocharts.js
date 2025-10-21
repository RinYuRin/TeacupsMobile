import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api"; // Import your API config
import Checkbox from "expo-checkbox"; // Import Checkbox
import { ShoppingCart } from "lucide-react-native"; // Import icon

const HEADER_HEIGHT = 72; // Height of the absolute header from Userhome.js

export default function AddToCharts({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // ... (loadCart function remains the same) ...
  const loadCart = async () => {
    setLoading(true);
    try {
      let currentUserId = userId;
      // 1. Get User ID from AsyncStorage
      if (!currentUserId) {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          setCart([]); // No user logged in, cart is empty
          return;
        }
        const user = JSON.parse(storedUser);
        if (!user || !user._id) {
          setLoading(false);
          setCart([]);
          return;
        }
        currentUserId = user._id;
        setUserId(user._id); // Save user ID for later
      }

      // 2. Fetch cart items from the backend
      const response = await fetch(`${API.baseURL}/cart/${currentUserId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data);
      setSelectedItems([]); // Clear selection on cart reload
    } catch (error) {
      console.error("Failed to load cart:", error);
      Alert.alert("Error", "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ... (handleRemove function remains the same) ...
  const handleRemove = async (cartItemId, currentQuantity) => {
    // ... (This function remains unchanged)
    try {
      let response;
      if (currentQuantity > 1) {
        // 1. Decrement quantity if more than 1
        response = await fetch(`${API.baseURL}/cart/decrement/${cartItemId}`, {
          method: "PATCH",
        });
      } else {
        // 2. Remove item if quantity is 1
        response = await fetch(`${API.baseURL}/cart/remove/${cartItemId}`, {
          method: "DELETE",
        });
      }

      const data = await response.json();

      if (response.ok) {
        // 3. Refresh cart from state for instant UI update
        if (currentQuantity > 1) {
          setCart(
            cart.map((item) =>
              item._id === cartItemId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          );
        } else {
          setCart(cart.filter((item) => item._id !== cartItemId));
          // Also remove from selected if it was selected
          setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
        }
      } else {
        Alert.alert("Error", data.message || "Could not update cart.");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  // ... (handleToggleSelect function remains the same) ...
  const handleToggleSelect = (cartItemId) => {
    if (selectedItems.includes(cartItemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
    } else {
      setSelectedItems([...selectedItems, cartItemId]);
    }
  };

  // ... (handleBuy function remains the same) ...
  const handleBuy = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("No items selected", "Please check the items you want to buy.");
      return;
    }

    try {
      const response = await fetch(`${API.baseURL}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          cartItemIds: selectedItems, // Send the array of selected item IDs
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success!", data.message);
        // Refresh the cart from the backend since items were deleted
        loadCart();
        // You can navigate to an order history screen or notifications
        // navigation.navigate("Notifications", { order: data.order });
      } else {
        Alert.alert("Order Failed", data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Buy error:", error);
      Alert.alert("Network Error", "Unable to place order.");
    }
  };

  // ... (grandTotal calculation remains the same) ...
  const grandTotal = cart
    .filter((item) => selectedItems.includes(item._id)) // Filter selected
    .reduce((sum, item) => {
      const price = Number(item.totalPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#C68B59" />
        <Text style={{ marginTop: 10, color: "#816356" }}>Loading Your Cart...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {cart.length > 0 ? (
          <>
            {/* FIX 1: Add style={{ flex: 1 }} to the ScrollView */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
            >
              {cart.map((item) => {
                const isSelected = selectedItems.includes(item._id);
                return (
                  <View key={item._id} style={styles.card}>
                    {/* ... (Checkbox, Image, Info, DeleteBtn) ... */}
                    <Checkbox
                      style={styles.checkbox}
                      value={isSelected}
                      onValueChange={() => handleToggleSelect(item._id)}
                      color={isSelected ? "#C68B59" : undefined}
                    />
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                    />
                    <View style={styles.info}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productDetail}>
                        Size:{" "}
                        <Text style={styles.bold}>{item.selectedSize}</Text>
                      </Text>
                      <Text style={styles.productDetail}>
                        Add-ons:{" "}
                        <Text style={styles.bold}>
                          {item.addons.length ? item.addons.join(", ") : "None"}
                        </Text>
                      </Text>
                      <Text style={styles.productDetail}>
                        Quantity:{" "}
                        <Text style={styles.bold}>{item.quantity}</Text>
                      </Text>
                      <Text style={styles.productPrice}>
                        ₱{item.totalPrice} (each)
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleRemove(item._id, item.quantity)}
                    >
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* This footer will now be pushed to the bottom */}
            <View style={styles.footer}>
              {/* ... (Footer content) ... */}
              <View style={styles.totalContainer}>
                <Text style={styles.grandTotal}>Total: ₱{grandTotal}</Text>
                <View style={styles.quantityIcon}>
                  <ShoppingCart size={14} color="#C68B59" />
                  <Text style={styles.quantityText}>
                    {selectedItems.length}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  selectedItems.length === 0 && styles.buyBtnDisabled,
                ]}
                onPress={handleBuy}
                disabled={selectedItems.length === 0}
              >
                <Text style={styles.buyText}>Buy</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* FIX 3: Wrap empty state in a centering container */
          <View style={styles.emptyContainer}>
            <Image
              source={require("./assets/empty_cart.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Oops! Your cart is empty 🌿</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven’t picked your favorite milk tea yet. Browse
              our menu and treat yourself to something sweet and refreshing!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    /* FIX 2: Add padding to account for Userhome header */
    paddingTop: HEADER_HEIGHT + 16, // 72px header + 16px padding
    backgroundColor: "#F8F8F8",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 16, // Add some padding at the bottom of the list
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#C68B59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#C68B59",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C68B59",
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  bold: {
    fontWeight: "bold",
    color: "#816356",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C68B59",
    marginTop: 4,
  },
  deleteBtn: {
    marginLeft: 8,
    backgroundColor: "#F8D7DA",
    borderRadius: 16,
    padding: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#C78429",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    /* This margin lifts it above the tab bar */
    marginBottom: 90,
    shadowColor: "#C68B59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#816356",
  },
  quantityIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF8F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#FAEEDD",
  },
  quantityText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#C68B59",
  },
  buyBtn: {
    backgroundColor: "#C68B59",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buyBtnDisabled: {
    backgroundColor: "#E0C9B6", // Lighter color when disabled
  },
  buyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  /* FIX 3: Styles for the empty cart container */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Move it up a bit
  },
  emptyImage: {
    /* remove marginTop: 150 */
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C68B59",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
});