"use client"

// 1. Added useEffect and useMemo
import { useState, useEffect, useMemo, useCallback } from "react" 
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Search } from "lucide-react-native"
import { BlurView } from "expo-blur"
import {
  MessageCircle,
  Bell,
  Star,
  Package,
  Boxes,
  BarChart3,
  Settings,
  Home,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native"; 

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useFonts } from "expo-font"

// 2. Added API import (assuming path)
import API from "./api";

// Use this image for all products fallback
const SAMPLE_IMG_URL = "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

// ✅ NEW: Image Map to link DB names to static assets
const inventoryImageMap = {
  "Black Tea": require("./assets/image/Inventory/BlackTea.png"),
  "Green Tea": require("./assets/image/Inventory/GreenTea.png"),
  "Fresh Milk": require("./assets/image/Inventory/Freshmilk.png"),
  "Tapioca Pearls": require("./assets/image/Inventory/Pearls.png"),
  "Coffee Jelly": require("./assets/image/Inventory/Jelly.png"),
  "Sugar Syrup": require("./assets/image/Inventory/SugarSyrup.png"),
  "Brown Sugar": require("./assets/image/Inventory/BrownSugar.png"),
  "Chocolate Syrup": require("./assets/image/Inventory/Chocolate.png"),
  "Strawberry Syrup": require("./assets/image/Inventory/Strawberry.png"),
  "Ube Powder": require("./assets/image/Inventory/Ube.png"),
  "Cups (Regular)": require("./assets/image/Inventory/Cup.png"),
  "Cups (Medium)": require("./assets/image/Inventory/Cup.png"),
  "Cups (Large)": require("./assets/image/Inventory/Cup.png"),
  "Dome Lids": require("./assets/image/Inventory/Lids.png"),
  "Straws": require("./assets/image/Inventory/Straws.png"),
  "Sealing Film": require("./assets/image/Inventory/Sealingfilm.png"),
};

// Helper to get image, falling back to a default if name not in map
const getInventoryImage = (name) => {
  const cleanName = name.trim(); 
  return inventoryImageMap[cleanName] || require("./assets/image/Inventory/Cup.png"); 
};


