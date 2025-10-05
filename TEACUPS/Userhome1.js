import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// removed static import to avoid bundler error when package is missing
// we'll load expo-barcode-scanner at runtime inside openScanner()
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Star,
  Home,
  Box,
  Bell,
  User,
  Scan,
} from "lucide-react-native";
import AddToCharts from "./addtocharts";
import NotificationsPanel from "./NotificationsPanel";
import LogoImg from "./assets/icon.png"; 

const { width } = Dimensions.get("window");
// fixed header height — change if you want a taller header
const HEADER_HEIGHT = 72;

const COLORS = {
  bg: "#F5F5F5",
  card: "#FFFFFF",
  text: "#1F1F1F",
  sub: "#7A7A7A",
  accent: "#C68B59",
  accentLight: "#E2C7AE",
  star: "#FFC107",
  border: "#EDEDED",
};

const CATEGORIES = [
  { id: "c1", name: "Milk Tea", img: require("./assets/image/milk-tea.png") },
  { id: "c2", name: "Fruit Tea", img: require("./assets/image/fruit-tea.png") },
  { id: "c3", name: "Yogurt", img: require("./assets/image/yogurt.png") },
  { id: "c4", name: "Frappe", img: require("./assets/image/frappe.png") },
  { id: "c5", name: "Coffee Frappe", img: require("./assets/image/frappe.png") },
  { id: "c6", name: "Iced Coffee", img: require("./assets/image/frappe.png") },
  { id: "c7", name: "Iced Latte", img: require("./assets/image/frappe.png") },
  { id: "c8", name: "Hot Coffee", img: require("./assets/image/frappe.png") },
  { id: "c9", name: "Hot Choco", img: require("./assets/image/frappe.png") },
  { id: "c10", name: "Hot Tea", img: require("./assets/image/frappe.png") },
];

const SAMPLE_IMG = require("./assets/image/dark-choco.png");
const SAMPLE2_IMG = require("./assets/image/dark-choco1.png");

