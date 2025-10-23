import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator // Added
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as XLSX from "xlsx";
import API from "./api";
const screenWidth = Dimensions.get("window").width;

// -----------------------------------------------------------------
// ⚠️ IMPORTANT: Replace with your actual API server address
// (e.g., your computer's IP address if running on the same network)// << REPLACE THIS
// -----------------------------------------------------------------


export default function Report() {
  // --- State for dynamic data ---
  const [salesData, setSalesData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [productData, setProductData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [isLoading, setIsLoading] = useState(true);

  // --- Fetch data on component mount ---
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Fetch sales by month
        const salesRes = await fetch(`${API.baseURL}/orders/reports/sales-by-month`);
        if (!salesRes.ok) throw new Error("Failed to fetch sales report");
        const salesReportData = await salesRes.json();
        setSalesData(salesReportData);

        // Fetch sales by category
        const productRes = await fetch(`${API.baseURL}/orders/reports/sales-by-category`);
        if (!productRes.ok) throw new Error("Failed to fetch product report");
        const productReportData = await productRes.json();
        setProductData(productReportData);

      } catch (error) {
        Alert.alert("Error", "Failed to load reports: " + error.message);
        setSalesData({ labels: ["Error"], datasets: [{ data: [0] }] });
        setProductData({ labels: ["Error"], datasets: [{ data: [0] }] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []); // Empty dependency array means this runs once on mount


  // 📌 Helper for filename with date
  const getFileName = (ext) => {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `Report_${date}.${ext}`;
  };

  // ✅ Export as Excel (Updated to use state)
  const exportExcel = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet([
        { Report: "Sales Report" },
        ...salesData.labels.map((label, i) => ({
          Month: label,
          Sales: salesData.datasets[0].data[i],
        })),
        {},
        { Report: "Product Report" },
        ...productData.labels.map((label, i) => ({
          Product: label,
          Quantity: productData.datasets[0].data[i], // Note: This is Total Sales, not Quantity
        })),
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reports");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const fileUri = FileSystem.documentDirectory + getFileName("xlsx");
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "Failed to export Excel: " + error.message);
    }
  };

  // ✅ Export as CSV (Updated to use state)
  const exportCSV = async () => {
    try {
      let csv =
        "Sales Report\nMonth,Sales\n" +
        salesData.labels
          .map((label, i) => `${label},${salesData.datasets[0].data[i]}`)
          .join("\n") +
        "\n\nProduct Report\nProduct,Sales\n" + // Changed from Quantity to Sales
        productData.labels
          .map((label, i) => `${label},${productData.datasets[0].data[i]}`)
          .join("\n");

      const fileUri = FileSystem.documentDirectory + getFileName("csv");
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "Failed to export CSV: " + error.message);
    }
  };

  // ✅ Export as PDF (Updated to use state)
  const exportPDF = async () => {
    try {
      const fileName = getFileName("pdf");

      const html = `
        <html>
          <body>
            <h1 style="text-align:center;">Sales & Product Report</h1>
            <h2>Sales Data</h2>
            <table border="1" cellspacing="0" cellpadding="5" style="width:100%;">
              <tr><th>Month</th><th>Sales</th></tr>
              ${salesData.labels
                .map(
                  (label, i) =>
                    `<tr><td>${label}</td><td>${salesData.datasets[0].data[i]}</td></tr>`
                )
                .join("")}
            </table>

            <h2>Product Data</h2>
            <table border="1" cellspacing="0" cellpadding="5" style="width:100%;">
              <tr><th>Product</th><th>Sales</th></tr> 
              ${productData.labels
                .map(
                  (label, i) =>
                    `<tr><td>${label}</td><td>${productData.datasets[0].data[i]}</td></tr>`
                )
                .join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const newPath = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({ from: uri, to: newPath });
      await Sharing.shareAsync(newPath);
    } catch (error) {
      Alert.alert("Error", "Failed to export PDF: " + error.message);
    }
  };
  
  // Disable buttons if loading or no data
  const exportDisabled = isLoading || salesData.labels.length === 0 || salesData.labels[0] === "No Data";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}> Reports</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#7B3F00" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Sales Graph */}
          <Text style={styles.title}>Monthly Sales Report (Completed)</Text>
          <LineChart
            data={salesData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero={true}
          />

          {/* Product Graph */}
          <Text style={styles.title}>Sales by Category Report (Completed)</Text>
          <BarChart
            data={productData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero={true}
          />

          {/* Export Buttons */}
          <Text style={styles.title}>Export Options</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: exportDisabled ? "#ccc" : "#C4956C" }]} 
              onPress={exportPDF}
              disabled={exportDisabled}
            >
              <Text style={styles.buttonText}>Export as PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: exportDisabled ? "#ccc" : "#A0826D" }]} 
              onPress={exportExcel}
              disabled={exportDisabled}
            >
              <Text style={styles.buttonText}>Export as Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: exportDisabled ? "#ccc" : "#7B3F00" }]} 
              onPress={exportCSV}
              disabled={exportDisabled}
            >
              <Text style={styles.buttonText}>Export as CSV</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#F9F9F9",
  backgroundGradientTo: "#F9F9F9",
  color: (opacity = 1) => `rgba(160, 130, 109, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(90, 91, 88, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#A0826D"
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F5F5" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#5A5B58",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#7B3F00",
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: { marginTop: 20, marginBottom: 40 /* Added margin */ },
  button: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});