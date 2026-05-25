import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleplaceorder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `https://myntra-clone-7tse.onrender.com/order/create/${user._id}`,
        {
          shippingAddress:
            "123 Main Street, Apt 4B, New York, NY, 10001",
          paymentMethod: "Card",
        }
      );

      // 🔥 HANDLE PARTIAL FAILURES (REAL UX)
      if (res.data.failedItems?.length) {
        Alert.alert(
          "Some items were not ordered",
          res.data.failedItems
            .map((item: any) => `${item.name} (${item.reason})`)
            .join("\n")
        );
      }

      router.push("/orders");
    } catch (error: any) {
      console.log("ERROR 👉", error.response?.data);

      Alert.alert(
        "Order Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Shipping */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={theme.primary} />
            <Text style={styles.sectionTitle}>
              Shipping Address
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={theme.secondaryText}
              defaultValue="John Doe"
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              placeholderTextColor={theme.secondaryText}
              defaultValue="123 Main Street"
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 2"
              placeholderTextColor={theme.secondaryText}
              defaultValue="Apt 4B"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                placeholderTextColor={theme.secondaryText}
                defaultValue="New York"
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                placeholderTextColor={theme.secondaryText}
                defaultValue="NY"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Postal Code"
                placeholderTextColor={theme.secondaryText}
                defaultValue="10001"
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Country"
                placeholderTextColor={theme.secondaryText}
                defaultValue="United States"
              />
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={theme.text} />
            <Text style={styles.sectionTitle}>
              Payment Method
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor={theme.secondaryText}
              defaultValue="**** **** **** 4242"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Expiry Date"
                placeholderTextColor={theme.secondaryText}
                defaultValue="12/25"
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                placeholderTextColor={theme.secondaryText}
                defaultValue="***"
              />
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={theme.text} />
            <Text style={styles.sectionTitle}>
              Order Summary
            </Text>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹3,798</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₹99</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₹190</Text>
            </View>

            <View style={[styles.summaryRow, styles.total]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹4,087</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          disabled={loading}
          onPress={handleplaceorder}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? "PLACING..." : "PLACE ORDER"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      padding: 15,
      paddingTop: 50,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },

    content: {
      flex: 1,
      padding: 15,
    },

    section: {
      marginBottom: 20,
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 15,
      elevation: 5,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginLeft: 10,
    },

    form: {
      gap: 10,
    },

    input: {
      backgroundColor: theme.background,
      color: theme.text,
      padding: 15,
      borderRadius: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    halfInput: {
      width: "48%",
    },

    summary: {
      gap: 10,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
    },

    summaryLabel: {
      fontSize: 16,
      color: theme.secondaryText,
    },

    summaryValue: {
      fontSize: 16,
      color: theme.text,
    },

    total: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginTop: 10,
      paddingTop: 10,
    },

    totalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },

    totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },

    footer: {
      padding: 15,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    placeOrderButton: {
      backgroundColor: theme.background,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },

    placeOrderButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "bold",
    },
  });