export default function Dashboard({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  })

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("Today")
  const [activeNavItem, setActiveNavItem] = useState("Dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date()) 
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- DATA STATE ---
  const [allPurchases, setAllPurchases] = useState([]); 
  const [allProducts, setAllProducts] = useState([]); 
  const [inventory, setInventory] = useState([]); 
  const [editingItem, setEditingItem] = useState(null)
  const [newStock, setNewStock] = useState("")
  
  // --- STATE FOR STATS ---
  const [customerCount, setCustomerCount] = useState(0); 
  const [dashboardStats, setDashboardStats] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [chartCategory, setChartCategory] = useState(null); 

  // --- Fetch ALL data when screen comes into focus ---
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (activeNavItem !== "Dashboard") return; 
        
        console.log("Refreshing dashboard data...");
        setIsLoading(true); 

        try {
          // --- 1. Fetch Dashboard Stats ---
          const rangeMap = {
            "Today": "day", "This Week": "week", "Month": "month", "Yearly": "year"
          };
          const range = rangeMap[activeTab];
          const date = selectedDate.toISOString().split('T')[0];
          const statsRes = await fetch(`${API.baseURL}/purchase/stats?range=${range}&date=${date}`);
          
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setDashboardStats(statsData);
          } else {
            console.error("Failed to fetch stats:", await statsRes.json());
            setDashboardStats(null);
          }

          // --- 2. Fetch all other data ---
          const [productRes, customerRes, purchaseRes, inventoryRes] = await Promise.all([
            fetch(`${API.baseURL}/product/fetch`),
            fetch(`${API.baseURL}/purchase/count`),
            fetch(`${API.baseURL}/purchase`),
            fetch(`${API.baseURL}/inventory`),
          ]);

          if (productRes.ok) setAllProducts(await productRes.json());
          if (customerRes.ok) setCustomerCount((await customerRes.json()).count || 0);
          if (purchaseRes.ok) setAllPurchases(await purchaseRes.json());
          if (inventoryRes.ok) setInventory(await inventoryRes.json());

        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        } finally {
          setIsLoading(false); 
        }
      };

      fetchData(); 
    }, [activeTab, selectedDate, activeNavItem]) 
  );

  const showDatePicker = () => setDatePickerVisibility(true)
  const hideDatePicker = () => setDatePickerVisibility(false)
  const handleConfirm = (date) => {
    setSelectedDate(date)
    hideDatePicker()
  }

  const formattedDate = selectedDate.toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })

  const formatStat = (num) => {
    if (typeof num !== 'number') return '0';
    return Math.round(num).toLocaleString();
  };

  const formatSoldCount = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return (num || 0).toString();
  };

  // --- Stats from Backend ---
  const totalRevenue = dashboardStats?.totalRevenue || 0;
  const totalPurchasedProducts = dashboardStats?.totalPurchasedProducts || 0; 
  const bestSeller = dashboardStats?.bestSeller || { name: 'N/A', quantity: 0 };

  // ✅ NEW: Find the correct image for the Best Seller
  const bestSellerImage = useMemo(() => {
    if (!bestSeller || bestSeller.name === 'N/A') return SAMPLE_IMG_URL;
    
    // Find the product in your product list that matches the best seller's name
    const product = allProducts.find(p => p.name === bestSeller.name);
    
    // Return that product's image, or the sample if not found
    return product?.image || SAMPLE_IMG_URL;
  }, [bestSeller, allProducts]);
  
  // --- Memos for Product Tab & Chart ---
  const allCategories = useMemo(() => {
    const categories = new Set(allProducts.map(p => p.category.toUpperCase()));
    return Array.from(categories);
  }, [allProducts]);

  // Set default chart category
  useEffect(() => {
    if (allCategories.length > 0 && !chartCategory) {
      const defaultCat =
        allCategories.find(c => c === "MILKTEA") ||
        allCategories.find(c => c === "MILK TEA") ||
        allCategories[0];
      setChartCategory(defaultCat);
    }
  }, [allCategories, chartCategory]);

  // Memoized map for product -> category lookup
  const productToCategoryMap = useMemo(() => {
    return new Map(allProducts.map(p => [p.name, p.category.toUpperCase()]));
  }, [allProducts]);

  // --- Client-side calculations for "Product" tab popups ---
  const productSoldCount = useMemo(() => {
    const soldCountsMap = new Map();
    for (const purchase of allPurchases) { 
      for (const item of purchase.items) { 
        const currentCount = soldCountsMap.get(item.name) || 0;
        soldCountsMap.set(item.name, currentCount + (item.qty || 1)); 
      }
    }
    return soldCountsMap;
  }, [allPurchases]); 

  const productSalesDetails = useMemo(() => {
    const salesDetailsMap = new Map();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    for (const purchase of allPurchases) { 
      const createdAt = new Date(purchase.createdAt); 
      for (const item of purchase.items) { 
        const itemName = item.name;
        const itemQuantity = item.qty || 1; 
        const productData = salesDetailsMap.get(itemName) || {
          daily: 0, weekly: 0, monthly: 0, yearly: 0,
        };
        if (createdAt >= startOfYear) { productData.yearly += itemQuantity;
          if (createdAt >= startOfMonth) { productData.monthly += itemQuantity;
            if (createdAt >= startOfWeek) { productData.weekly += itemQuantity;
              if (createdAt >= today) { productData.daily += itemQuantity; }
            }
          }
        }
        salesDetailsMap.set(itemName, productData);
      }
    }
    return salesDetailsMap;
  }, [allPurchases]); 
  
  // Chart data now reads from `allPurchases`
  const productSalesChartData = useMemo(() => {
    if (!chartCategory) {
      return []; 
    }
    const productCounts = new Map();
    const upperChartCategory = chartCategory.toUpperCase();

    for (const purchase of allPurchases) { 
      for (const item of purchase.items) {
        const itemCategory = productToCategoryMap.get(item.name);
        if (itemCategory === upperChartCategory) {
          const currentCount = productCounts.get(item.name) || 0;
          productCounts.set(item.name, currentCount + (item.qty || 1)); 
        }
      }
    }
    const sortedData = Array.from(productCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 
    const colors = [
      "#D4A574", "#C4956C", "#B8926A", "#AD8B68", "#A08566",
      "#967F64", "#8C7962", "#827360", "#786D5E", "#6E675C",
      "#64615A", "#5A5B58",
    ];
    return sortedData.map((item, index) => ({
      ...item,
      color: colors[index % colors.length], 
    }));
  }, [allPurchases, chartCategory, productToCategoryMap]); 

  // Dynamic max value for chart bars
  const dynamicMaxValue = useMemo(() => {
    const max = Math.max(1, ...productSalesChartData.map(item => item.value));
    return max;
  }, [productSalesChartData]);

  // This list powers the "Product" tab
  const productList = useMemo(() => {
    return allProducts.map(p => {
      const salesDetails = productSalesDetails.get(p.name) || {
        daily: 0, weekly: 0, monthly: 0, yearly: 0
      };
      return {
        ...p,
        sold: productSoldCount.get(p.name) || 0, 
        rating: 4.5,
        image: p.image || SAMPLE_IMG_URL,
        dailySales: salesDetails.daily, 
        weeklySales: salesDetails.weekly, 
        monthlySales: salesDetails.monthly, 
        yearlySales: salesDetails.yearly, 
        prices: {
          regular: p.priceS ? Number(p.priceS) : undefined,
          medium: p.priceM ? Number(p.priceM) : undefined,
          large: p.priceL ? Number(p.priceL) : undefined,
          buy1take1: p.priceB ? Number(p.priceB) : undefined,
        }
      }
    });
  }, [allProducts, productSoldCount, productSalesDetails]); 

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Handle saving stock change
  const handleEditStock = async () => {
    if (!editingItem || !newStock) return;

    try {
      const response = await fetch(`${API.baseURL}/inventory/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingItem.name, 
          stock: Number(newStock) 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Success!
      setEditingItem(null); 
      setNewStock(""); 
      
      const inventoryRes = await fetch(`${API.baseURL}/inventory`);
      if (inventoryRes.ok) {
        setInventory(await inventoryRes.json());
      }
    
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", id: "Dashboard" },
    { icon: Package, label: "Product", id: "Product" },
    { icon: Boxes, label: "Inventory", id: "Inventory" },
    { icon: BarChart3, label: "Reports", id: "Reports" },
    { icon: Settings, label: "Settings", id: "Settings" },
  ]

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading Fonts...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#A0826D" }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#F9F9F9",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: 16,
        }}
      >
        {(isLoading) && activeNavItem === "Dashboard" && (
          <ActivityIndicator size="large" color="#8B4513" style={{ marginVertical: 40 }} />
        )}

        {(!isLoading) && activeNavItem === "Dashboard" && (
          <>
            {/* Header */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "bold", fontFamily: "Poppins-Bold" }}>Hi, Miss Rhea</Text>
                <Text style={{ fontSize: 14, color: "gray", fontFamily: "Poppins-Regular" }}>Administrator</Text>
              </View>
            </View>

            {/* Tabs + Date */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: "row", gap: 14 }}>
                {["Today", "This Week", "Month", "Yearly"].map((tab) => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: activeTab === tab ? "600" : "400",
                      color: activeTab === tab ? "#000" : "gray",
                    }}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={showDatePicker}
                style={{
                  backgroundColor: "#7B3F00",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>{formattedDate}</Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              themeVariant="light"
              textColor="#7B3F00"
              accentColor="#C4956C"
              minimumDate={new Date(2020, 0, 1)}
              maximumDate={new Date(2030, 11, 31)}
            />

            {/* Stats Cards */}
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 20,
            }}>
              <View style={{
                flex: 1,
                backgroundColor: "#D4C4B0",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}>
                <FontAwesome name="shopping-bag" size={28} color="#8B4513" />
                <View>
                  <Text>Total Order</Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {formatStat(totalPurchasedProducts)}
                  </Text>
                </View>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: "#E6D7A3",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}>
                <FontAwesome name="user-plus" size={28} color="#8B4513" />
                <View>
                  <Text>Total Customer</Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {formatStat(customerCount)}
                  </Text>
                </View>
              </View>
              <View style={{
                width: "100%",
                backgroundColor: "#C4956C",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}>
                <FontAwesome name="money" size={28} color="#8B4513" />
                <View>
                  <Text>Total Sales</Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    ₱{formatStat(totalRevenue)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ✅ MODIFIED: Dynamic Trending Product (Correct Image) */}
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              marginBottom: 20,
              overflow: "hidden",
            }}>
              <Image
                // ✅ FIX: Replaced hardcoded URI with dynamic `bestSellerImage`
                source={{ uri: bestSellerImage }}
                style={{ width: "100%", height: 150 }}
              />
              <View style={{ 
                position: "absolute", 
                bottom: 12, 
                left: 12, 
                backgroundColor: 'rgba(0,0,0,0.3)', 
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 5 
              }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                  {bestSeller.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Text style={{ color: "white", marginRight: 8 }}>
                    {formatSoldCount(bestSeller.quantity)} Sold
                  </Text>
                  <Star size={14} color="yellow" fill="yellow" />
                  <Text style={{ color: "white", marginLeft: 4 }}>
                    4.9
                  </Text>
                </View>
              </View>
            </View>

            {/* Chart */}
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                {chartCategory ? chartCategory.toUpperCase() : "SALES CHART"}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {allCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setChartCategory(cat)}
                    style={{
                      backgroundColor: chartCategory === cat ? "#8B4513" : "#eee",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{
                      color: chartCategory === cat ? "#fff" : "#8B4513",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {productSalesChartData.length === 0 ? (
                <Text style={{ color: 'gray', padding: 10 }}>
                  {chartCategory ? `No sales data for ${chartCategory}.` : "Loading..."}
                </Text>
              ) : (
                productSalesChartData.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ width: 80, fontSize: 12, flexShrink: 1 }} numberOfLines={1}>{item.name}</Text>
                    <View style={{
                      flex: 1,
                      backgroundColor: "#E5E7EB",
                      height: 12,
                      borderRadius: 6,
                      marginHorizontal: 6,
                    }}>
                      <View style={{
                        width: `${(item.value / dynamicMaxValue) * 100}%`,
                        height: "100%",
                        backgroundColor: item.color,
                        borderRadius: 6,
                      }} />
                    </View>
                    <Text style={{ width: 30, fontSize: 12, textAlign: 'right' }}>{item.value}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Product Tab Content */}
        {activeNavItem === "Product" && (
          <View>
            <View style={{
              backgroundColor: "#fff",
              flexDirection: "row",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#ddd",
            }}>
              <Search size={19} color="gray" style={{ marginRight: 2, marginTop: 9 }} />
              <TextInput
                placeholder="Search product..."
                placeholderTextColor="gray"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
                style={{ flex: 1, fontSize: 14 }}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
              contentContainerStyle={{ paddingVertical: 6 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={{
                  backgroundColor: selectedCategory == null ? "#8B4513" : "#eee",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: selectedCategory == null ? "#fff" : "#8B4513", fontWeight: "bold" }}>
                  All
                </Text>
              </TouchableOpacity>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: selectedCategory === cat ? "#8B4513" : "#eee",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: selectedCategory === cat ? "#fff" : "#8B4513", fontWeight: "bold" }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredProducts
              .filter((product) => !selectedCategory || product.category.toUpperCase() === selectedCategory)
              .map((product, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedProduct(product)}>
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    marginBottom: 20,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <Image
                      source={{ uri: product.image }}
                      style={{ width: "100%", height: 150 }}
                    />
                    <View style={{ position: "absolute", bottom: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.7)', padding: 5, borderRadius: 5 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
                        {product.name}
                      </Text>
                      {product.prices && (
                        <View style={{ marginTop: 2 }}>
                          {Object.entries(product.prices).map(([size, price]) => (
                            price ? (
                              <Text key={size} style={{ color: "black", fontSize: 12 }}>
                                {size.charAt(0).toUpperCase() + size.slice(1)}: ₱{price}
                              </Text>
                            ) : null
                          ))}
                        </View>
                      )}
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                        <Text style={{ color: "black", marginRight: 8 }}>
                          {product.sold} Sold
                        </Text>
                        <Star size={14} color="gold" fill="gold" />
                        <Text style={{ color: "black", marginLeft: 4 }}>
                          {product.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Inventory Content */}
        {activeNavItem === "Inventory" && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, fontFamily: "Poppins-Bold" }}>
              Inventory List
            </Text>
            {inventory.map((item) => (
              <View
                key={item._id} 
                style={{
                  backgroundColor: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", fontFamily: "Poppins-Bold" }}>{item.name}</Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }}>Stock: {item.stock}</Text>
                  <Text style={{ 
                    fontFamily: "Poppins-Regular",
                    color: item.status === 'Low Stock' ? '#E6A23C' : item.status === 'Out of Stock' ? '#F56C6C' : '#67C23A' 
                  }}>
                    Status: {item.status}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(item) 
                    setNewStock(item.stock.toString())
                  }}
                  style={{
                    backgroundColor: "#8B4513",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 6,
                    alignSelf: "flex-start",
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: "#fff" }}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Stock Modal */}
      {editingItem && (
        <BlurView
          intensity={30}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setEditingItem(null)}
          />

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "85%",
              maxWidth: 350,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              Edit Stock - {editingItem.name}
            </Text>

            <TextInput
              value={newStock}
              onChangeText={setNewStock}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleEditStock} 
              style={{
                backgroundColor: "#8B4513",
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}

      {/* Bottom Navigation */}
      <View style={{
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: "#ddd",
      }}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (item.id === "Settings") {
                  navigation.navigate("Settings")
                } else if (item.id === "Reports") {
                  navigation.navigate("Report")
                } else {
                  setActiveNavItem(item.id)
                }
              }}
              style={{ alignItems: "center" }}
            >
              <Icon size={22} color={activeNavItem === item.id ? "#8B4513" : "gray"} />
              <Text style={{
                fontSize: 12,
                color: activeNavItem === item.id ? "#8B4513" : "gray",
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
        {/* Product Popup Modal */}
        {selectedProduct && (
          <BlurView
            intensity={0}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* popup box */}
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              marginTop: -750, 
              width: "100%",
              maxWidth: 350,
              alignItems: "center",
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}>
              <Image
                source={{ uri: selectedProduct.image }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 6 }}>
                {selectedProduct.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#8B4513", marginBottom: 6 }}>
                Category: {selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}
              </Text>
              <Text style={{ marginBottom: 4 }}>⭐ {selectedProduct.rating}</Text>
              <Text style={{ marginBottom: 12 }}>{selectedProduct.sold} Sold (All Time)</Text>

              {selectedProduct.prices && (
                <View style={{ marginBottom: 12, width: "100%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Prices:</Text>
                  {Object.entries(selectedProduct.prices).map(([size, price]) => (
                    price ? (
                      <Text key={size} style={{ fontSize: 14 }}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}: ₱{price}
                      </Text>
                    ) : null
                  ))}
                </View>
              )}

              <View style={{ marginBottom: 16, width: "100%" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <FontAwesome name="calendar" size={18} color="#8B4513" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16 }}>
                    Daily Sales: {selectedProduct.dailySales}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <FontAwesome name="bar-chart" size={18} color="#8B4513" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16 }}>
                    Weekly Sales: {selectedProduct.weeklySales}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <FontAwesome name="line-chart" size={18} color="#8B4513" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16 }}>
                    Monthly Sales: {selectedProduct.monthlySales}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <FontAwesome name="calendar-check-o" size={18} color="#8B4513" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16 }}>
                    Yearly Sales: {selectedProduct.yearlySales}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedProduct(null)}
                style={{
                  backgroundColor: "#8B4513",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </View>
    </View>
  )
}