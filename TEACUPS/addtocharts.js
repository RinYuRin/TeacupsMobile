import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api";
import Checkbox from "expo-checkbox";
import { ShoppingCart } from "lucide-react-native";
import Toast from "react-native-toast-message";

const HEADER_HEIGHT = 72;

export default function AddToCharts({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null); // ✅ ADDED: State for username
  const [selectedItems, setSelectedItems] = useState([]);

  const loadCart = async () => {
    setLoading(true);
    try {
      let currentUserId = userId;
      let currentUsername = username; // ✅ ADDED: Variable for username

      if (!currentUserId) {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          setCart([]);
          Toast.show({
            type: "error",
            text1: "Login Required",
            text2: "Please log in to view your cart.",
          });
          return;
        }

        const user = JSON.parse(storedUser);
        if (!user || !user._id) {
          setLoading(false);
          setCart([]);
          Toast.show({
            type: "error",
            text1: "Invalid User",
            text2: "Please log in again.",
          });
          return;
        }

        currentUserId = user._id;
        currentUsername = user.username; // ✅ ADDED: Get username from stored user
        setUserId(user._id);
        setUsername(user.username); // ✅ ADDED: Set username state
      }

      const response = await fetch(`${API.baseURL}/cart/${currentUserId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      setCart(data);
      setSelectedItems([]);
    } catch (error) {
      console.error("Failed to load cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not load your cart.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (cartItemId, currentQuantity) => {
    // ... (This function remains unchanged)
    try {
      let response;
      if (currentQuantity > 1) {
        response = await fetch(`${API.baseURL}/cart/decrement/${cartItemId}`, {
          method: "PATCH",
        });
      } else {
        response = await fetch(`${API.baseURL}/cart/remove/${cartItemId}`, {
          method: "DELETE",
        });
      }

      const data = await response.json();

      if (response.ok) {
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
          setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
        }

        Toast.show({
          type: "success",
          text1: "Cart Updated",
          text2:
            currentQuantity > 1
              ? "Item quantity reduced."
              : "Item removed successfully.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.message || "Could not update cart.",
        });
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Could not connect to server.",
      });
    }
  };

  const handleToggleSelect = (cartItemId) => {
    // ... (This function remains unchanged)
    if (selectedItems.includes(cartItemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
    } else {
      setSelectedItems([...selectedItems, cartItemId]);
    }
  };

  const handleBuy = async () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Items Selected",
        text2: "Please select items to purchase.",
      });
      return;
    }

    try {
      const response = await fetch(`${API.baseURL}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ CHANGED: Send username along with userId
        body: JSON.stringify({
          userId: userId,
          username: username, 
          cartItemIds: selectedItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Order Placed!",
          text2: data.message || "Your order has been created successfully.",
        });
        loadCart();
      } else {
        Toast.show({
          type: "error",
          text1: "Order Failed",
          text2: data.message || "An error occurred.",
        });
      }
    } catch (error) {
      console.error("Buy error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Unable to place order.",
      });
    }
  };

  const grandTotal = cart
    .filter((item) => selectedItems.includes(item._id))
    .reduce((sum, item) => {
      const price = Number(item.totalPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

  if (loading) {
    // ... (This section remains unchanged)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#C68B59" />
        <Text style={{ marginTop: 10, color: "#816356" }}>
          Loading Your Cart...
        </Text>
      </View>
    );
  }

  return (
    // ... (The entire return() block and styles remain unchanged)
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {cart.length > 0 ? (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
            >
              {cart.map((item) => {
                const isSelected = selectedItems.includes(item._id);
                return (
                  <View key={item._id} style={styles.card}>
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
                        Size: <Text style={styles.bold}>{item.selectedSize}</Text>
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

            <View style={styles.footer}>
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
          <View style={styles.emptyContainer}>
            <Image
              source={require("./assets/empty_cart.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Oops! Your cart is empty 🌿</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven’t picked your favorite milk tea yet.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (All styles remain unchanged)
  safeArea: { flex: 1, backgroundColor: "#F8F8F8" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: HEADER_HEIGHT + 16,
    backgroundColor: "#F8F8F8",
  },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 16 },
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
  info: { flex: 1, justifyContent: "center" },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C68B59",
    marginBottom: 4,
  },
  productDetail: { fontSize: 14, color: "#444", marginBottom: 2 },
  bold: { fontWeight: "bold", color: "#816356" },
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
  deleteText: { color: "#C78429", fontSize: 18, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 90,
    shadowColor: "#C68B59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  totalContainer: { flexDirection: "row", alignItems: "center" },
  grandTotal: { fontSize: 18, fontWeight: "bold", color: "#816356" },
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
  buyBtnDisabled: { backgroundColor: "#E0C9B6" },
  buyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyImage: {
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