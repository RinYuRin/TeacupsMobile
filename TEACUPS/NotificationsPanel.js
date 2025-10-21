import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api"; // Make sure API is imported

const HEADER_HEIGHT = 72; // Height of the absolute header from Userhome.js

export default function NotificationsPanel() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch user and their orders
  const loadData = useCallback(async () => {
    try {
      // 1. Get User from AsyncStorage
      let currentUser = user;
      if (!currentUser) {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return; // No user logged in
        }
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      }

      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return; // Invalid user object
      }

      // 2. Fetch Orders from the backend using user ID
      const response = await fetch(`${API.baseURL}/orders/${currentUser._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data); // Set the array of orders
    } catch (error) {
      console.error("Failed to load notification data:", error);
      // Don't show an alert here, as it would be annoying with polling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]); // Depend on 'user' state

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling: Set up an interval to auto-refresh orders every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData();
    }, 10000); // 10 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [loadData]); // Re-run if loadData function changes

  // Manual refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // 3. Get the display name: username, nickname, or fallback to email
  const displayName = user?.username || user?.nickname || user?.email || "Customer";

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <ActivityIndicator size="large" color="#C68B59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        // Empty state
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Image
            source={require("./assets/emptynotif.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>Nothing Brewing ☕</Text>
          <Text style={styles.emptyText}>
            Once you order, your notifications will pop up here! 🎉
          </Text>
        </ScrollView>
      ) : (
        // List of orders
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 4. Map over all orders */}
          {orders.map((order) => (
            <View key={order._id} style={styles.card}>
              <Text style={styles.receiptName}>Customer: {displayName}</Text>
              <Text style={styles.status}>
                Status:{" "}
                <Text
                  style={[
                    styles.statusText,
                    order.status === "Preparing"
                      ? styles.preparing
                      : order.status === "Ready to Pick Up"
                      ? styles.ready
                      : styles.completed, // Add other statuses if needed
                  ]}
                >
                  {order.status}
                </Text>
              </Text>
              <Text style={styles.time}>
                Ordered at: {new Date(order.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.subtitle}>Items:</Text>
              
              {/* 5. Map over items in *this* order */}
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemDetail}>x{item.quantity}</Text>
                  <Text style={styles.itemDetail}>
                    ₱{item.totalPrice * item.quantity}
                  </Text>
                </View>
              ))}
              
              {/* 6. Use grandTotal from the order object */}
              <Text style={styles.totalPrice}>Total: ₱{order.grandTotal}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F8F8F8",
    // Add padding to account for Userhome header
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 24,
  },
  scrollContainer: {
    paddingBottom: 120, // Space for nav bar
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
    marginBottom: 16, // Space between cards
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
    color: "#C78429", // Orange
  },
  ready: {
    color: "#388E3C", // Green
  },
  completed: {
    color: "#816356", // Brown
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
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    color: "#C68B59",
    fontWeight: "bold",
    flex: 1, // Allow name to take space
    marginRight: 8,
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
    paddingBottom: 100, // Move it up a bit from nav bar
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