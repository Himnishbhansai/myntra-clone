import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Transactions() {
  const { user } = useAuth();
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
        console.log(res.data)
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <ScrollView style={{ padding: 20 }}>
      {data.map((item: any) => (
        <View
          key={item._id}
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text>💰 ₹{item.amount}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Method: {item.paymentMethod}</Text>
          <Text>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}