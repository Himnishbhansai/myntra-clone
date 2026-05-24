import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();

  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);

        const bag = await axios.get(
          `https://myntra-clone-7tse.onrender.com/wishlist/${user._id}`
        );

        setwishlist(bag.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(
        `https://myntra-clone-7tse.onrender.com/wishlist/${itemid}`
      );

      fetchproduct();
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Wishlist
          </Text>
        </View>

        <View style={styles.emptyState}>
          <Heart
            size={64}
            color={"#ff3f6c"}
          />

          <Text style={styles.emptyTitle}>
            Please login to view your wishlist
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() =>
              router.push("/login")
            }
          >
            <Text
              style={
                styles.loginButtonText
              }
            >
              LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={
          styles.loaderContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={"#ff3f6c"}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Wishlist
        </Text>
      </View>

      <ScrollView
        style={styles.content}
      >
        {wishlist?.map((item: any) => {
  if (!item.productId) return null; // ✅ IMPORTANT FIX

  return (
    <TouchableOpacity
      key={item._id}
      onPress={() => router.push(`/product/${item.productId._id}`)}
    >
      <Image
        source={{ uri: item.productId.images?.[0] }} // ✅ safe access
        style={{ width: 150, height: 200 }}
      />

      <Text>{item.productId.brand}</Text>
      <Text>{item.productId.name}</Text>
    </TouchableOpacity>
  );
})}
      </ScrollView>
    </View>
  );
}

const createStyles = (
  theme: any
) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        theme.background,
    },

    container: {
      flex: 1,
      backgroundColor:
        theme.background,
    },

    header: {
      padding: 15,
      paddingTop: 50,
      backgroundColor:
        theme.background,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border,
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

    emptyState: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 20,
    },

    emptyTitle: {
      fontSize: 18,
      color: theme.text,
      marginTop: 20,
      marginBottom: 20,
      textAlign: "center",
    },

    loginButton: {
      backgroundColor:
        "#ff3f6c",

      paddingHorizontal: 40,

      paddingVertical: 15,

      borderRadius: 10,
    },

    loginButtonText: {
      color: "#fff",

      fontSize: 16,

      fontWeight: "bold",
    },

    wishlistItem: {
      flexDirection: "row",

      backgroundColor:
        theme.card,

      borderRadius: 10,

      marginBottom: 15,

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.1,

      shadowRadius: 3.84,

      elevation: 5,

      overflow: "hidden",
    },

    itemImage: {
      width: 100,

      height: 120,
    },

    itemInfo: {
      flex: 1,

      padding: 15,
    },

    brandName: {
      fontSize: 14,

      color:
        theme.secondaryText,

      marginBottom: 5,
    },

    itemName: {
      fontSize: 16,

      color: theme.text,

      marginBottom: 10,
    },

    priceContainer: {
      flexDirection: "row",

      alignItems:
        "center",
    },

    price: {
      fontSize: 16,

      fontWeight: "bold",

      color: theme.text,

      marginRight: 10,
    },

    discount: {
      fontSize: 14,

      color:
        "#ff3f6c",
    },

    removeButton: {
      padding: 15,

      justifyContent:
        "center",
    },
  });