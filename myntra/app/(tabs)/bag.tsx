// 🔥 FULL FIXED BAG SCREEN

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
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // 🔥 MERGE DUPLICATES FUNCTION
  const mergeDuplicates = (items: any[]) => {
    const map = new Map();

    items.forEach((item) => {
      const key = item.productId?._id + "-" + item.size;

      if (map.has(key)) {
        map.get(key).quantity += item.quantity;
      } else {
        map.set(key, { ...item });
      }
    });

    return Array.from(map.values());
  };

  const fetchCart = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);

      const res = await axios.get(
        `https://myntra-clone-7tse.onrender.com/bag/${user._id}`
      );

      const active = res.data.filter((i: any) => !i.savedForLater);
      const saved = res.data.filter((i: any) => i.savedForLater);

      // 🔥 MERGE HERE
      setCartItems(mergeDuplicates(active));
      setSavedItems(mergeDuplicates(saved));
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchCart();
  }, [user]);

  // ✅ STATUS LOGIC
  const getStatus = (item: any) => {
    const product = item.productId;

    if (!product) return "Removed";

    if (product.stock !== undefined && item.quantity > product.stock) {
      return "Out of Stock";
    }

    if (
      item.priceAtAdd &&
      product.price &&
      product.price !== item.priceAtAdd
    ) {
      return "Price Changed";
    }

    return null;
  };

  // 🔥 SMART QUANTITY UPDATE
  const updateQuantity = async (item: any, newQty: number) => {
    if (newQty < 1) return;

    const stock = item.productId?.stock;

    // ❌ BLOCK API if exceeding stock (NO ERROR NOW)
    if (stock !== undefined && newQty > stock) {
      // just update UI by forcing re-render
      setCartItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, quantity: newQty } : i
        )
      );
      return;
    }

    try {
      await axios.put(
        `https://myntra-clone-7tse.onrender.com/bag/quantity/${item._id}`,
        { quantity: newQty }
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

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

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://myntra-clone-7tse.onrender.com/bag/${id}`
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.priceAtAdd || item.productId?.price || 0) *
        item.quantity),
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
        {cartItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Cart</Text>

            {cartItems.map((item) => {
              const status = getStatus(item);

              return (
                <View key={item._id} style={styles.bagItem}>
                  <Image
                    source={{ uri: item.productId?.images?.[0] }}
                    style={styles.itemImage}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.brandName}>
                      {item.productId?.brand}
                    </Text>

                    <Text style={styles.itemName}>
                      {item.productId?.name || "Product removed"}
                    </Text>

                    <Text style={styles.itemSize}>
                      Size: {item.size}
                    </Text>

                    <Text style={styles.itemPrice}>
                      ₹
                      {item.priceAtAdd ||
                        item.productId?.price}
                    </Text>

                    {/* 🔥 STATUS */}
                    {status && (
                      <Text style={{ color: "red", fontSize: 12 }}>
                        {status}
                      </Text>
                    )}

                    {/* 🔥 ALWAYS ALLOW - BUTTON */}
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateQuantity(item, item.quantity - 1)
                        }
                      >
                        <Minus size={20} color={theme.text} />
                      </TouchableOpacity>

                      <Text style={styles.quantity}>
                        {item.quantity}
                      </Text>

                      {/* 🔥 BLOCK + ONLY */}
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateQuantity(item, item.quantity + 1)
                        }
                      >
                        <Plus size={20} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => moveItem(item._id, true)}
                    >
                      <Text style={{ color: theme.primary }}>
                        Save for later
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => handleDelete(item._id)}
                  >
                    <Trash2 size={22} color="red" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            Total Amount
          </Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
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
    },
    bagItem: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 10,
      marginBottom: 15,
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
    footer: {
      padding: 15,
      backgroundColor: theme.card,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      marginTop: 10,
    },
    checkoutButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });