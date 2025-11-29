import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
  const [displayName, setDisplayName] = useState(settings.displayName);
  const { darkMode, toggleTheme } = useThemeMode();
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a valid name");
      return;
    }
    setSaving(true);
    updateSettings({ displayName: displayName.trim() });
    setSaving(false);
    Alert.alert("Saved", "Preferences updated", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Set the name displayed to others.</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Tunde"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Appearance</Text>
            <Text style={styles.subtitle}>Toggle theme for low-light environments.</Text>
            <View style={styles.themeRow}>
              <TouchableOpacity
                style={[styles.themeButton, !darkMode && styles.themeButtonActive]}
                onPress={() => toggleTheme()}
              >
                <Text style={[styles.themeText, !darkMode && styles.themeTextActive]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeButton, darkMode && styles.themeButtonActive]}
                onPress={() => toggleTheme()}
              >
                <Text style={[styles.themeText, darkMode && styles.themeTextActive]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Settings"}</Text>
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
      width: "100%",
    },
    inputContainer: {
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
    themeRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    themeButton: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    themeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    themeText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    themeTextActive: {
      color: colors.primary,
      fontWeight: "700",
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
