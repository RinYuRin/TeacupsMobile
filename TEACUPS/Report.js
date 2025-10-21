import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as XLSX from "xlsx";

const screenWidth = Dimensions.get("window").width;

export default function Report() {
  // Sample sales data
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [500, 700, 400, 800, 650, 900] }],
  };

  // Sample product data
  const productData = {
    labels: ["Milk Tea", "Fruit Tea", "Yogurt", "Frappe"],
    datasets: [{ data: [120, 90, 60, 150] }],
  };

  // 📌 Helper for filename with date
  const getFileName = (ext) => {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `Report_${date}.${ext}`;
  };

  // ✅ Export as Excel
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
          Quantity: productData.datasets[0].data[i],
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

  // ✅ Export as CSV
  const exportCSV = async () => {
    try {
      let csv =
        "Sales Report\nMonth,Sales\n" +
        salesData.labels
          .map((label, i) => `${label},${salesData.datasets[0].data[i]}`)
          .join("\n") +
        "\n\nProduct Report\nProduct,Quantity\n" +
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

  // ✅ Export as PDF
  const exportPDF = async () => {
    try {
      const fileName = getFileName("pdf");

      const html = `
        <html>
          <body>
            <h1 style="text-align:center;">Sales & Product Report</h1>
            <h2>Sales Data</h2>
            <table border="1" cellspacing="0" cellpadding="5">
              <tr><th>Month</th><th>Sales</th></tr>
              ${salesData.labels
                .map(
                  (label, i) =>
                    `<tr><td>${label}</td><td>${salesData.datasets[0].data[i]}</td></tr>`
                )
                .join("")}
            </table>

            <h2>Product Data</h2>
            <table border="1" cellspacing="0" cellpadding="5">
              <tr><th>Product</th><th>Quantity</th></tr>
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}> Reports</Text>

      {/* Sales Graph */}
      <Text style={styles.title}>Sales Graph Report</Text>
      <LineChart
        data={salesData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Product Graph */}
      <Text style={styles.title}>Product Graph Report</Text>
      <BarChart
        data={productData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Export Buttons */}
      <Text style={styles.title}>Export Options</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#C4956C" }]} onPress={exportPDF}>
          <Text style={styles.buttonText}>Export as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#A0826D" }]} onPress={exportExcel}>
          <Text style={styles.buttonText}>Export as Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#7B3F00" }]} onPress={exportCSV}>
          <Text style={styles.buttonText}>Export as CSV</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: { marginTop: 20 },
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
