const LOCAL_IP = "10.146.22.135"; // This isn't used here, maybe intended for the fallback?
const PORT = "5000"; // This isn't used here

export default {
  // Corrected: Remove backticks, use JavaScript logic directly
  baseURL: `http://${LOCAL_IP}:${PORT}/api`, 
  // Example fallback using your defined IP and Port, assuming /api prefix
  // OR fallback to localhost if preferred:
   //baseURL: process.env.EXPO_PUBLIC_API_URL || "http://${LOCAL_IP}:${PORT}/api", 
  
  // baseURL: 'https://teacupsmobile.onrender.com/api' // Keep this commented out or remove
};