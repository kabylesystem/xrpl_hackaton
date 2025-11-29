import "react-native-gesture-handler";
import "./utils/polyfills";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "./context/SettingsContext";
import { WalletProvider } from "./context/WalletContext";
import { ThemeProvider, useThemeMode } from "./context/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { WalletSetupScreen } from "./screens/WalletSetupScreen";
import { PayScreen } from "./screens/PayScreen";
import { ReceiveScreen } from "./screens/ReceiveScreen";
import { PaymentRequestScreen } from "./screens/PaymentRequestScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SMSPaymentScreen } from "./screens/SMSPaymentScreen";
import { QRPaymentScreen } from "./screens/QRPaymentScreen";
import { PaymentSuccessScreen } from "./screens/PaymentSuccessScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Stack = createStackNavigator<any>();

const AppNavigator = () => {
  const { darkMode } = useThemeMode();
  return (
    <>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="WalletSetup" component={WalletSetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Pay" component={PayScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="PaymentRequest" component={PaymentRequestScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="SMSPayment" component={SMSPaymentScreen} />
          <Stack.Screen name="QRPayment" component={QRPaymentScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <WalletProvider>
          <AppNavigator />
        </WalletProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
