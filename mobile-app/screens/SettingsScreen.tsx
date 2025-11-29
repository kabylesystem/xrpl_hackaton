import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useSettings } from "../context/SettingsContext";

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { settings, updateSettings } = useSettings();
  const [isAutoMode, setIsAutoMode] = useState(settings.autoScale);
  const [manualMax, setManualMax] = useState(
    settings.manualMaxBalance.toString()
  );

  const autoScalePresets = [
    { range: "0 - 100 XRP", max: 250 },
    { range: "100 - 500 XRP", max: 1000 },
    { range: "500 - 1000 XRP", max: 1500 },
    { range: "1000 - 5000 XRP", max: 10000 },
    { range: "5000+ XRP", max: "Balance × 2" },
  ];

  const handleSave = () => {
    if (!isAutoMode) {
      const maxValue = Number.parseFloat(manualMax);
      if (isNaN(maxValue) || maxValue <= 0) {
        Alert.alert("Error", "Please enter a valid maximum balance");
        return;
      }
      updateSettings({
        autoScale: false,
        manualMaxBalance: maxValue,
      });
    } else {
      updateSettings({
        autoScale: true,
      });
    }

    Alert.alert("Success", "Settings saved successfully!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleToggleMode = (value: boolean) => {
    setIsAutoMode(value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progress Bar Settings</Text>
        <Text style={styles.subtitle}>
          Configure how your balance progress is displayed
        </Text>

        {/* Mode Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.toggleLabel}>Auto Scale Mode</Text>
              <Text style={styles.toggleDescription}>
                Automatically adjust max balance based on your current balance
              </Text>
            </View>
            <Switch
              value={isAutoMode}
              onValueChange={handleToggleMode}
              trackColor={{ false: "#d1d5db", true: "#3498db" }}
              thumbColor={isAutoMode ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Auto Mode Info */}
        {isAutoMode ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Auto Scale Ranges</Text>
            <Text style={styles.cardDescription}>
              Your progress bar will automatically adjust based on these ranges:
            </Text>
            {autoScalePresets.map((preset, index) => (
              <View key={index} style={styles.presetRow}>
                <Text style={styles.presetRange}>{preset.range}</Text>
                <Text style={styles.presetMax}>→ Max: {preset.max}</Text>
              </View>
            ))}
          </View>
        ) : (
          /* Manual Mode Input */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custom Maximum Balance</Text>
            <Text style={styles.cardDescription}>
              Set your own goal for the progress bar
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={manualMax}
                onChangeText={setManualMax}
                keyboardType="decimal-pad"
                placeholder="Enter max balance"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputSuffix}>XRP</Text>
            </View>
            <Text style={styles.inputHint}>
              Current setting: {settings.manualMaxBalance} XRP
            </Text>
          </View>
        )}

        {/* Example */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>📊 How it works</Text>
          <Text style={styles.exampleText}>
            {isAutoMode
              ? "The progress bar will dynamically adjust its maximum value as your balance grows, keeping the visualization meaningful."
              : `The progress bar will always show your balance as a percentage of ${
                  manualMax || settings.manualMaxBalance
                } XRP, giving you a fixed goal to track.`}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#23292E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#23292E",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: "#666",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#23292E",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  presetRange: {
    fontSize: 14,
    color: "#23292E",
    fontWeight: "500",
  },
  presetMax: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3498db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#23292E",
    paddingVertical: 12,
  },
  inputSuffix: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  exampleCard: {
    backgroundColor: "#e8f4f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#23292E",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  cancelButtonText: {
    color: "#e74c3c",
    fontSize: 18,
    fontWeight: "600",
  },
});
