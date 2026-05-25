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

        const res = await axios.get(
          `https://myntra-clone-7tse.onrender.com/wishlist/${user._id}`
        );

        setwishlist(res.data);
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
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>

        <View style={styles.emptyState}>
          <Heart size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>
            Please login to view your wishlist
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
      </View>

      <ScrollView style={styles.content}>
        {wishlist?.map((item: any) => {
          if (!item.productId) return null;

          return (
            <View key={item._id} style={styles.wishlistItem}>
              
              {/* IMAGE */}
              <TouchableOpacity
                onPress={() =>
                  router.push(`/product/${item.productId._id}`)
                }
              >
                <Image
                  source={{ uri: item.productId.images?.[0] }}
                  style={styles.itemImage}
                />
              </TouchableOpacity>

              {/* INFO */}
              <View style={styles.itemInfo}>
                <Text style={styles.brandName}>
                  {item.productId.brand}
                </Text>

                <Text style={styles.itemName}>
                  {item.productId.name}
                </Text>

                <Text style={styles.price}>
                  ₹{item.productId.price}
                </Text>

                {/* BUTTONS */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handledelete(item._id)}
                  >
                    <Trash2 color={theme.error} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      padding: 15,
      paddingTop: 50,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },

    content: {
      padding: 15,
    },

    wishlistItem: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 10,
      marginBottom: 15,
      overflow: "hidden",
      elevation: 3,
    },

    itemImage: {
      width: 110,
      height: 140,
    },

    itemInfo: {
      flex: 1,
      padding: 12,
      justifyContent: "space-between",
    },

    brandName: {
      fontSize: 13,
      color: theme.secondaryText,
    },

    itemName: {
      fontSize: 15,
      color: theme.text,
      marginVertical: 5,
    },

    price: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    },

    bagButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },

    bagText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "bold",
    },

    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    emptyTitle: {
      fontSize: 18,
      color: theme.text,
      marginTop: 20,
      textAlign: "center",
    },

    loginButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
      marginTop: 20,
    },

    loginButtonText: {
      color: theme.text,
      fontWeight: "bold",
    },
  });