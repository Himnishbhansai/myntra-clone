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

  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<any>(null);

  useEffect(() => {
    fetchProduct();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (product?.images?.length > 1) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [product, currentImageIndex]);

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

  const startAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }

    autoScrollTimer.current = setInterval(() => {
      if (!product?.images) return;

      const nextIndex =
        (currentImageIndex + 1) %
        product.images.length;

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
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(
        `https://myntra-clone-7tse.onrender.com/wishlist`,
        {
          userId: user._id,
          productId: id,
        }
      );

      setIsWishlist(true);

      Alert.alert(
        "Added",
        "Product added to wishlist"
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      Alert.alert(
        "Select Size",
        "Please select a size"
      );
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

      Alert.alert(
        "Success",
        "Added to bag"
      );

      router.push("/bag");
    } catch (error) {
      console.log(error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loaderContainer,
          {
            backgroundColor:
              isDark ? "#111" : "#fff",
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#ff3f6c"
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              isDark ? "#111" : "#fff",
          },
        ]}
      >
        <Text
          style={{
            color: isDark
              ? "#fff"
              : "#000",
          }}
        >
          Product not found
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            isDark ? "#111" : "#fff",
        },
      ]}
    >
      <ScrollView>

        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images?.map(
              (
                image: string,
                index: number
              ) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={[
                    styles.productImage,
                    { width },
                  ]}
                />
              )
            )}
          </ScrollView>

          <View style={styles.pagination}>
            {product.images?.map(
              (_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex ===
                      index &&
                      styles.paginationDotActive,
                  ]}
                />
              )
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.brand,
                  {
                    color: isDark
                      ? "#aaa"
                      : "#666",
                  },
                ]}
              >
                {product.brand}
              </Text>

              <Text
                style={[
                  styles.name,
                  {
                    color: isDark
                      ? "#fff"
                      : "#000",
                  },
                ]}
              >
                {product.name}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleAddWishlist}
            >
              <Heart
                size={25}
                color={
                  isWishlist
                    ? "#ff3f6c"
                    : "#ccc"
                }
                fill={
                  isWishlist
                    ? "#ff3f6c"
                    : "none"
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.price,
                {
                  color: isDark
                    ? "#fff"
                    : "#000",
                },
              ]}
            >
              ₹{product.price}
            </Text>

            <Text style={styles.discount}>
              {product.discount}
            </Text>
          </View>

          <Text
            style={[
              styles.description,
              {
                color: isDark
                  ? "#bbb"
                  : "#666",
              },
            ]}
          >
            {product.description}
          </Text>

          <View style={styles.sizeSection}>
            <Text
              style={[
                styles.sizeTitle,
                {
                  color: isDark
                    ? "#fff"
                    : "#000",
                },
              ]}
            >
              Select Size
            </Text>

            <View style={styles.sizeGrid}>
              {product.sizes?.map(
                (size: string) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      {
                        borderColor:
                          isDark
                            ? "#444"
                            : "#ddd",
                      },
                      selectedSize ===
                        size &&
                        styles.selectedSize,
                    ]}
                    onPress={() =>
                      setSelectedSize(size)
                    }
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        {
                          color: isDark
                            ? "#fff"
                            : "#000",
                        },
                        selectedSize ===
                          size &&
                          styles.selectedSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              isDark ? "#111" : "#fff",
            borderColor:
              isDark
                ? "#222"
                : "#eee",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
          disabled={buttonLoading}
        >
          {buttonLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ShoppingBag
                size={20}
                color="#fff"
              />

              <Text
                style={styles.addToBagText}
              >
                ADD TO BAG
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
container:{
flex:1
},

loaderContainer:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

carouselContainer:{
position:"relative"
},

productImage:{
height:400
},

pagination:{
position:"absolute",
bottom:20,
width:"100%",
flexDirection:"row",
justifyContent:"center"
},

paginationDot:{
width:8,
height:8,
borderRadius:5,
backgroundColor:"#bbb",
marginHorizontal:5
},

paginationDotActive:{
backgroundColor:"#fff",
width:10,
height:10
},

content:{
padding:20
},

header:{
flexDirection:"row",
justifyContent:"space-between"
},

brand:{},

name:{
fontSize:22,
fontWeight:"bold",
marginTop:4
},

wishlistButton:{
padding:10
},

priceContainer:{
flexDirection:"row",
marginTop:15,
alignItems:"center"
},

price:{
fontSize:22,
fontWeight:"bold"
},

discount:{
marginLeft:10,
color:"#ff3f6c"
},

description:{
marginTop:20,
lineHeight:24
},

sizeSection:{
marginTop:25
},

sizeTitle:{
fontWeight:"bold",
marginBottom:15
},

sizeGrid:{
flexDirection:"row",
flexWrap:"wrap",
gap:10
},

sizeButton:{
width:55,
height:55,
borderRadius:30,
borderWidth:1,
justifyContent:"center",
alignItems:"center"
},

selectedSize:{
borderColor:"#ff3f6c",
backgroundColor:"#fff1f5"
},

sizeText:{
fontWeight:"600"
},

selectedSizeText:{
color:"#ff3f6c"
},

footer:{
padding:15,
borderTopWidth:1
},

addToBagButton:{
backgroundColor:"#ff3f6c",
padding:16,
borderRadius:12,
flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:10
},

addToBagText:{
color:"#fff",
fontWeight:"bold",
fontSize:16
}
});