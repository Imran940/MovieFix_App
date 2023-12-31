// import Header from "@/components/Header";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import Header from "./src/components/Header";
// import { store } from "@/redux/store";

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Header />
        <Text>Hey let's start</Text>
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
});
