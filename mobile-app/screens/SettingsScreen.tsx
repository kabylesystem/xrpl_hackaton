import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { typography, spacing, borderRadius, shadows } from "../theme";
import { useThemedColors, useThemeMode } from "../context/ThemeContext";

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { settings, updateSettings } = useSettings();
  const [isAutoMode, setIsAutoMode] = useState(settings.autoScale);
  const [manualMax, setManualMax] = useState(
    settings.manualMaxBalance.toString()
  );
  const { darkMode, toggleTheme } = useThemeMode();
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>Dark mode</Text>
                <Text style={styles.toggleDescription}>
                  Toggle a darker palette for low-light environments
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={darkMode ? colors.textWhite : "#f4f3f4"}
              />
            </View>
          </View>

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
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isAutoMode ? colors.textWhite : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Auto Mode Info */}
          {isAutoMode ? null : (
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
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      alignItems: "center",
    },
    content: {
      paddingHorizontal: spacing.lg,
      width: "100%",
      maxWidth: 520,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.md,
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    toggleLabelContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    toggleLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    toggleDescription: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    cardTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    cardDescription: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    presetRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    presetRange: {
      ...typography.body,
      color: colors.textPrimary,
    },
    presetMax: {
      ...typography.bodyBold,
      color: colors.primary,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      ...typography.h3,
      color: colors.textPrimary,
      paddingVertical: spacing.sm,
    },
    inputSuffix: {
      ...typography.bodyBold,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    inputHint: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    exampleCard: {
      backgroundColor: `${colors.primary}12`,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    exampleTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    exampleText: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    saveButton: {
      backgroundColor: colors.secondary,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      alignItems: "center",
      marginTop: spacing.xs,
      ...shadows.sm,
    },
    saveButtonText: {
      ...typography.button,
      color: colors.textWhite,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      alignItems: "center",
      marginTop: spacing.sm,
      borderWidth: 2,
      borderColor: colors.error,
    },
    cancelButtonText: {
      ...typography.button,
      color: colors.error,
    },
  });
