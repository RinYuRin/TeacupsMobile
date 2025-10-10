import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductDetails = ({ navigation, route }) => {
  const { product } = route.params;

  const [selectedSize, setSelectedSize] = useState("Regular");
  const [addons, setAddons] = useState([]);

  // Get prices from product.prices if available, fallback to default
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

  const availableAddons = [
    { label: "Cashew Nuts", price: 10 },
    { label: "Candy Toppings", price: 15 },
    { label: "Coffee Jelly", price: 10 },
    { label: "Cheesecake", price: 15 },
    { label: "Fruit Jelly", price: 10 },
    { label: "Cream Cheese", price: 15 },
    { label: "Nata", price: 10 },
    { label: "Crushed Oreo", price: 15 },
    { label: "Tapioca Pearl", price: 10 },
    { label: "Espresso", price: 15 },
    { label: "Popping Bobba", price: 10 },
    { label: "Marshmallows", price: 15 },
    { label: "Cream Puff", price: 15 },
  ];

  const toggleAddon = (addon) => {
    if (addons.includes(addon)) {
      setAddons(addons.filter((a) => a !== addon));
    } else {
      setAddons([...addons, addon]);
    }
  };

  // Use only the selected size price for total
  const sizePrice = sizes.find((s) => s.label === selectedSize)?.price || product.price;
  const addonsPrice = addons.reduce(
    (sum, addon) => sum + (availableAddons.find((a) => a.label === addon)?.price || 0),
    0
  );
  const totalPrice = sizePrice + addonsPrice;

  const handleAddToCart = async () => {
    const cartProduct = {
      ...product,
      selectedSize,
      addons,
      totalPrice,
    };

    // Load existing cart
    const storedCart = await AsyncStorage.getItem("cart");
    const cart = storedCart ? JSON.parse(storedCart) : [];

    // Add new product
    cart.push(cartProduct);

    // Save updated cart
    await AsyncStorage.setItem("cart", JSON.stringify(cart));

    // Show notification only, do NOT navigate
    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>TeaCups</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>4.5 ⭐</Text>
          </View>
        </View>

        {/* Product Details */}
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>
  {product.description ||
    "Indulge in the perfect balance of rich, creamy milk and freshly brewed tea, blended to create a smooth and refreshing taste that lingers with every sip. Crafted with care, this drink is more than just milk tea — it’s a comforting escape in a cup, designed to brighten your day and satisfy your cravings."}
</Text>


        {/* Size Selection */}
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

        {/* Add-ons */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.price}>₱{totalPrice}</Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
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
