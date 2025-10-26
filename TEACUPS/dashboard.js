"use client"

// 1. Added useEffect and useMemo
import { useState, useEffect, useMemo } from "react"
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

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useFonts } from "expo-font"

// 2. Added API import (assuming path)
import API from "./api";

// Use this image for all products
const SAMPLE_IMG_URL = "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

// --- REMOVED THE GIANT HARDCODED 'PRODUCTS' OBJECT ---

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
  const [selectedDate, setSelectedDate] = useState(new Date()) // Use today's date
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- NEW STATE FOR ALL DYNAMIC DATA ---
  const [allUsers, setAllUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // For /product/fetch

  // --- MODIFICATION 1: Set initial state to null ---
  const [chartCategory, setChartCategory] = useState(null); // Default chart filter
  const [isLoading, setIsLoading] = useState(true); // Loading indicator

  const [inventory, setInventory] = useState([
    // ... (All your inventory data remains unchanged) ...
        {
    id: 1,
    name: "Black Tea ",
    category: "Tea Base",
    unit: "1 kg",
    stock: 10,
    reorder: 3,
    image: require("./assets/image/Inventory/BlackTea.png"),
    lastUpdated: null
  },
  {
    id: 2,
    name: "Green Tea ",
    category: "Tea Base",
    unit: "1 kg",
    stock: 8,
    reorder: 3,
    image: require("./assets/image/Inventory/GreenTea.png"),
    lastUpdated: null
  },
  {
    id: 3,
    name: "Fresh Milk",
    category: "Milk Base",
    unit: "1 L",
    stock: 50,
    reorder: 15,
    image: require("./assets/image/Inventory/Freshmilk.png"),
  },
  {
    id: 4,
    name: "Tapioca Pearls",
    category: "Add-On",
    unit: "1 kg",
    stock: 20,
    reorder: 5,
    image: require("./assets/image/Inventory/Pearls.png"),
    lastUpdated: null
  },
  {
    id: 5,
    name: "Coffee Jelly",
    category: "Add-On",
    unit: "1 kg",
    stock: 10,
    reorder: 3,
    image: require("./assets/image/Inventory/Jelly.png"),
    lastUpdated: null
  },
  {
    id: 6,
    name: "Sugar Syrup",
    category: "Sweetener",
    unit: "1 L",
    stock: 20,
    reorder: 5,
    image: require("./assets/image/Inventory/SugarSyrup.png"),
    lastUpdated: null
  },
  {
    id: 7,
    name: "Brown Sugar",
    category: "Sweetener",
    unit: "1 kg",
    stock: 15,
    reorder: 5,
    image: require("./assets/image/Inventory/BrownSugar.png"),
    lastUpdated: null
  },
  {
    id: 8,
    name: "Chocolate Syrup",
    category: "Flavor Syrup",
    unit: "1 L",
    stock: 10,
    reorder: 3,
      image: require("./assets/image/Inventory/Chocolate.png"),
    lastUpdated: null
  },
  {
    id: 9,
    name: "Strawberry Syrup",
    category: "Flavor Syrup",
    unit: "1 L",
    stock: 10,
    reorder: 3,
    image: require("./assets/image/Inventory/Strawberry.png"),
    lastUpdated: null
  },
  {
    id: 10,
    name: "Ube Powder",
    category: "Flavor Powder",
    unit: "1 kg",
    stock: 5,
    reorder: 2,
   image: require("./assets/image/Inventory/Ube.png"),
    lastUpdated: null
  },
  {
    id: 11,
    name: "Cups (Regular)",
    category: "Packaging",
    unit: "100 pcs",
    stock: 2000,
    reorder: 500,
    image: require("./assets/image/Inventory/Cup.png"),
    lastUpdated: null
  },
  {
    id: 12,
    name: "Cups (Medium)",
    category: "Packaging",
    unit: "100 pcs",
    stock: 2000,
    reorder: 500,
    image: require("./assets/image/Inventory/Cup.png"),
    lastUpdated: null
  },
  {
    id: 13,
    name: "Cups (Large)",
    category: "Packaging",
    unit: "100 pcs",
    stock: 2000,
    reorder: 500,
    image: require("./assets/image/Inventory/Cup.png"),
    lastUpdated: null
  },
  {
    id: 14,
    name: "Dome Lids",
    category: "Packaging",
    unit: "100 pcs",
    stock: 2000,
    reorder: 500,
     image: require("./assets/image/Inventory/Lids.png"),
    lastUpdated: null
  },
  {
    id: 15,
    name: "Straws",
    category: "Packaging",
    unit: "100 pcs",
    stock: 5000,
    reorder: 1000,
    image: require("./assets/image/Inventory/Straws.png"),
     lastUpdated: null
  },
  {
    id: 16,
    name: "Sealing Film",
    category: "Packaging",
    unit: "100 pcs",
    stock: 5000,
    reorder: 1000,
    image: require("./assets/image/Inventory/Sealingfilm.png"),
    lastUpdated: null
  }
  ])
  const [editingItem, setEditingItem] = useState(null)
  const [newStock, setNewStock] = useState("")

  // --- Fetch all dashboard data ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [userRes, orderRes, productRes] = await Promise.all([
          fetch(`${API.baseURL}/users`),
          fetch(`${API.baseURL}/orders/all`),
          fetch(`${API.baseURL}/product/fetch`) // <-- Fetch products
        ]);

        // Process users
        const userData = await userRes.json();
        if (userRes.ok) setAllUsers(userData);
        else console.error("Failed to fetch users:", userData.message);

        // Process orders
        const orderData = await orderRes.json();
        if (orderRes.ok) setAllOrders(orderData);
        else console.error("Failed to fetch orders:", orderData.message);

        // Process products
        const productData = await productRes.json();
        if (productRes.ok) setAllProducts(productData);
        else console.error("Failed to fetch products:", productData.message);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []); // Empty array ensures this runs only once on mount

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

  // --- (REMOVED) Hardcoded statsData ---

  // Helper for formatting numbers (reused for all stats)
  const formatStat = (num) => {
    // This removes the '000,000' padding and uses standard comma formatting
    return Math.round(num).toLocaleString();
  };

  // ✅ NEW: Helper function for formatting sold counts (e.g., 5.2k)
  const formatSoldCount = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // --- All memoized calculations ---

  // Dynamic customer counts
  const customerCounts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let todayCount = 0, weekCount = 0, monthCount = 0, yearCount = 0;
    for (const user of allUsers) {
      if (user.role === 'user') {
        const createdAt = new Date(user.createdAt);
        if (createdAt >= startOfYear) { yearCount++;
          if (createdAt >= startOfMonth) { monthCount++;
            if (createdAt >= startOfWeek) { weekCount++;
              if (createdAt >= today) { todayCount++; }
            }
          }
        }
      }
    }
    return {
      Today: formatStat(todayCount), "This Week": formatStat(weekCount),
      Month: formatStat(monthCount), Yearly: formatStat(yearCount),
    };
  }, [allUsers]);

  // Dynamic order counts
  const orderCounts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let todayCount = 0, weekCount = 0, monthCount = 0, yearCount = 0;
    for (const order of allOrders) {
      if (order.status === 'paid') {
        const createdAt = new Date(order.createdAt);
        if (createdAt >= startOfYear) { yearCount++;
          if (createdAt >= startOfMonth) { monthCount++;
            if (createdAt >= startOfWeek) { weekCount++;
              if (createdAt >= today) { todayCount++; }
            }
          }
        }
      }
    }
    return {
      Today: formatStat(todayCount), "This Week": formatStat(weekCount),
      Month: formatStat(monthCount), Yearly: formatStat(yearCount),
    };
  }, [allOrders]);

  // Dynamic SALES counts
  const salesCounts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let todaySales = 0, weekSales = 0, monthSales = 0, yearSales = 0;
    for (const order of allOrders) {
      if (order.status === 'paid') {
        const createdAt = new Date(order.createdAt);
        const saleAmount = order.grandTotal || 0;
        if (createdAt >= startOfYear) { yearSales += saleAmount;
          if (createdAt >= startOfMonth) { monthSales += saleAmount;
            if (createdAt >= startOfWeek) { weekSales += saleAmount;
              if (createdAt >= today) { todaySales += saleAmount; }
            }
          }
        }
      }
    }
    return {
      Today: formatStat(todaySales), "This Week": formatStat(weekSales),
      Month: formatStat(monthSales), Yearly: formatStat(yearSales),
    };
  }, [allOrders]);

  // ✅ NEW: Memoized calculation for the single trending product
  const trendingProduct = useMemo(() => {
    const productSalesData = new Map();

    // 1. Iterate through all 'paid' orders to aggregate product data
    for (const order of allOrders) {
      if (order.status !== 'paid') continue; // Only count paid orders

      const orderDate = new Date(order.createdAt);

      for (const item of order.items) {
        const productName = item.name;
        const itemQuantity = item.quantity || 1;

        const data = productSalesData.get(productName);

        if (!data) {
          // This is the first time we see this product
          productSalesData.set(productName, {
            name: productName,
            totalSold: itemQuantity,
            firstSoldDate: orderDate, // This is its first sale date
          });
        } else {
          // Update existing product data
          data.totalSold += itemQuantity;
          // Check if this order is earlier than the stored firstSoldDate
          if (orderDate < data.firstSoldDate) {
            data.firstSoldDate = orderDate;
          }
          productSalesData.set(productName, data);
        }
      }
    }

    // 2. Find the best product from the aggregated map
    const allProductStats = Array.from(productSalesData.values());

    if (allProductStats.length === 0) {
      // Default placeholder if there are no sales
      return { name: "No Sales Yet", sold: 0, rating: 0 };
    }

    // 3. Use reduce to find the winner based on tie-breaker logic
    const bestProduct = allProductStats.reduce((best, current) => {
      // Primary Sort: Higher totalSold wins
      if (current.totalSold > best.totalSold) {
        return current;
      }
      
      // Secondary Sort (Tie-breaker): Earlier firstSoldDate wins
      if (current.totalSold === best.totalSold && current.firstSoldDate < best.firstSoldDate) {
        return current;
      }

      // Otherwise, keep the current best
      return best;
    }, allProductStats[0]); // Start comparison with the first item

    // 4. Return the data needed for the UI
    return {
      name: bestProduct.name,
      sold: bestProduct.totalSold,
      rating: 4.9, // Keeping rating static as requested
    };

  }, [allOrders]); // Dependency: only recalculate when orders change

  // Memoized list of all categories
  const allCategories = useMemo(() => {
    const categories = new Set(allProducts.map(p => p.category.toUpperCase()));
    return Array.from(categories);
  }, [allProducts]);

  // Set default chart category when categories load
  useEffect(() => {
    if (allCategories.length > 0 && !chartCategory) {
      // Try to find a milktea-related category, otherwise use the first
      const defaultCat =
        allCategories.find(c => c === "MILKTEA") ||
        allCategories.find(c => c === "MILK TEA") ||
        allCategories[0];
      setChartCategory(defaultCat);
    }
  }, [allCategories, chartCategory]); // Runs when categories are populated

  // Memoized map for product -> category lookup
  const productToCategoryMap = useMemo(() => {
    return new Map(allProducts.map(p => [p.name, p.category.toUpperCase()]));
  }, [allProducts]);

  // Dynamic chart data
  const productSalesChartData = useMemo(() => {
    if (!chartCategory) {
      return []; // Return empty if no category is selected yet
    }

    const productCounts = new Map();
    const upperChartCategory = chartCategory.toUpperCase();

    // 1. Count products from 'paid' orders
    for (const order of allOrders) {
      if (order.status === 'paid') {
        for (const item of order.items) {
          // Find the item's category
          const itemCategory = productToCategoryMap.get(item.name);

          // If the item's category matches the selected chart category
          if (itemCategory === upperChartCategory) {
            const currentCount = productCounts.get(item.name) || 0;
            productCounts.set(item.name, currentCount + (item.quantity || 1)); // Use quantity if available
          }
        }
      }
    }

    // 2. Convert map to array and sort
    const sortedData = Array.from(productCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending

    // 3. Assign colors
    const colors = [
      "#D4A574", "#C4956C", "#B8926A", "#AD8B68", "#A08566",
      "#967F64", "#8C7962", "#827360", "#786D5E", "#6E675C",
      "#64615A", "#5A5B58",
    ];

    return sortedData.map((item, index) => ({
      ...item,
      color: colors[index % colors.length], // Cycle through colors
    }));

  }, [allOrders, chartCategory, productToCategoryMap]);

  // Dynamic max value for chart bars
  const dynamicMaxValue = useMemo(() => {
    const max = Math.max(1, ...productSalesChartData.map(item => item.value));
    return max;
  }, [productSalesChartData]);

  // --- (NEW) Calculate Sold Counts ---
  const productSoldCount = useMemo(() => {
    const soldCountsMap = new Map();
    for (const order of allOrders) {
      if (order.status === 'paid') {
        for (const item of order.items) {
          const currentCount = soldCountsMap.get(item.name) || 0;
          soldCountsMap.set(item.name, currentCount + (item.quantity || 1)); // Use quantity
        }
      }
    }
    return soldCountsMap;
  }, [allOrders]);

  // --- (NEW) Calculate Product Sales Details (Daily, Weekly, Monthly, Yearly) ---
  const productSalesDetails = useMemo(() => {
    const salesDetailsMap = new Map();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    for (const order of allOrders) {
      if (order.status === 'paid') {
        const createdAt = new Date(order.createdAt);

        for (const item of order.items) {
          const itemName = item.name;
          const itemQuantity = item.quantity || 1;

          // Get or initialize product data
          const productData = salesDetailsMap.get(itemName) || {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
          };

          // Add quantity based on date
          if (createdAt >= startOfYear) {
            productData.yearly += itemQuantity;
            if (createdAt >= startOfMonth) {
              productData.monthly += itemQuantity;
              if (createdAt >= startOfWeek) {
                productData.weekly += itemQuantity;
                if (createdAt >= today) {
                  productData.daily += itemQuantity;
                }
              }
            }
          }
          // Save back to map
          salesDetailsMap.set(itemName, productData);
        }
      }
    }
    return salesDetailsMap;
  }, [allOrders]);

  const navItems = [
    // ... (All your nav items remain unchanged) ...
    { icon: Home, label: "Dashboard", id: "Dashboard" },
    { icon: Package, label: "Product", id: "Product" },
    { icon: Boxes, label: "Inventory", id: "Inventory" },
    { icon: BarChart3, label: "Reports", id: "Reports" },
    { icon: Settings, label: "Settings", id: "Settings" },
  ]

  // --- (MODIFIED) Dynamic productList for "Product" tab ---
  const productList = useMemo(() => {
    return allProducts.map(p => {
      // Get the dynamic sales details for this product
      const salesDetails = productSalesDetails.get(p.name) || {
        daily: 0, weekly: 0, monthly: 0, yearly: 0
      };

      return {
        ...p, // Spread all properties from the DB product
        sold: productSoldCount.get(p.name) || 0, // Get dynamic total sold count
        rating: 4.5, // Keep placeholder
        image: p.image || SAMPLE_IMG_URL, // Use DB image or fallback
        // --- MODIFICATION: Use dynamic sales data ---
        dailySales: salesDetails.daily,
        weeklySales: salesDetails.weekly,
        monthlySales: salesDetails.monthly,
        yearlySales: salesDetails.yearly, // Add yearly sales
        // --- END MODIFICATION ---
        // Format prices to match old structure
        prices: {
          regular: p.priceS ? Number(p.priceS) : undefined,
          medium: p.priceM ? Number(p.priceM) : undefined,
          large: p.priceL ? Number(p.priceL) : undefined,
          buy1take1: p.priceB ? Number(p.priceB) : undefined,
        }
      }
    });
  }, [allProducts, productSoldCount, productSalesDetails]); // Add dependencies

  // This filter now works on the dynamic productList
  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER ---
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
        {/* Loading Indicator */}
        {isLoading && activeNavItem === "Dashboard" && (
          <ActivityIndicator size="large" color="#8B4513" style={{ marginVertical: 40 }} />
        )}

        {/* DASHBOARD CONTENT */}
        {!isLoading && activeNavItem === "Dashboard" && (
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
              {/* ✅ REMOVED: Icon View
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity>
                  <MessageCircle size={22} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Bell size={22} color="gray" />
                </TouchableOpacity>
              </View>
              */}
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

            {/* Date Picker Modal */}
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
                    {orderCounts[activeTab]}
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
                  <Text>New Customer</Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {customerCounts[activeTab]}
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
                    ₱{salesCounts[activeTab]}
                  </Text>
                </View>
              </View>
            </View>

            {/* ✅ MODIFIED: Dynamic Trending Product */}
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              marginBottom: 20,
              overflow: "hidden",
            }}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                }}
                style={{ width: "100%", height: 150 }}
              />
              {/* Added a background overlay for text readability */}
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
                  {trendingProduct.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Text style={{ color: "white", marginRight: 8 }}>
                    {formatSoldCount(trendingProduct.sold)} Sold
                  </Text>
                  <Star size={14} color="yellow" fill="yellow" />
                  <Text style={{ color: "white", marginLeft: 4 }}>
                    {trendingProduct.rating}
                  </Text>
                </View>
              </View>
            </View>

            {/* --- DYNAMIC Chart --- */}
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                {chartCategory ? chartCategory.toUpperCase() : "SALES CHART"}
              </Text>

              {/* Category Filter Buttons */}
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

              {/* Chart Bars */}
              {productSalesChartData.length === 0 ? (
                <Text style={{ color: 'gray', padding: 10 }}>
                  {chartCategory ? `No paid sales for ${chartCategory}.` : "Loading..."}
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
                    <Text style={{ width: 30, fontSize: 12 }}>{item.value}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* --- DYNAMIC PRODUCT CONTENT --- */}
        {activeNavItem === "Product" && (
          <View>
            {/* Search Bar */}
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

            {/* Category Filter Buttons (Dynamic) */}
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

            {/* Filtered Products (Dynamic) */}
            {filteredProducts
              .filter((product) => !selectedCategory || product.category.toUpperCase() === selectedCategory)
              .map((product, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedProduct(product)}>
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    marginBottom: 20,
                    overflow: "hidden",
                    // Added shadow for better visibility with black text
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
                    {/* --- CONFIRMED: Text color changed to black --- */}
                    <View style={{ position: "absolute", bottom: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.7)', padding: 5, borderRadius: 5 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
                        {product.name}
                      </Text>
                      {/* PRICE DETAILS (Dynamic) */}
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
                          {product.sold} Sold {/* Now uses dynamic sold count */}
                        </Text>
                        <Star size={14} color="gold" fill="gold" />
                        <Text style={{ color: "black", marginLeft: 4 }}>
                          {product.rating}
                        </Text>
                      </View>
                    </View>
                    {/* --- END TEXT COLOR CHANGE --- */}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* INVENTORY CONTENT */}
        {activeNavItem === "Inventory" && (
          // ... (Inventory content remains unchanged) ...
          <View>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, fontFamily: "Poppins-Bold" }}>
              Inventory List
            </Text>
            {inventory.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image source={item.image} style={{ width: 40, height: 40, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", fontFamily: "Poppins-Bold" }}>{item.name}</Text>
                  <Text style={{ color: "gray", fontFamily: "Poppins-Regular" }}>Category: {item.category}</Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }}>Stock: {item.stock} {item.unit}</Text>
                  <Text style={{ color: item.stock <= item.reorder ? "red" : "green", fontFamily: "Poppins-Regular" }}>
                    Reorder Level: {item.reorder} {item.unit}
                  </Text>
                  {item.lastUpdated && (
                    <Text style={{ color: "#888", fontSize: 12, fontFamily: "Poppins-LightItalic" }}>
                      Last Updated: {item.lastUpdated}
                    </Text>
                  )}
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

      {/* EDIT STOCK MODAL */}
      {editingItem && (
        // ... (Edit Stock Modal remains unchanged) ...
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
              onPress={() => {
                setInventory((prev) =>
                  prev.map((inv) =>
                    inv.id === editingItem.id
                      ? { ...inv, stock: parseInt(newStock), lastUpdated: new Date().toLocaleString() }
                      : inv
                  )
                )
                setEditingItem(null)
              }}
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
        {/* ... (Bottom Navigation remains unchanged) ... */}
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
              <Icon size={22} color={activeNavItem === item.id ? "#8B4s13" : "gray"} />
              <Text style={{
                fontSize: 12,
                color: activeNavItem === item.id ? "#8B4513" : "gray",
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
        {/* --- DYNAMIC Product Popup Modal --- */}
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
              marginTop: -750, // This seems very high, might need adjustment
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

              {/* PRICE DETAILS (Dynamic) */}
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

              {/* --- MODIFICATION: DYNAMIC SALES DETAILS --- */}
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
                {/* --- NEWLY ADDED YEARLY SALES --- */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <FontAwesome name="calendar-check-o" size={18} color="#8B4513" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16 }}>
                    Yearly Sales: {selectedProduct.yearlySales}
                  </Text>
                </View>
              </View>
              {/* --- END MODIFICATION --- */}

              {/* Close button */}
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