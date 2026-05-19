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
            color={theme.primary}
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
          color={theme.primary}
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
        {wishlist?.map(
          (item: any) => (
            <View
              key={item._id}
              style={
                styles.wishlistItem
              }
            >
              <Image
                source={{
                  uri:
                    item.productId
                      .images[0],
                }}
                style={
                  styles.itemImage
                }
              />

              <View
                style={
                  styles.itemInfo
                }
              >
                <Text
                  style={
                    styles.brandName
                  }
                >
                  {
                    item.productId
                      .brand
                  }
                </Text>

                <Text
                  style={
                    styles.itemName
                  }
                >
                  {
                    item.productId
                      .name
                  }
                </Text>

                <View
                  style={
                    styles.priceContainer
                  }
                >
                  <Text
                    style={
                      styles.price
                    }
                  >
                    ₹
                    {
                      item
                        .productId
                        .price
                    }
                  </Text>

                  <Text
                    style={
                      styles.discount
                    }
                  >
                    {
                      item
                        .productId
                        .discount
                    }
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.removeButton
                }
                onPress={() =>
                  handledelete(
                    item._id
                  )
                }
              >
                <Trash2
                  size={24}
                  color={
                    theme.primary
                  }
                />
              </TouchableOpacity>
            </View>
          )
        )}
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
        theme.primary,

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
        theme.primary,
    },

    removeButton: {
      padding: 15,

      justifyContent:
        "center",
    },
  });