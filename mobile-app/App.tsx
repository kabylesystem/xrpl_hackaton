import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "./context/SettingsContext";
import HomeScreen from "./screens/HomeScreen";
import SendPaymentScreen from "./screens/SendPaymentScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#23292E",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "XRPL Wallet" }}
          />
          <Stack.Screen
            name="SendPayment"
            component={SendPaymentScreen}
            options={{ title: "Send Payment" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Settings" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
