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
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Star,
  Home,
  Bell,
  User,
  Scan,
} from "lucide-react-native";
import AddToCharts from "./addtocharts";
import NotificationsPanel from "./NotificationsPanel";
import LogoImg from "./assets/icon.png";
import API from "./api";

const { width } = Dimensions.get("window");
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

const SAMPLE2_IMG = require("./assets/image/dark-choco1.png");

export default function Userhome({ navigation }) {
  // blur view
  const [BlurViewComp, setBlurViewComp] = useState(null);
  useEffect(() => {
    try {
      const mod = require("expo-blur");
      const B = mod?.BlurView || mod?.default || mod;
      if (B) setBlurViewComp(() => B);
    } catch (e) {
      setBlurViewComp(null);
    }
  }, []);

  // backend products
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API.baseURL}/product/fetch`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    }
    fetchProducts();
  }, []);

  // group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    products.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push({
        id: p._id,
        name: p.name,
        price: Number(p.priceS || p.priceM || p.priceL || p.priceB || 0),
        rating: 4.5,
        img: { uri: `${API.baseURL.replace('/api', '')}${p.image}` },
        prices: {
          regular: Number(p.priceS) || 0,
          medium: Number(p.priceM) || 0,
          large: Number(p.priceL) || 0,
          buy1take1: Number(p.priceB) || 0,
        },
      });
    });
    return grouped;
  }, [products]);

  const [activeCat, setActiveCat] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortPanelVisible, setSortPanelVisible] = useState(false);
  const [sortType, setSortType] = useState(null);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [BarCodeScannerComp, setBarCodeScannerComp] = useState(null);

  const [profile, setProfile] = useState({
    username: "John Doe",
  });

  function handleProfileSave(updatedProfile) {
    if (!updatedProfile) return;
    setProfile((prev) => ({ ...prev, ...updatedProfile }));
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
            <Text style={[styles.sortBtnText, { color: "#C68B59" }]}>
              Clear Sort
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // dynamic rendering of categories from DB
  function renderProductsByCategory() {
    return Object.entries(productsByCategory).map(([cat, items]) => (
      <View key={cat} style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>{cat}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("ProductDetails", {
                  product: { ...item, image: item.img.uri },
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
    ));
  }

  const Header = () => (
    <View style={styles.headerWrapper}>
      {BlurViewComp ? (
        <BlurViewComp intensity={70} tint="light" style={styles.headerBlur} />
      ) : (
        <View style={styles.headerFallback} />
      )}
      <View style={styles.headerContent}>
        <View style={styles.logoWrap}>
          <Image source={LogoImg} style={styles.logoImg} />
          <Text style={styles.shopName}>Teacup</Text>
        </View>
        <View style={styles.userWrap}>
          <Image
            source={
              profile?.image
                ? { uri: profile.image }
                : require("./assets/profile.png")
            }
            style={styles.userImg}
          />
          <Text style={styles.userName}>{profile?.username}</Text>
        </View>
      </View>
    </View>
  );

  async function openScanner() {
    Alert.alert(
      "Scanner unavailable",
      "QR scanner is not active in this build.",
      [{ text: "OK" }]
    );
    setScannerVisible(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <Header />
      {!showCategoryPanel && activeTab === "home" && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT,
            paddingBottom: 120,
          }}
        >
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.sub} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={COLORS.sub}
              style={styles.searchInput}
            />
            <SlidersHorizontal size={18} color={COLORS.sub} />
          </View>
          <View style={styles.bannerWrap}>
            <ImageBackground
              source={SAMPLE2_IMG}
              resizeMode="cover"
              style={styles.bannerBg}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)"]}
                style={styles.bannerMask}
              />
            </ImageBackground>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle}>
                Dark Chocolate{"\n"}Milk Tea
              </Text>
              <Text style={styles.bannerSub}>
                Decadent cocoa meets classic black{"\n"}tea · #TrendingFlavor
              </Text>
              <TouchableOpacity activeOpacity={0.9} style={styles.orderNow}>
                <Text style={styles.orderNowTxt}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Dynamic category rendering */}
          {renderProductsByCategory()}
        </ScrollView>
      )}
      {showCategoryPanel && <Text>Category Panel (not changed)</Text>}
      {!showCategoryPanel && activeTab === "orders" && (
        <AddToCharts cartItems={[]} />
      )}
      {activeTab === "notify" && <NotificationsPanel />}
      <View style={styles.tabBar}>
        <TabItem
          active={activeTab === "home"}
          label="Home"
          icon={
            <Home
              size={22}
              color={activeTab === "home" ? "#fff" : COLORS.text}
            />
          }
          onPress={() => setActiveTab("home")}
        />
        <TabItem
          active={activeTab === "orders"}
          label="Orders"
          icon={
            <ShoppingCart
              size={22}
              color={activeTab === "orders" ? "#fff" : COLORS.text}
            />
          }
          onPress={() => setActiveTab("orders")}
        />
        <TabItem
          active={activeTab === "notify"}
          label="Notifications"
          icon={
            <Bell
              size={22}
              color={activeTab === "notify" ? "#fff" : COLORS.text}
            />
          }
          onPress={() => setActiveTab("notify")}
        />
        <TabItem
          active={activeTab === "profile"}
          label="Profile"
          icon={
            <User
              size={22}
              color={activeTab === "profile" ? "#fff" : COLORS.text}
            />
          }
          onPress={() =>
            navigation.navigate("Profile", {
              profile,
              onSave: handleProfileSave,
            })
          }
        />
        <TouchableOpacity style={styles.fab} onPress={() => openScanner()}>
          <Scan size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TabItem({ active, label, icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.tabItem}
    >
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
        <Text style={[styles.tabLabel, active && { color: "#fff" }]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 14 },
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
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: COLORS.text,
    fontSize: 15,
  },
  bannerWrap: {
    marginTop: 14,
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  bannerBg: { width: "100%", height: "100%" },
  bannerMask: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bannerTextBox: { position: "absolute", left: 16, top: 18 },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  bannerSub: { color: "#F1F1F1", fontSize: 12, marginTop: 6 },
  orderNow: {
    marginTop: 10,
    backgroundColor: COLORS.star,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  orderNowTxt: { fontWeight: "700" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
    color: COLORS.text,
  },
  card: {
    width: 150,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  ratingText: { color: COLORS.sub, fontSize: 12 },
  priceText: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  cartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
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
  tabIconActive: { backgroundColor: COLORS.accent },
  tabIconRounded: {
    borderRadius: 24,
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
    left: "50%",
    marginLeft: -26,
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
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 36, height: 36, marginRight: 8, borderRadius: 8 },
  shopName: { fontSize: 20, fontWeight: "bold", color: COLORS.accent },
  userWrap: { flexDirection: "row", alignItems: "center" },
  userImg: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  userName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    height: HEADER_HEIGHT,
    paddingHorizontal: 18,
  },
  headerBlur: { ...StyleSheet.absoluteFillObject, borderRadius: 0 },
  headerFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_HEIGHT,
  },
});
