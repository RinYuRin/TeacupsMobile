"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from "react-native"
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

// Use this image for all products
const SAMPLE_IMG_URL = "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

const PRODUCTS = {
  milkTea: [
    { id: "p1", name: "Brown Sugar", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p2", name: "Bubble Tea", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p3", name: "Chocolate", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p4", name: "Cookies & Cream", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p5", name: "Mocha", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p6", name: "Strawberry", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p7", name: "Taro", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p8", name: "Vanilla", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p9", name: "Wintermelon", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
    { id: "p10", name: "Avocado", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p11", name: "Banana", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p12", name: "Black Forest", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p13", name: "Blueberry", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p14", name: "Buko Pandan", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p15", name: "Choco Mousse", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p16", name: "Choco Nutella", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p17", name: "Dark Chocolate", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p18", name: "Mango", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p19", name: "Matcha", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p20", name: "Okinawa", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p21", name: "Red Velvet", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p22", name: "Rocky Road", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "p23", name: "Salted Caramel", price: 25, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  ],
  fruitTea: [
    { id: "ft1", name: "Blueberry", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft2", name: "Grapes", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft3", name: "Green Apple", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft4", name: "Honey Peach", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft5", name: "Kiwi", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft6", name: "Lemon", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft7", name: "Lychee", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft8", name: "Mango", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft9", name: "Passion Fruit", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft10", name: "Pineapple", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft11", name: "Strawberry", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft12", name: "Watermelon", price: 20, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
  ],
  yogurt: [
    { id: "yg1", name: "Blueberry", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg2", name: "Grapes", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg3", name: "Green Apple", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg4", name: "Honey Peach", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg5", name: "Kiwi", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg6", name: "Lemon", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg7", name: "Lychee", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg8", name: "Mango", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg9", name: "Passion Fruit", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg10", name: "Pineapple", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg11", name: "Strawberry", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg12", name: "Watermelon", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
  ],
  frappe: [
    { id: "fr1", name: "Avocado", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr2", name: "Banana Split", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr3", name: "Black Forest", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr4", name: "Blueberry Oreo", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr5", name: "Caramel Vanilla", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr6", name: "Cheesecake", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr7", name: "Chocolate", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr8", name: "Choco Nutella", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr9", name: "Cookies & Cream", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr10", name: "Dark Chocolate", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr11", name: "Mango Graham", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr12", name: "Matcha", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr13", name: "Red Velvet", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr14", name: "Rocky Road", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr15", name: "Strawberry Ube Taro", price: 60, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
  ],
  coffeeFrappe: [
    { id: "cf1", name: "Cafe Macchiato", price: 70, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf2", name: "Caramel Macchiato", price: 70, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf3", name: "French Vanilla", price: 70, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf4", name: "Mocha", price: 70, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf5", name: "Salted Caramel", price: 70, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
  ],
  icedCoffee: [
    { id: "ic1", name: "Cafe Americano", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "ic2", name: "Cafe Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "ic3", name: "Caramel Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "ic4", name: "French Vanilla", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "ic5", name: "Iced Mocha", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  ],
  icedLatte: [
    { id: "il1", name: "Choco", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il2", name: "Matcha", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il3", name: "Strawberry", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il4", name: "Taro", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il5", name: "Red Velvet", price: 30, rating: 4.5, img: SAMPLE_IMG_URL, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  ],
  hotCoffee: [
    { id: "hc1", name: "Cafe Americano", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "hc2", name: "Cafe Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "hc3", name: "Hazelnut Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "hc4", name: "Mochaccino", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
  ],
  hotChoco: [
    { id: "hcch1", name: "Chocolate", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "hcch2", name: "Choco Mousse", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "hcch3", name: "Dark Chocolate", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
  ],
  hotTea: [
    { id: "ht1", name: "Black Tea", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "ht2", name: "Honey Peach", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "ht3", name: "Lemon", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
    { id: "ht4", name: "Matcha", price: 30, rating: 4.5, img: SAMPLE_IMG_URL },
  ],
};

export default function Dashboard({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("./assets/font/Poppins/Poppins-Bold.ttf"),
    "Poppins-Regular": require("./assets/font/Poppins/Poppins-Regular.ttf"),
    "Poppins-Light": require("./assets/font/Poppins/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("./assets/font/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-LightItalic": require("./assets/font/Poppins/Poppins-LightItalic.ttf"),
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const [activeTab, setActiveTab] = useState("Today")
  const [activeNavItem, setActiveNavItem] = useState("Dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date("2025-07-12"))
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [inventory, setInventory] = useState([
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

  const showDatePicker = () => setDatePickerVisibility(true)
  const hideDatePicker = () => setDatePickerVisibility(false)
  const handleConfirm = (date) => {
    setSelectedDate(date)
    hideDatePicker()
  }

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })

  const statsData = {
    Today: { orders: "00,120", customers: "00,045", sales: "00,230" },
    "This Week": { orders: "00,890", customers: "00,220", sales: "01,650" },
    Month: { orders: "03,200", customers: "01,200", sales: "06,400" },
    Yearly: { orders: "45,000", customers: "15,000", sales: "82,000" },
  }

  const chartData = [
    { name: "Salted Caramel", value: 8, color: "#D4A574" },
    { name: "Red Velvet", value: 12, color: "#C4956C" },
    { name: "Matcha", value: 20, color: "#B8926A" },
    { name: "Dark Chocolate", value: 35, color: "#AD8B68" },
    { name: "Choco Mousse", value: 10, color: "#A08566" },
    { name: "Blueberry", value: 15, color: "#967F64" },
    { name: "Banana", value: 18, color: "#8C7962" },
    { name: "Wintermelon", value: 22, color: "#827360" },
    { name: "Taro", value: 12, color: "#786D5E" },
    { name: "Mocha", value: 5, color: "#6E675C" },
    { name: "Chocolate", value: 10, color: "#64615A" },
    { name: "Brown Sugar", value: 4, color: "#5A5B58" },
  ]
  const maxValue = Math.max(...chartData.map((item) => item.value))

  const navItems = [
    { icon: Home, label: "Dashboard", id: "Dashboard" },
    { icon: Package, label: "Product", id: "Product" },
    { icon: Boxes, label: "Inventory", id: "Inventory" },
    { icon: BarChart3, label: "Reports", id: "Reports" },
    { icon: Settings, label: "Settings", id: "Settings" },
  ]

  // Flatten all products from PRODUCTS and map to productList format, including category
  const productList = Object.entries(PRODUCTS)
    .flatMap(([category, items]) =>
      items.map((item) => ({
        name: item.name,
        category: category, // Add category here
        sold: Math.floor(Math.random() * 5000 + 500) ,
        rating: item.rating.toFixed(1),
        image: SAMPLE_IMG_URL,
        dailySales: Math.floor(Math.random() * 20 + 5),
        weeklySales: Math.floor(Math.random() * 100 + 50),
        monthlySales: Math.floor(Math.random() * 2000 + 400),
      }))
    );

  // If you want to use productList for display, you can use it in your Product tab
  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* DASHBOARD CONTENT */}
        {activeNavItem === "Dashboard" && (
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
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity>
                  <MessageCircle size={22} color="gray" />
                </TouchableOpacity>                
                <TouchableOpacity>
                  <Bell size={22} color="gray" />
                </TouchableOpacity>
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
                    {statsData[activeTab].orders}
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
                    {statsData[activeTab].customers}
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
                    {statsData[activeTab].sales}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trending Product */}
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
              <View style={{ position: "absolute", bottom: 12, left: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                  Dark Chocolate
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Text style={{ color: "white", marginRight: 8 }}>5.2k Sold</Text>
                  <Star size={14} color="yellow" fill="yellow" />
                  <Text style={{ color: "white", marginLeft: 4 }}>4.9</Text>
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
                MILKTEA
              </Text>
              {chartData.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ width: 80, fontSize: 12 }}>{item.name}</Text>
                  <View style={{
                    flex: 1,
                    backgroundColor: "#E5E7EB",
                    height: 12,
                    borderRadius: 6,
                    marginHorizontal: 6,
                  }}>
                    <View style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: "100%",
                      backgroundColor: item.color,
                      borderRadius: 6,
                    }} />
                  </View>
                  <Text style={{ width: 30, fontSize: 12 }}>{item.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* PRODUCT CONTENT */}
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

            {/* Category Filter Buttons (now below search bar) */}
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
              {Object.keys(PRODUCTS).map((cat) => (
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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filtered Products */}
            {filteredProducts
              .filter((product) => !selectedCategory || product.category === selectedCategory)
              .map((product, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedProduct(product)}>
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    marginBottom: 20,
                    overflow: "hidden",
                  }}>
                    <Image
                      source={{ uri: product.image }}
                      style={{ width: "100%", height: 150 }}
                    />
                    <View style={{ position: "absolute", bottom: 12, left: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                        {product.name}
                      </Text>
                      {/* PRICE DETAILS */}
                      {PRODUCTS[product.category]?.find(p => p.name === product.name)?.prices && (
                        <View style={{ marginTop: 2 }}>
                          {Object.entries(PRODUCTS[product.category].find(p => p.name === product.name).prices).map(([size, price]) => (
                            <Text key={size} style={{ color: "white", fontSize: 12 }}>
                              {size.charAt(0).toUpperCase() + size.slice(1)}: ₱{price}
                            </Text>
                          ))}
                        </View>
                      )}
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                        <Text style={{ color: "white", marginRight: 8 }}>
                          {product.sold} Sold
                        </Text>
                        <Star size={14} color="yellow" fill="yellow" />
                        <Text style={{ color: "white", marginLeft: 4 }}>
                          {product.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* INVENTORY CONTENT */}
        {activeNavItem === "Inventory" && (
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
              <Text style={{ marginBottom: 12 }}>{selectedProduct.sold} Sold</Text>
              {/* PRICE DETAILS */}
              {PRODUCTS[selectedProduct.category]?.find(p => p.name === selectedProduct.name)?.prices && (
                <View style={{ marginBottom: 12, width: "100%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Prices:</Text>
                  {Object.entries(PRODUCTS[selectedProduct.category].find(p => p.name === selectedProduct.name).prices).map(([size, price]) => (
                    <Text key={size} style={{ fontSize: 14 }}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}: ₱{price}
                    </Text>
                  ))}
                </View>
              )}
              {/* NEW SALES DETAILS */}
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
              </View>
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