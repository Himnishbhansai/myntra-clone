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

import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
} from "lucide-react-native";

import React, {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import axios from "axios";

import { useTheme } from "@/context/ThemeContext";

export default function Bag() {
  const router = useRouter();

  const { theme } =
    useTheme();

  const styles =
    createStyles(theme);

  const [isLoading,
    setIsLoading] =
    useState(false);

  const { user } =
    useAuth();

  const [bag,
    setbag] =
    useState<any>(null);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct =
    async () => {
      if (user) {
        try {
          setIsLoading(
            true
          );

          const bag =
            await axios.get(
              `https://myntra-clone-7tse.onrender.com/bag/${user._id}`
            );

          setbag(
            bag.data
          );
        } catch (
          error
        ) {
          console.log(
            error
          );
        } finally {
          setIsLoading(
            false
          );
        }
      }
    };

  if (!user) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Shopping Bag
          </Text>
        </View>

        <View
          style={
            styles.emptyState
          }
        >
          <ShoppingBag
            size={64}
            color={
              theme.primary
            }
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            Please login
            to view
            your bag
          </Text>

          <TouchableOpacity
            style={
              styles.loginButton
            }
            onPress={() =>
              router.push(
                "/login"
              )
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
          color={
            theme.primary
          }
        />
      </View>
    );
  }

  const total =
    bag?.reduce(
      (
        sum: any,
        item: any
      ) =>
        sum +
        item
          .productId
          .price *
          item.quantity,
      0
    );

  const handledelete =
    async (
      itemid: any
    ) => {
      try {
        await axios.delete(
          `https://myntra-clone-7tse.onrender.com/bag/${itemid}`
        );

        fetchproduct();
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.header
        }
      >
        <Text
          style={
            styles.headerTitle
          }
        >
          Shopping Bag
        </Text>
      </View>

      <ScrollView
        style={
          styles.content
        }
      >
        {bag?.map(
          (
            item: any
          ) => (
            <View
              key={
                item._id
              }
              style={
                styles.bagItem
              }
            >
              <Image
                source={{
                  uri:
                    item
                      .productId
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
                    item
                      .productId
                      .brand
                  }
                </Text>

                <Text
                  style={
                    styles.itemName
                  }
                >
                  {
                    item
                      .productId
                      .name
                  }
                </Text>

                <Text
                  style={
                    styles.itemSize
                  }
                >
                  Size:
                  {
                    item.size
                  }
                </Text>

                <Text
                  style={
                    styles.itemPrice
                  }
                >
                  ₹
                  {
                    item
                      .productId
                      .price
                  }
                </Text>

                <View
                  style={
                    styles.quantityContainer
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.quantityButton
                    }
                  >
                    <Minus
                      size={
                        20
                      }
                      color={
                        theme.text
                      }
                    />
                  </TouchableOpacity>

                  <Text
                    style={
                      styles.quantity
                    }
                  >
                    {
                      item.quantity
                    }
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.quantityButton
                    }
                  >
                    <Plus
                      size={
                        20
                      }
                      color={
                        theme.text
                      }
                    />
                  </TouchableOpacity>

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
                      size={
                        20
                      }
                      color={
                        theme.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        )}
      </ScrollView>

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.totalContainer
          }
        >
          <Text
            style={
              styles.totalLabel
            }
          >
            Total
            Amount
          </Text>

          <Text
            style={
              styles.totalAmount
            }
          >
            ₹{total}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.checkoutButton
          }
          onPress={() =>
            router.push(
              "/checkout"
            )
          }
        >
          <Text
            style={
              styles.checkoutButtonText
            }
          >
            PLACE
            ORDER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles =
  (theme: any) =>
    StyleSheet.create({
      loaderContainer:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:
          theme.background,
      },

      container:{
        flex:1,
        backgroundColor:
          theme.background,
      },

      header:{
        padding:15,
        paddingTop:50,
        backgroundColor:
          theme.card,
        borderBottomWidth:1,
        borderBottomColor:
          theme.border,
      },

      headerTitle:{
        fontSize:24,
        fontWeight:"bold",
        color:
          theme.text,
      },

      content:{
        flex:1,
        padding:15,
      },

      emptyState:{
        flex:1,
        justifyContent:
          "center",
        alignItems:
          "center",
      },

      emptyTitle:{
        fontSize:18,
        marginVertical:20,
        color:
          theme.text,
      },

      loginButton:{
        backgroundColor:
          theme.primary,
        paddingHorizontal:40,
        paddingVertical:15,
        borderRadius:10,
      },

      loginButtonText:{
        color:"#fff",
        fontWeight:"bold",
      },

      bagItem:{
        flexDirection:"row",
        backgroundColor:
          theme.card,
        borderRadius:10,
        marginBottom:15,
        elevation:4,
        overflow:"hidden",
      },

      itemImage:{
        width:100,
        height:120,
      },

      itemInfo:{
        flex:1,
        padding:15,
      },

      brandName:{
        color:
          theme.secondaryText,
      },

      itemName:{
        color:
          theme.text,
        fontSize:16,
      },

      itemSize:{
        color:
          theme.secondaryText,
      },

      itemPrice:{
        color:
          theme.text,
        fontWeight:"bold",
        marginTop:5,
      },

      quantityContainer:{
        flexDirection:"row",
        alignItems:"center",
        marginTop:10,
      },

      quantityButton:{
        width:30,
        height:30,
        borderRadius:15,
        backgroundColor:
          theme.background,
        justifyContent:"center",
        alignItems:"center",
      },

      quantity:{
        color:
          theme.text,
        marginHorizontal:15,
      },

      removeButton:{
        marginLeft:"auto",
      },

      footer:{
        padding:15,
        backgroundColor:
          theme.card,
        borderTopWidth:1,
        borderColor:
          theme.border,
      },

      totalContainer:{
        flexDirection:"row",
        justifyContent:
          "space-between",
        marginBottom:15,
      },

      totalLabel:{
        color:
          theme.text,
      },

      totalAmount:{
        color:
          theme.text,
        fontWeight:"bold",
        fontSize:18,
      },

      checkoutButton:{
        backgroundColor:
          theme.primary,
        padding:15,
        borderRadius:10,
        alignItems:"center",
      },

      checkoutButtonText:{
        color:"#fff",
        fontWeight:"bold",
      },
    });