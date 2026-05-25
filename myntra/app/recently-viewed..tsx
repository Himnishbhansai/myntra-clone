import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { getRecentlyViewed } from "@/utils/recentlyViewed";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function RecentlyViewed() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [items, setItems] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getRecentlyViewed();
    setItems(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Viewed</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {items.map((item: any) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "48%",
      marginBottom: 15,
    },
    image: {
      width: "100%",
      height: 180,
      borderRadius: 10,
    },
    brand: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    name: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    price: {
      fontSize: 14,
      color: theme.primary,
    },
  });