const PRODUCTS = {
   recommendation: [
    { id: "r1", name: "Dark Chocolate", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "r2", name: "Okinawa", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
    { id: "r3", name: "Matcha", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  ],
  milkTea: [
  { id: "p1", name: "Brown Sugar", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p2", name: "Bubble Tea", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p3", name: "Chocolate", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p4", name: "Cookies & Cream", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p5", name: "Mocha", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p6", name: "Strawberry", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p7", name: "Taro", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p8", name: "Vanilla", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p9", name: "Wintermelon", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 30, large: 40, buy1take1: 38 } },
  { id: "p10", name: "Avocado", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p11", name: "Banana", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p12", name: "Black Forest", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p13", name: "Blueberry", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p14", name: "Buko Pandan", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p15", name: "Choco Mousse", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p16", name: "Choco Nutella", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p17", name: "Dark Chocolate", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p18", name: "Mango", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p19", name: "Matcha", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p20", name: "Okinawa", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p21", name: "Red Velvet", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p22", name: "Rocky Road", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
  { id: "p23", name: "Salted Caramel", price: 25, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 25, medium: 35, large: 45, buy1take1: 48 } },
],
   fruitTea: [
    { id: "ft1", name: "Blueberry", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft2", name: "Grapes", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft3", name: "Green Apple", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft4", name: "Honey Peach", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft5", name: "Kiwi", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft6", name: "Lemon", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft7", name: "Lychee", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft8", name: "Mango", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft9", name: "Passion Fruit", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft10", name: "Pineapple", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft11", name: "Strawberry", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
    { id: "ft12", name: "Watermelon", price: 20, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 20, medium: 35, large: 45, buy1take1: 38 } },
  ],
    yogurt: [
    { id: "yg1", name: "Blueberry", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg2", name: "Grapes", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg3", name: "Green Apple", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg4", name: "Honey Peach", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg5", name: "Kiwi", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg6", name: "Lemon", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg7", name: "Lychee", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg8", name: "Mango", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg9", name: "Passion Fruit", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg10", name: "Pineapple", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg11", name: "Strawberry", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
    { id: "yg12", name: "Watermelon", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 45, large: 55, buy1take1: 58 } },
  ],
    frappe: [
    { id: "fr1", name: "Avocado", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr2", name: "Banana Split", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr3", name: "Black Forest", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr4", name: "Blueberry Oreo", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr5", name: "Caramel Vanilla", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr6", name: "Cheesecake", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr7", name: "Chocolate", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr8", name: "Choco Nutella", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr9", name: "Cookies & Cream", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr10", name: "Dark Chocolate", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr11", name: "Mango Graham", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr12", name: "Matcha", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr13", name: "Red Velvet", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr14", name: "Rocky Road", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
    { id: "fr15", name: "Strawberry Ube Taro", price: 60, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 60, medium: 75, large: 85, buy1take1: 118 } },
  ],
  coffeeFrappe: [
    { id: "cf1", name: "Cafe Macchiato", price: 70, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf2", name: "Caramel Macchiato", price: 70, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf3", name: "French Vanilla", price: 70, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf4", name: "Mocha", price: 70, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
    { id: "cf5", name: "Salted Caramel", price: 70, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 70, medium: 85, large: 95, buy1take1: 138 } },
  ],
  icedCoffee: [
  { id: "ic1", name: "Cafe Americano", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  { id: "ic2", name: "Cafe Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  { id: "ic3", name: "Caramel Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  { id: "ic4", name: "French Vanilla", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  { id: "ic5", name: "Iced Mocha", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
],
  icedLatte: [
    { id: "il1", name: "Choco", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il2", name: "Matcha", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il3", name: "Strawberry", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il4", name: "Taro", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
    { id: "il5", name: "Red Velvet", price: 30, rating: 4.5, img: SAMPLE_IMG, prices: { regular: 30, medium: 40, large: 50, buy1take1: 58 } },
  ],
  hotCoffee: [
  { id: "hc1", name: "Cafe Americano", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "hc2", name: "Cafe Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "hc3", name: "Hazelnut Macchiato", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "hc4", name: "Mochaccino", price: 30, rating: 4.5, img: SAMPLE_IMG },
],
hotChoco: [
  { id: "hcch1", name: "Chocolate", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "hcch2", name: "Choco Mousse", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "hcch3", name: "Dark Chocolate", price: 30, rating: 4.5, img: SAMPLE_IMG },
],
hotTea: [
  { id: "ht1", name: "Black Tea", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "ht2", name: "Honey Peach", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "ht3", name: "Lemon", price: 30, rating: 4.5, img: SAMPLE_IMG },
  { id: "ht4", name: "Matcha", price: 30, rating: 4.5, img: SAMPLE_IMG },
],
};

const cartData = [
  {
    name: "Dark Chocolate",
    price: 60,
    addon: "Add marshmallow",
    image: { uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93" },
  },
  {
    name: "Chocolate",
    price: 60,
    addon: "Add marshmallow",
    image: { uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93" },
  },
];


export default function Userhome({ navigation }) {
  // try to load BlurView at runtime (safe if expo-blur not installed)
  const [BlurViewComp, setBlurViewComp] = useState(null);
  useEffect(() => {
    try {
      const mod = require("expo-blur");
      const B = mod?.BlurView || mod?.default || mod;
      if (B) setBlurViewComp(() => B);
    } catch (e) {
      // expo-blur not installed — fallback will be used
      setBlurViewComp(null);
    }
  }, []);

   const [activeCat, setActiveCat] = useState(null);
   const [activeTab, setActiveTab] = useState("home");
   const [showCategoryPanel, setShowCategoryPanel] = useState(false);
   const [searchText, setSearchText] = useState("");
   const [sortPanelVisible, setSortPanelVisible] = useState(false);
   const [sortType, setSortType] = useState(null);
   // QR scanner state
   const [scannerVisible, setScannerVisible] = useState(false);
   const [hasCameraPermission, setHasCameraPermission] = useState(null);
   const [scanned, setScanned] = useState(false);
  // component reference loaded at runtime (null when not installed)
  const [BarCodeScannerComp, setBarCodeScannerComp] = useState(null);

  // Dummy profile data for demonstration
  const [profile, setProfile] = useState({
    username: "John Doe",
    
  });

  // callback used by Profile screen to push edits back into Userhome
  function handleProfileSave(updatedProfile) {
    if (!updatedProfile) return;
    setProfile((prev) => ({ ...prev, ...updatedProfile }));
  }
  
  const catKeyMap = {
    c1: "milkTea",
    c2: "fruitTea",
    c3: "yogurt",
    c4: "frappe",
    c5: "coffeeFrappe",
    c6: "icedCoffee",
    c7: "icedLatte",
    c8: "hotCoffee",
    c9: "hotChoco",
    c10: "hotTea",
  };

  const pills = useMemo(
    () =>
      CATEGORIES.map((c) => (
        <TouchableOpacity
          key={c.id}
          onPress={() => {
            setActiveCat(c.id);
            setShowCategoryPanel(true);
            setSearchText("");
          }}
          activeOpacity={0.8}
          style={[styles.catPill, activeCat === c.id && styles.catPillActive]}
        >
          <Image source={c.img} style={styles.catThumb} />
          <Text style={[styles.catText, activeCat === c.id && styles.catTextActive]}>
            {c.name}
          </Text>
        </TouchableOpacity>
      )),
    [activeCat]
  );

  const filteredProducts =
    activeCat && PRODUCTS[catKeyMap[activeCat]]
      ? PRODUCTS[catKeyMap[activeCat]].filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : [];

  let sortedProducts = [...filteredProducts];
  if (sortType === "star") {
    sortedProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortType === "trending") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  const SortPanel = () => (
    <Modal
      visible={sortPanelVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSortPanelVisible(false)}
    >
      <TouchableOpacity
        style={styles.sortOverlay}
        activeOpacity={1}
        onPressOut={() => setSortPanelVisible(false)}
      >
        <View style={styles.sortPanel}>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              setSortType("star");
              setSortPanelVisible(false);
            }}
          >
            <Text style={styles.sortBtnText}>Most Star Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              setSortType("trending");
              setSortPanelVisible(false);
            }}
          >
            <Text style={styles.sortBtnText}>Trending Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              setSortType(null);
              setSortPanelVisible(false);
            }}
          >
            <Text style={[styles.sortBtnText, { color: "#C68B59" }]}>Clear Sort</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const CategoryPanel = () => (
    <View style={styles.categoryPanelContainer}>
      <View style={styles.categoryPanelHeader}>
        <Text style={styles.categoryPanelTitle}>
          {CATEGORIES.find((c) => c.id === activeCat)?.name}
        </Text>
        <Text style={{ width: 32 }}>{""}</Text>
      </View>
      <View style={[styles.searchBar, { marginHorizontal: 14, marginBottom: 10 }]}>
        <Search size={18} color={COLORS.sub} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={COLORS.sub}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => setSortPanelVisible(true)}>
          <SlidersHorizontal size={18} color={COLORS.sub} />
        </TouchableOpacity>
      </View>
      <SortPanel />
      <ScrollView contentContainerStyle={styles.gridScrollContent}>
        {sortedProducts.length === 0 ? (
          <Text style={{ color: COLORS.sub, textAlign: "center", marginTop: 40 }}>
            No products found.
          </Text>
        ) : (
          <View style={styles.gridWrap}>
            {sortedProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    product: {
                      ...item,
                      image: item.img.uri ? item.img.uri : Image.resolveAssetSource(item.img).uri,
                    },
                  })
                }
                activeOpacity={0.85}
              >
                <Image source={item.img} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.priceRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={12} color={COLORS.star} fill={COLORS.star} />
                    <Text style={styles.ratingText}> {item.rating}</Text>
                  </View>
                  <Text style={styles.priceText}>₱{item.price}</Text>
                  <TouchableOpacity style={styles.cartBtn}>
                    <ShoppingCart size={18} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.tabBar}>
        <TabItem
          active={activeTab === "home"}
          label="Home"
          icon={<Home size={22} color={activeTab === "home" ? "#fff" : COLORS.text} />}
          onPress={() => setActiveTab("home")}
        />
        <TabItem
          active={activeTab === "orders"}
          label="Orders"
          icon={<ShoppingCart size={22} color={activeTab === "orders" ? "#fff" : COLORS.text} />}
          onPress={() => setActiveTab("orders")}
        />
        <TabItem
          active={activeTab === "notify"}
          label="Notifications"
          icon={<Bell size={22} color={activeTab === "notify" ? "#fff" : COLORS.text} />}
          onPress={() => setActiveTab("notify")}
        />
        <TabItem
          active={activeTab === "profile"}
          label="Profile"
          icon={<User size={22} color={activeTab === "profile" ? "#fff" : COLORS.text} />}
          onPress={() =>
            navigation.navigate("Profile", {
              profile,
              onSave: handleProfileSave,
            })
          }
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => openScanner()}
        >
          <Scan size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  function productRow(title, key) {
    if (!PRODUCTS[key]) return null;
    return (
      <View style={{ marginTop: 8 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRODUCTS[key].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("ProductDetails", {
                  product: {
                    ...item,
                    image: item.img.uri ? item.img.uri : Image.resolveAssetSource(item.img).uri,
                  },
                })
              }
            >
              <Image source={item.img} style={styles.cardImage} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Star size={12} color={COLORS.star} fill={COLORS.star} />
                  <Text style={styles.ratingText}> {item.rating}</Text>
                </View>
                <Text style={styles.priceText}>₱{item.price}</Text>
                <TouchableOpacity style={styles.cartBtn}>
                  <ShoppingCart size={18} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Add this header above your main content (inside SafeAreaView, before ScrollView)
  const Header = () => (
    <View style={styles.headerWrapper}>
      {/* blur background or translucent fallback */}
      {BlurViewComp ? (
        <BlurViewComp intensity={70} tint="light" style={styles.headerBlur} />
      ) : (
        <View style={styles.headerFallback} />
      )}
      {/* content above blur */}
      <View style={styles.headerContent}>
        <View style={styles.logoWrap}>
          <Image source={LogoImg} style={styles.logoImg} />
          <Text style={styles.shopName}>Teacup</Text>
        </View>
        <View style={styles.userWrap}>
          <Image
            source={profile?.image ? { uri: profile.image } : require("./assets/profile.png")}
            style={styles.userImg}
          />
          <Text style={styles.userName}>{profile?.username}</Text>
        </View>
      </View>
    </View>
  );

  // Request permission and open scanner
  async function openScanner() {
    // Safe fallback: do not attempt to load native module here.
    // This prevents the "Cannot find native module 'ExpoBarCodeScanner'" crash
    // while you install/rebuild the package. To enable scanning, install
    // expo-barcode-scanner and rebuild the native app (see instructions below).
    Alert.alert(
      "Scanner unavailable",
      "QR scanner is not active in this build.\n\nTo enable scanning:\n\n" +
        "1) If you use Expo managed workflow:\n   expo install expo-barcode-scanner\n\n" +
        "2) If you use bare React Native:\n   npm install expo-barcode-scanner\n   cd ios && pod install\n\n" +
        "After installing, rebuild/restart the app (expo start -c or rebuild native).",
      [{ text: "OK" }]
    );
    // ensure modal not opened accidentally
    setScannerVisible(false);
  }

  function closeScanner() {
    setScannerVisible(false);
    setScanned(false);
  }

  function handleBarCodeScanned({ type, data }) {
    if (scanned) return;
    setScanned(true);
    setScannerVisible(false);
    console.log("QR scanned:", { type, data });
    // Show simple feedback and attempt to navigate to ProductDetails with raw data
    Alert.alert("Scanned", data, [
      {
        text: "Open",
        onPress: () => {
          // pass qrData; ProductDetails can decide what to do
          navigation.navigate("ProductDetails", { qrData: data });
        },
      },
      { text: "OK", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <Header />
      {!showCategoryPanel && activeTab === "home" && (
        <ScrollView
          style={styles.container}
          // reserve header space so content doesn't shift when header content changes
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 120 }}
        >
        
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.sub} />
            <TextInput placeholder="Search" placeholderTextColor={COLORS.sub} style={styles.searchInput} />
            <SlidersHorizontal size={18} color={COLORS.sub} />
          </View>
          <View style={styles.bannerWrap}>
            <ImageBackground source={SAMPLE2_IMG} resizeMode="cover" style={styles.bannerBg}>
              <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)"]} style={styles.bannerMask} />
            </ImageBackground>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle}>Dark Chocolate{"\n"}Milk Tea</Text>
              <Text style={styles.bannerSub}>Decadent cocoa meets classic black{"\n"}tea · #TrendingFlavor</Text>
              <TouchableOpacity activeOpacity={0.9} style={styles.orderNow}>
                <Text style={styles.orderNowTxt}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={{ marginTop: 12 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {pills}
            <View style={{ width: 12 }} />
          </ScrollView>
          {productRow("Recommendation", "recommendation")}
          {productRow("Milk Tea", "milkTea")}
          {productRow("Fruit Tea", "fruitTea")}
          {productRow("Yogurt", "yogurt")}
          {productRow("Frappe", "frappe")}
          {productRow("Coffee Frappe", "coffeeFrappe")}
          {productRow("Iced Coffee", "icedCoffee")}
          {productRow("Iced Latte", "icedLatte")}
          {productRow("Hot Coffee", "hotCoffee")}
          {productRow("Hot Choco", "hotChoco")}
          {productRow("Hot Tea", "hotTea")}
        </ScrollView>
      )}
      {showCategoryPanel && <CategoryPanel />}
      {!showCategoryPanel && activeTab === "orders" && (
        <AddToCharts cartItems={[]} />
      )}
      {activeTab === "notify" && (
        <NotificationsPanel />
      )}
      <View style={styles.tabBar}>
        <TabItem active={activeTab === "home"} label="Home" icon={<Home size={22} color={activeTab === "home" ? "#fff" : COLORS.text} />} onPress={() => setActiveTab("home")} />
        <TabItem active={activeTab === "orders"} label="Orders" icon={<ShoppingCart size={22} color={activeTab === "orders" ? "#fff" : COLORS.text} />} onPress={() => setActiveTab("orders")} />
        <TabItem active={activeTab === "notify"} label="Notifications" icon={<Bell size={22} color={activeTab === "notify" ? "#fff" : COLORS.text} />} onPress={() => setActiveTab("notify")} />
        <TabItem active={activeTab === "profile"} label="Profile" icon={<User size={22} color={activeTab === "profile" ? "#fff" : COLORS.text} />} 
          onPress={() =>
            navigation.navigate("Profile", {
              profile,
              onSave: handleProfileSave,
            })
          }
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => openScanner()}
        >
          <Scan size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* QR Scanner Modal */}
      <Modal visible={scannerVisible} transparent animationType="slide" onRequestClose={closeScanner}>
        <View style={styles.scannerContainer}>
          {BarCodeScannerComp ? (
        <BarCodeScannerComp onBarCodeScanned={handleBarCodeScanned} style={styles.scannerView} />
      ) : (
        <View style={[styles.scannerView, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: "#fff", textAlign: "center", paddingHorizontal: 24 }}>
            Scanner not available. Install expo-barcode-scanner and restart the app.
          </Text>
        </View>
      )}
          <View style={styles.scannerTop}>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
          </View>
          <TouchableOpacity style={styles.scannerClose} onPress={closeScanner}>
            <Text style={styles.scannerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TabItem({ active, label, icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.tabItem}>
      <View
        style={[
          styles.tabIconWrap,
          active && styles.tabIconActive,
          active && styles.tabIconRounded,
        ]}
      >
        {icon}
      </View>
      {label ? (
        <Text style={[styles.tabLabel, active && { color: "#fff" }]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 14 },
  appTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", color: COLORS.text, marginTop: 8, marginBottom: 8 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginHorizontal: 8, color: COLORS.text, fontSize: 15 },

  bannerWrap: {
    marginTop: 14,
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  bannerBg: { width: "100%", height: "100%" },
  bannerMask: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  bannerTextBox: { position: "absolute", left: 16, top: 18 },
  bannerTitle: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 28 },
  bannerSub: { color: "#F1F1F1", fontSize: 12, marginTop: 6 },
  orderNow: { marginTop: 10, backgroundColor: COLORS.star, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: "flex-start" },
  orderNowTxt: { fontWeight: "700" },

  catPill: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    width: 110,
    alignItems: "center",
  },
  catPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catThumb: { width: 38, height: 38, borderRadius: 8, marginBottom: 6 },
  catText: { fontSize: 12, color: COLORS.text, fontWeight: "600" },
  catTextActive: { color: "#fff" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 8, color: COLORS.text },

  card: {
    width: 150,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: { width: "100%", height: 90, borderRadius: 10, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  ratingText: { color: COLORS.sub, fontSize: 12 },
  priceText: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  cartBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },

  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: { alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconActive: {
    backgroundColor: COLORS.accent,
  },
  tabIconRounded: {
    borderRadius: 24, // More rounded when active
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  tabLabel: { fontSize: 12, color: COLORS.text, marginTop: 2, fontWeight: "700" },
  fab: {
    position: "absolute",
    left: "50%",           // center horizontally
    marginLeft: -26,       // half of width to truly center
    bottom: 62,
    width: 60,
    height: 60,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerView: {
    width: "100%",
    height: "100%",
  },
  scannerTop: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scannerClose: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scannerCloseText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Add these styles for the panel:
  categoryPanelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg,
    zIndex: 10,
    paddingTop: 0,
  },
  categoryPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPanelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  gridScrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 120,
    flexGrow: 1,
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  gridCard: {
    width: "47%",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    marginRight: "3%",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sortOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  sortPanel: {
    marginTop: 70,
    marginRight: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 170,
  },
  sortBtn: {
    paddingVertical: 10,
  },
  sortBtnText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.accent,
  },
  userWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // new styles for the updated header
  headerWrapper: {
   
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    height: HEADER_HEIGHT,           // fixed header height
    paddingHorizontal: 18,
   },
   headerBlur: {
     ...StyleSheet.absoluteFillObject,
     borderRadius: 0,
   },
   headerFallback: {
     ...StyleSheet.absoluteFillObject,
     backgroundColor: "rgba(255,255,255,0.6)",
   },
   headerContent: {
     flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-between",
     height: HEADER_HEIGHT,           // keep inner content vertically centered
   },
});
