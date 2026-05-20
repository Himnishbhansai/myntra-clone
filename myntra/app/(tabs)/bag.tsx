import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react-native";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";

export default function Bag() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // ✅ NEW STATES
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const updateQuantity = async (id: string, newQty: number) => {
  try {
    if (newQty < 1) return;

    await axios.put(
      `https://myntra-clone-7tse.onrender.com/bag/quantity/${id}`,
      { quantity: newQty }
    );

    fetchCart(); // refresh UI
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  // ✅ UPDATED FETCH
  const fetchCart = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(
        `https://myntra-clone-7tse.onrender.com/bag/${user._id}`
      );

      const active = res.data.filter((item: any) => !item.savedForLater);
      const saved = res.data.filter((item: any) => item.savedForLater);

      setCartItems(active);
      setSavedItems(saved);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MOVE FUNCTION
  const moveItem = async (id: string, value: boolean) => {
    try {
      await axios.put(
        `https://myntra-clone-7tse.onrender.com/bag/move/${id}`,
        { savedForLater: value }
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(
        `https://myntra-clone-7tse.onrender.com/bag/${itemid}`
      );
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ TOTAL ONLY ACTIVE ITEMS
  const total = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>

        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>
            Please login to view your bag
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
        <Text style={styles.headerTitle}>Shopping Bag</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 🟢 ACTIVE CART */}
        <Text style={styles.sectionTitle}>My Cart</Text>

        {cartItems.map((item) => (
          <View key={item._id} style={styles.bagItem}>
            <Image
              source={{ uri: item.productId.images[0] }}
              style={styles.itemImage}
            />

            <View style={styles.itemInfo}>
              <Text style={styles.brandName}>
                {item.productId.brand}
              </Text>

              <Text style={styles.itemName}>
                {item.productId.name}
              </Text>

              <Text style={styles.itemSize}>
                Size: {item.size}
              </Text>

              <Text style={styles.itemPrice}>
                ₹{item.productId.price}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  <Minus size={20} color={theme.text} />
                </TouchableOpacity>

                <Text style={styles.quantity}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Plus size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* ✅ MOVE TO SAVED */}
              <TouchableOpacity
                onPress={() => moveItem(item._id, true)}
              >
                <Text style={{ color: theme.primary, marginTop: 5 }}>
                  Save for later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 🟡 SAVED ITEMS */}
        {savedItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Saved for Later</Text>

            {savedItems.map((item) => (
              <View key={item._id} style={styles.bagItem}>
                <Image
                  source={{ uri: item.productId.images[0] }}
                  style={styles.itemImage}
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.productId.name}
                  </Text>

                  {/* ✅ MOVE BACK */}
                  <TouchableOpacity
                    onPress={() => moveItem(item._id, false)}
                  >
                    <Text style={{ color: theme.primary }}>
                      Move to Cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ✅ FOOTER */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>
            PLACE ORDER
          </Text>
        </TouchableOpacity>
      </View>
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
      backgroundColor: theme.card,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
      marginTop: 10,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyTitle: {
      fontSize: 18,
      marginVertical: 20,
      color: theme.text,
    },
    loginButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
    },
    loginButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    bagItem: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 10,
      marginBottom: 15,
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
      color: theme.secondaryText,
    },
    itemName: {
      color: theme.text,
      fontSize: 16,
    },
    itemSize: {
      color: theme.secondaryText,
    },
    itemPrice: {
      color: theme.text,
      fontWeight: "bold",
      marginTop: 5,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    quantityButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
    },
    quantity: {
      color: theme.text,
      marginHorizontal: 15,
    },
    removeButton: {
      marginLeft: "auto",
    },
    footer: {
      padding: 15,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderColor: theme.border,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    totalLabel: {
      color: theme.text,
    },
    totalAmount: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 18,
    },
    checkoutButton: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    checkoutButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });