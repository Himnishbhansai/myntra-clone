import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
} from "lucide-react-native";
import React from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Orders() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#fff",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#3e3e3e",
    subText: isDark ? "#aaa" : "#666",
    border: isDark ? "#333" : "#f0f0f0",
    input: isDark ? "#2a2a2a" : "#f5f5f5",
    greenBg: isDark ? "#143d26" : "#e6f4ea",
  };

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [orders, setorder] = useState<any>(null);

  useEffect(() => {
    const fetchorder = async () => {
      if (user) {
        try {
          setIsLoading(true);

          const product = await axios.get(
            `https://myntra-clone-7tse.onrender.com/order/user/${user._id}`
          );

          setorder(product.data);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchorder();
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!orders) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.text }}>
          Order not found
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text },
          ]}
        >
          My Orders
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order: any) => (
          <View
            key={order._id}
            style={[
              styles.orderCard,
              { backgroundColor: colors.card },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.orderHeader,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => toggleOrderDetails(order._id)}
            >
              <View>
                <Text
                  style={[
                    styles.orderId,
                    { color: colors.text },
                  ]}
                >
                  Order #{order._id}
                </Text>

                <Text
                  style={[
                    styles.orderDate,
                    { color: colors.subText },
                  ]}
                >
                  {order.date}
                </Text>
              </View>

              <View
                style={[
                  styles.statusContainer,
                  { backgroundColor: colors.greenBg },
                ]}
              >
                <Package size={16} color="#00b852" />
                <Text style={styles.orderStatus}>
                  {order.status}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.itemsContainer}>
              {order.items.map((item: any) => (
                <View key={item._id} style={styles.orderItem}>
                  <Image
                    source={{
                      uri: item.productId.images[0],
                    }}
                    style={styles.itemImage}
                  />

                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.brandName,
                        { color: colors.subText },
                      ]}
                    >
                      {item.productId.brand}
                    </Text>

                    <Text
                      style={[
                        styles.itemName,
                        { color: colors.text },
                      ]}
                    >
                      {item.productId.name}
                    </Text>

                    <Text
                      style={[
                        styles.itemPrice,
                        { color: colors.text },
                      ]}
                    >
                      ₹{item.productId.price}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {expandedOrder === order._id && (
              <View
                style={[
                  styles.orderDetails,
                  { borderTopColor: colors.border },
                ]}
              >
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <MapPin
                      size={20}
                      color={colors.text}
                    />
                    <Text
                      style={[
                        styles.detailTitle,
                        { color: colors.text },
                      ]}
                    >
                      Shipping Address
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.detailText,
                      { color: colors.subText },
                    ]}
                  >
                    {order.shippingAddress}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <CreditCard
                      size={20}
                      color={colors.text}
                    />
                    <Text
                      style={[
                        styles.detailTitle,
                        { color: colors.text },
                      ]}
                    >
                      Payment Method
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.detailText,
                      { color: colors.subText },
                    ]}
                  >
                    {order.paymentMethod}
                  </Text>
                </View>

                {order.tracking && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Truck
                        size={20}
                        color={colors.text}
                      />

                      <Text
                        style={[
                          styles.detailTitle,
                          { color: colors.text },
                        ]}
                      >
                        Tracking Information
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.detailText,
                        { color: colors.subText },
                      ]}
                    >
                      Tracking: {order.tracking.number}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View
              style={[
                styles.orderFooter,
                { borderTopColor: colors.border },
              ]}
            >
              <View style={styles.totalContainer}>
                <Text
                  style={[
                    styles.totalLabel,
                    { color: colors.subText },
                  ]}
                >
                  Order Total
                </Text>

                <Text
                  style={[
                    styles.totalAmount,
                    { color: colors.text },
                  ]}
                >
                  ₹{order.total}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() =>
                  toggleOrderDetails(order._id)
                }
              >
                <Text style={styles.detailsButtonText}>
                  {expandedOrder === order._id
                    ? "Hide Details"
                    : "View Details"}
                </Text>

                <ChevronRight
                  size={20}
                  color="#ff3f6c"
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    padding: 15,
  },

  orderCard: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 5,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },

  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },

  orderDate: {
    fontSize: 14,
  },

  statusContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: "center",
  },

  orderStatus: {
    color: "#00b852",
    marginLeft: 5,
  },

  itemsContainer: {
    padding: 15,
  },

  orderItem: {
    flexDirection: "row",
    marginBottom: 15,
  },

  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 5,
  },

  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },

  brandName: {
    fontSize: 14,
  },

  itemName: {
    fontSize: 16,
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },

  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
  },

  detailSection: {
    marginBottom: 20,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  detailTitle: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },

  detailText: {
    fontSize: 14,
  },

  orderFooter: {
    padding: 15,
    borderTopWidth: 1,
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  totalLabel: {
    fontSize: 16,
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },

  detailsButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  detailsButtonText: {
    color: "#ff3f6c",
    marginRight: 5,
    fontSize: 16,
  },
});