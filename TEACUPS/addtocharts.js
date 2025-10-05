import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function groupCart(cart) {
  const grouped = [];
  cart.forEach(item => {
    // Create a unique key for each product variant
    const key = `${item.name}_${item.selectedSize}_${item.addons.sort().join(",")}`;
    const found = grouped.find(g =>
      g.key === key
    );
    if (found) {
      found.quantity += 1;
      found.totalPrice += item.totalPrice;
    } else {
      grouped.push({
        ...item,
        key,
        quantity: 1,
      });
    }
  });
  return grouped;
}

export default function AddToCharts({ navigation }) {
  const [cart, setCart] = useState([]);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) setCart(JSON.parse(storedCart));
    };
    loadCart();
  }, []);

  // Remove one quantity or whole product
  const handleRemove = async (idx) => {
    // Find the grouped product
    const grouped = groupCart(cart);
    const toRemove = grouped[idx];
    let removed = 0;
    const newCart = cart.filter(item => {
      const key = `${item.name}_${item.selectedSize}_${item.addons.sort().join(",")}`;
      if (removed === 0 && key === toRemove.key) {
        removed = 1;
        return false;
      }
      return true;
    });
    setCart(newCart);
    await AsyncStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Buy all products
  const handleBuy = async () => {
    if (cart.length === 0) return;
    const order = {
      items: groupCart(cart),
      status: "Preparing",
      time: new Date().toISOString(),
      id: Date.now(),
    };
    // Save order to AsyncStorage (or pass via navigation)
    await AsyncStorage.setItem("latestOrder", JSON.stringify(order));
    setCart([]);
    await AsyncStorage.removeItem("cart");
    navigation.navigate("Notifications", { order });
  };

  const groupedCart = groupCart(cart);
  const grandTotal = groupedCart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {groupedCart.length > 0 ? (
          <>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {groupedCart.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.info}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDetail}>Size: <Text style={styles.bold}>{item.selectedSize}</Text></Text>
                    <Text style={styles.productDetail}>Add-ons: <Text style={styles.bold}>{item.addons.length ? item.addons.join(", ") : "None"}</Text></Text>
                    <Text style={styles.productDetail}>Quantity: <Text style={styles.bold}>{item.quantity}</Text></Text>
                    <Text style={styles.productPrice}>₱{item.totalPrice}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(idx)}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add extra space at the bottom so footer is not covered */}
              <View style={{ height: 90 }} />
            </ScrollView>
            <View style={styles.footer}>
              <Text style={styles.grandTotal}>Total: ₱{grandTotal}</Text>
              <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
                <Text style={styles.buyText}>Buy</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Image
              source={require("./assets/empty_cart.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Oops! Your cart is empty 🌿</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven’t picked your favorite milk tea yet.
              Browse our menu and treat yourself to something sweet and refreshing!
            </Text>
          </>
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
    paddingTop: 16,
    paddingBottom: 0,
    backgroundColor: "#F8F8F8",
  },
  scrollContent: {
    paddingBottom: 120, // enough space for footer and nav bar
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
    marginBottom: 90, // <-- Add margin so it's above nav bar
    shadowColor: "#C68B59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#816356",
  },
  buyBtn: {
    backgroundColor: "#C68B59",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  emptyImage: {
    marginTop: 150,
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
