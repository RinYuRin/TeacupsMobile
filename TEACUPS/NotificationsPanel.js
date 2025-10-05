import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationsPanel() {
  const [order, setOrder] = useState(null);
  const username = "Customer Name"; // Placeholder for now

  useEffect(() => {
    const loadOrder = async () => {
      const storedOrder = await AsyncStorage.getItem("latestOrder");
      if (storedOrder) setOrder(JSON.parse(storedOrder));
    };
    loadOrder();
  }, []);

  useEffect(() => {
    let timer;
    if (order && order.status === "Preparing") {
      timer = setTimeout(() => {
        const updatedOrder = { ...order, status: "Ready to Pick Up" };
        setOrder(updatedOrder);
        AsyncStorage.setItem("latestOrder", JSON.stringify(updatedOrder));
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [order]);

  // Calculate total price
  const totalPrice = order
    ? order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    : 0;

  return (
    <View style={styles.container}>
      {!order ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("./assets/emptynotif.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>Nothing Brewing ☕</Text>
<Text style={styles.emptyText}>Once you order, your notifications will pop up here! 🎉</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
         
          <View style={styles.card}>
            {/* Customer name inside the receipt */}
            <Text style={styles.receiptName}>Customer: {username}</Text>
            <Text style={styles.status}>
              Status:{" "}
              <Text
                style={[
                  styles.statusText,
                  order.status === "Preparing" ? styles.preparing : styles.ready,
                ]}
              >
                {order.status}
              </Text>
            </Text>
            <Text style={styles.time}>
              Ordered at: {new Date(order.time).toLocaleTimeString()}
            </Text>
            <Text style={styles.subtitle}>Items:</Text>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>x{item.quantity}</Text>
                <Text style={styles.itemDetail}>₱{item.totalPrice}</Text>
              </View>
            ))}
            {/* Total Price */}
            <Text style={styles.totalPrice}>Total: ₱{totalPrice}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#F8F8F8",
    padding: 24,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C68B59",
    marginBottom: 18,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#C68B59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#816356",
  },
  statusText: {
    fontWeight: "bold",
  },
  preparing: {
    color: "#C78429",
  },
  ready: {
    color: "#388E3C",
  },
  time: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#816356",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    color: "#C68B59",
    fontWeight: "bold",
    flex: 1,
  },
  itemDetail: {
    fontSize: 15,
    color: "#816356",
    marginLeft: 10,
  },
  receiptName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#816356",
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#C68B59",
    marginTop: 12,
    textAlign: "right",
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 150,
  },
  emptyImage: {
    width: 260,
    height: 260,
    
  },
  emptyTitle: {
   fontSize: 18,
    fontWeight: "700",
    color: "#C68B59",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
      fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
});