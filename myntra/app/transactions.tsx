import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Transactions() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const res = await axios.get(
          `https://myntra-clone-7tse.onrender.com/transaction/${user._id}`
        );
        setTransactions(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <Text style={[styles.title, { color: theme.text }]}>
        My Transactions
      </Text>

      {transactions.length === 0 ? (
        <Text style={{ color: theme.text, textAlign: "center" }}>
          No transactions yet
        </Text>
      ) : (
        transactions.map((item: any) => (
          <View
            key={item._id}
            style={[
              styles.card,
              { backgroundColor: theme.card },
            ]}
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
              ₹{item.amount}
            </Text>

            <Text style={{ color: theme.secondaryText }}>
              {item.paymentMethod}
            </Text>

            <Text style={{ color: theme.secondaryText }}>
              {item.status}
            </Text>

            <Text style={{ color: theme.secondaryText }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>

            <Text style={{ color: theme.primary }}>
              {item.invoiceId}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
  },
  card: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
});