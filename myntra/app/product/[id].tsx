import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [isWishlist, setIsWishlist] = useState(false);

  // 🔥 NEW
  const [recommended, setRecommended] = useState<any>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<any>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.images?.length > 1) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [product, currentImageIndex]);

  // 🔥 FETCH PRODUCT
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `https://myntra-clone-7tse.onrender.com/product/${id}`
      );
      setProduct(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 SAVE RECENT (backend)
  useEffect(() => {
    const addRecent = async () => {
      if (!user || !id) return;

      try {
        await axios.post(
          "https://myntra-clone-7tse.onrender.com/recent",
          {
            userId: user._id,
            productId: id,
          }
        );
      } catch (err) {
        console.log(err);
      }
    };

    addRecent();
  }, [id, user]);

  // 🔥 FETCH RECOMMENDATIONS
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!id) return;

      try {
        const res = await axios.get(
          `https://myntra-clone-7tse.onrender.com/recommend/${id}`
        );
        setRecommended(res.data);
      } catch (err) {
        console.log("RECOMMEND ERROR:", err);
      }
    };

    fetchRecommendations();
  }, [id]);

  const startAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);

    autoScrollTimer.current = setInterval(() => {
      if (!product?.images) return;

      const nextIndex =
        (currentImageIndex + 1) % product.images.length;

      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setCurrentImageIndex(nextIndex);
    }, 3000);
  };

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const imageIndex = Math.round(x / width);
    setCurrentImageIndex(imageIndex);
    startAutoScroll();
  };

  const handleAddWishlist = async () => {
    if (!user) return router.push("/login");

    try {
      await axios.post(
        `https://myntra-clone-7tse.onrender.com/wishlist`,
        {
          userId: user._id,
          productId: id,
        }
      );

      setIsWishlist(true);
      Alert.alert("Added", "Product added to wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToBag = async () => {
    if (!user) return router.push("/login");

    if (!selectedSize) {
      Alert.alert("Select Size", "Please select a size");
      return;
    }

    try {
      setButtonLoading(true);

      await axios.post(
        `https://myntra-clone-7tse.onrender.com/bag`,
        {
          userId: user._id,
          productId: id,
          size: selectedSize,
          quantity: 1,
        }
      );

      Alert.alert("Success", "Added to bag");
      router.push("/bag");
    } catch (error) {
      console.log(error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 🔥 IMAGES */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
        >
          {product.images?.map((img: string, i: number) => (
            <Image key={i} source={{ uri: img }} style={{ width, height: 400 }} />
          ))}
        </ScrollView>

        {/* 🔥 DETAILS */}
        <View style={{ padding: 20 }}>
          <Text style={{ color: isDark ? "#aaa" : "#666" }}>
            {product.brand}
          </Text>

          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {product.name}
          </Text>

          <Text style={{ fontSize: 20, marginTop: 10 }}>
            ₹{product.price}{" "}
            <Text style={{ color: "#ff3f6c" }}>
              {product.discount}
            </Text>
          </Text>

          <Text style={{ marginTop: 15 }}>
            {product.description}
          </Text>

          {/* 🔥 SIZE */}
          <View style={{ marginTop: 20 }}>
            <Text>Select Size</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {product.sizes?.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.selectedSize,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 🔥 RECOMMENDATIONS */}
        {recommended?.length > 0 && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              You May Also Like
            </Text>

            <ScrollView horizontal>
              {recommended.map((item: any) => (
                <TouchableOpacity
                  key={item._id}
                  style={{ width: 140, marginRight: 15 }}
                  onPress={() =>
                    router.push(`/product/${item._id}`)
                  }
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 10,
                    }}
                  />
                  <Text>{item.brand}</Text>
                  <Text numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* 🔥 FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
        >
          <ShoppingBag size={20} color="#fff" />
          <Text style={styles.addToBagText}>ADD TO BAG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeButton: {
    borderWidth: 1,
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  selectedSize: {
    backgroundColor: "#ff3f6c",
  },
  footer: {
    padding: 15,
  },
  addToBagButton: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  addToBagText: {
    color: "#fff",
    fontWeight: "bold",
  },
});