import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext"; // ✅ ADD
import { CreditCard } from "lucide-react-native";

export default function Transactions() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme(); // ✅ ADD

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const res = await axios.get(
          `https://myntra-clone-7tse.onrender.com/transaction/${user._id}`
        );
        setData(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading)
    return <ActivityIndicator size="large" color={"#ff3f6c"} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      {/* 🔥 HEADER */}
      <Text style={{
        color: theme.text,
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 15,
      }}>
       My Transactions  <CreditCard size={32} color={"#ff3f6c"} />
      </Text>

      {/* 🔗 GO TO ORDERS */}
      <TouchableOpacity
        onPress={() => router.push("/orders")}
        style={{
          backgroundColor: "#ff3f6c",
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.textInverse, fontWeight: "600" }}>
          View Orders →
        </Text>
      </TouchableOpacity>

      {/* 📥 EXPORT CSV */}
      <TouchableOpacity
        onPress={() => {
          const url = `https://myntra-clone-7tse.onrender.com/transaction/export/${user._id}`;
          window.open(url);
        }}
        style={{
          backgroundColor: theme.secondary || "#ff3f6c",
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.textInverse, fontWeight: "600" }}>
          Export CSV ↓
        </Text>
      </TouchableOpacity>

      {/* 📦 TRANSACTIONS */}
      {data.length === 0 ? (
        <Text style={{ color: theme.secondaryText }}>
          No transactions yet
        </Text>
      ) : (
        data.map((item: any) => (
          <View
            key={item._id}
            style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 15,
            }}
          >
            {/* 💰 AMOUNT */}
            <Text style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: "bold",
            }}>
              ₹{item.amount}
            </Text>

            {/* 📊 STATUS */}
            <Text style={{
              color:
                item.status === "success"
                  ? theme.success || "green"
                  : item.status === "failed"
                  ? theme.error || "red"
                  : theme.warning || "#ff3f6c",
              marginTop: 5,
            }}>
              Status: {item.status}
            </Text>

            {/* 💳 METHOD */}
            <Text style={{ color: theme.secondaryText, marginTop: 5 }}>
              Method: {item.paymentMethod}
            </Text>

            {/* 🕒 DATE */}
            <Text style={{ color: theme.mutedText || theme.secondaryText, marginTop: 5 }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>

            {/* 🧾 DOWNLOAD PDF */}
            <TouchableOpacity
              onPress={() => {
                const url = `https://myntra-clone-7tse.onrender.com/transaction/receipt/${item._id}`;
                window.open(url);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#ff3f6c",
                padding: 8,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.textInverse, fontSize: 12 }}>
                Download Receipt 📄
              </Text>
            </TouchableOpacity>

            {/* 🔥 LOGS */}
            {item.logs && item.logs.length > 0 && (
              <View style={{
                marginTop: 10,
                paddingLeft: 10,
                borderLeftWidth: 2,
                borderLeftColor: "#ff3f6c",
              }}>
                {item.logs.map((log: any, index: number) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ color: theme.text, fontSize: 13 }}>
                      • {log.status} - {log.message}
                    </Text>
                    <Text style={{
                      color: theme.secondaryText,
                      fontSize: 11,
                    }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}