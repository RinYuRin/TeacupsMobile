import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#6FBF73", backgroundColor: "#F0FFF4" }}
      text1Style={{ fontSize: 16, fontWeight: "bold", color: "#22543D" }}
      text2Style={{ fontSize: 13, color: "#2F855A" }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#E53E3E", backgroundColor: "#FFF5F5" }}
      text1Style={{ fontSize: 16, fontWeight: "bold", color: "#742A2A" }}
      text2Style={{ fontSize: 13, color: "#9B2C2C" }}
    />
  ),
};
