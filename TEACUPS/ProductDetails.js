import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import API from "./api";

const ProductDetails = ({ navigation, route }) => {
  const { product } = route.params;

  const [selectedSize, setSelectedSize] = useState("Regular");
  const [addons, setAddons] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);

  const hasSizes = !!product.prices;
  const sizePrices = product.prices || { regular: product.price };
  const sizes = hasSizes
    ? [
        { label: "Regular", price: sizePrices.regular },
        { label: "Medium", price: sizePrices.medium },
        { label: "Large", price: sizePrices.large },
        { label: "Buy1Take1", price: sizePrices.buy1take1 },
      ].filter((s) => s.price !== undefined)
    : [{ label: "Regular", price: product.price }];

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch(`${API.baseURL}/product/fetch`);
        const allProducts = await res.json();

        const formattedAddons = allProducts
          .filter((p) => p.category.toUpperCase() === "ADDS ON")
          .map((p) => ({
            label: p.name,
            price: Number(p.priceS) || 0,
          }));

        setAvailableAddons(formattedAddons);
      } catch (err) {
        console.error("Failed to fetch add-ons:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load add-ons from the server.",
        });
      }
    };

    fetchAddons();
  }, []);

  const toggleAddon = (addon) => {
    if (addons.includes(addon)) {
      setAddons(addons.filter((a) => a !== addon));
    } else {
      setAddons([...addons, addon]);
    }
  };

  const sizePrice =
    sizes.find((s) => s.label === selectedSize)?.price || product.price;
  const addonsPrice = addons.reduce(
    (sum, addon) =>
      sum + (availableAddons.find((a) => a.label === addon)?.price || 0),
    0
  );
  const totalPrice = sizePrice + addonsPrice;

  const handleAddToCart = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "Please log in before adding to cart.",
        });
        return;
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch (parseError) {
        console.error("Error parsing stored user:", parseError);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid stored user data. Please log in again.",
        });
        return;
      }

      if (!user || !user._id) {
        console.error("Invalid user data:", user);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User ID not found. Please log in again.",
        });
        return;
      }

      console.log("Sending Add to Cart for user:", user._id);

      const response = await fetch(`${API.baseURL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          email: user.email,
          productId: product._id || product.id,
          name: product.name,
          image: product.image,
          selectedSize,
          addons,
          totalPrice,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Added to Cart",
          text2: `${product.name} added successfully.`,
        });
      } else {
        console.error("Server error:", data);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.message || "Failed to add to cart.",
        });
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to connect to server.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>TeaCups</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>4.5 ⭐</Text>
          </View>
        </View>

        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>
          {product.description ||
            "Indulge in the perfect balance of rich, creamy milk and freshly brewed tea, blended to create a smooth and refreshing taste that lingers with every sip."}
        </Text>

        {hasSizes && (
          <>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size.label}
                  style={[
                    styles.sizeButton,
                    selectedSize === size.label && styles.sizeSelected,
                  ]}
                  onPress={() => setSelectedSize(size.label)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size.label && { color: "#fff" },
                    ]}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Add-ons</Text>
        <View style={styles.addonContainer}>
          {availableAddons.map((addon) => (
            <TouchableOpacity
              key={addon.label}
              style={[
                styles.addonButton,
                addons.includes(addon.label) && styles.addonSelected,
              ]}
              onPress={() => toggleAddon(addon.label)}
            >
              <Text
                style={[
                  styles.addonText,
                  addons.includes(addon.label) && { color: "#fff" },
                ]}
              >
                {addon.label} +₱{addon.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.price}>₱{totalPrice}</Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Component */}
      <Toast />
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  imageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeSelected: {
    backgroundColor: "#C78429",
    borderColor: "#C78429",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  addonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  addonButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  addonSelected: {
    backgroundColor: "#C78429",
    borderColor: "#C78429",
  },
  addonText: {
    fontSize: 14,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addToCartButton: {
    backgroundColor: "#C78429",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
