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

export default function Transactions() {
  const { user } = useAuth();
  const router = useRouter();

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
    return <ActivityIndicator size="large" color="#ff3f6c" />;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
      }}
    >
      {/* 🔥 HEADER */}
      <Text
        style={{
          color: "#fff",
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 15,
        }}
      >
        💳 My Transactions
      </Text>

      {/* 🔗 GO TO ORDERS */}
      <TouchableOpacity
        onPress={() => router.push("/orders")}
        style={{
          backgroundColor: "#ff3f6c",
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          View Orders →
        </Text>
      </TouchableOpacity>

      {/* 📦 TRANSACTIONS */}
      {data.length === 0 ? (
        <Text style={{ color: "#aaa" }}>No transactions yet</Text>
      ) : (
        data.map((item: any) => (
          <View
            key={item._id}
            style={{
              backgroundColor: "#1e1e1e",
              padding: 15,
              borderRadius: 12,
              marginBottom: 15,
            }}
          >
            {/* 💰 AMOUNT */}
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ₹{item.amount}
            </Text>

            {/* 📊 STATUS */}
            <Text
              style={{
                color:
                  item.status === "success"
                    ? "#00e676"
                    : item.status === "failed"
                    ? "#ff5252"
                    : "#ffb300",
                marginTop: 5,
              }}
            >
              Status: {item.status}
            </Text>

            {/* 💳 METHOD */}
            <Text style={{ color: "#bbb", marginTop: 5 }}>
              Method: {item.paymentMethod}
            </Text>

            {/* 🕒 DATE */}
            <Text style={{ color: "#777", marginTop: 5 }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>

            {/* 🔥 LOGS / TIMELINE */}
            {item.logs && item.logs.length > 0 && (
              <View
                style={{
                  marginTop: 10,
                  paddingLeft: 10,
                  borderLeftWidth: 2,
                  borderLeftColor: "#ff3f6c",
                }}
              >
                {item.logs.map((log: any, index: number) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 13 }}>
                      • {log.status} - {log.message}
                    </Text>
                    <Text
                      style={{
                        color: "#888",
                        fontSize: 11,
                      }}
                    >
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