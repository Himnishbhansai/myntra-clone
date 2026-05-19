import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";

export default function TabTwoScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedSubcategory,
    setSelectedSubcategory,
  ] =
    useState<string | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(false);

  const [categories, setcategories] =
    useState<any>(null);

  useEffect(() => {
    const fetchproduct =
      async () => {
        try {
          setIsLoading(true);

          const cat =
            await axios.get(
              "https://myntra-clone-7tse.onrender.com/category"
            );

          setcategories(
            cat.data
          );
        } catch (error) {
          console.log(
            error
          );
        } finally {
          setIsLoading(
            false
          );
        }
      };

    fetchproduct();
  }, []);

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

  if (!categories) {
    return (
      <View
        style={
          styles.container
        }
      >
        <Text
          style={{
            color:
              theme.text,
          }}
        >
          Categories not found
        </Text>
      </View>
    );
  }

  const handleSearch = (
    query: string
  ) => {
    setSearchQuery(
      query
    );

    setSelectedCategory(
      null
    );

    setSelectedSubcategory(
      null
    );
  };

  const clearSearch =
    () => {
      setSearchQuery(
        ""
      );

      setSelectedCategory(
        null
      );

      setSelectedSubcategory(
        null
      );
    };

  const handleCategorySelect =
    (
      categoryId: string
    ) => {
      setSelectedCategory(
        categoryId
      );

      setSelectedSubcategory(
        null
      );

      setSearchQuery("");
    };

  const handleSubcategorySelect =
    (
      subcategoryId: string
    ) => {
      setSelectedSubcategory(
        subcategoryId
      );

      setSearchQuery("");
    };

  const filtercategories =
    categories?.filter(
      (
        category: any
      ) =>
        category.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        category.subcategory.some(
          (
            subcategory: any
          ) =>
            subcategory
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
        ) ||
        category.productId.some(
          (
            product: any
          ) =>
            product.name
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              ) ||
            product.brand
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
        )
    );

  const selectedcategorydata =
    selectedCategory
      ? categories?.find(
          (
            cat: any
          ) =>
            cat._id ===
            selectedCategory
        )
      : null;

  const renderProducts = (
    products: any
  ) => {
    return products?.map(
      (
        product: any
      ) => (
        <TouchableOpacity
          key={
            product._id
          }
          style={
            styles.productCard
          }
          onPress={() =>
            router.push(
              `/product/${product._id}`
            )
          }
        >
          <Image
            source={{
              uri:
                product
                  .images[0],
            }}
            style={
              styles.productImage
            }
          />

          <View
            style={
              styles.productInfo
            }
          >
            <Text
              style={
                styles.brandName
              }
            >
              {
                product.brand
              }
            </Text>

            <Text
              style={
                styles.productName
              }
            >
              {
                product.name
              }
            </Text>

            <View
              style={
                styles.priceRow
              }
            >
              <Text
                style={
                  styles.price
                }
              >
                ₹
                {
                  product.price
                }
              </Text>

              <Text
                style={
                  styles.discount
                }
              >
                {
                  product.discount
                }
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )
    );
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
          Categories
        </Text>
      </View>

      <View
        style={
          styles.searchContainer
        }
      >
        <View
          style={
            styles.searchInputContainer
          }
        >
          <Search
            size={20}
            color={
              theme.secondaryText
            }
            style={
              styles.searchIcon
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search products..."
            placeholderTextColor={
              theme.secondaryText
            }
            value={
              searchQuery
            }
            onChangeText={
              handleSearch
            }
          />

          {searchQuery !==
            "" && (
            <TouchableOpacity
              onPress={
                clearSearch
              }
            >
              <X
                size={
                  20
                }
                color={
                  theme.secondaryText
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={
          styles.content
        }
      >
        {!selectedCategory && (
          <View
            style={
              styles.categoriesGrid
            }
          >
            {filtercategories?.map(
              (
                category: any
              ) => (
                <TouchableOpacity
                  key={
                    category._id
                  }
                  style={
                    styles.categoryCard
                  }
                  onPress={() =>
                    handleCategorySelect(
                      category._id
                    )
                  }
                >
                  <Image
                    source={{
                      uri:
                        category.image,
                    }}
                    style={
                      styles.categoryImage
                    }
                  />

                  <View
                    style={
                      styles.categoryInfo
                    }
                  >
                    <Text
                      style={
                        styles.categoryName
                      }
                    >
                      {
                        category.name
                      }
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={
                        false
                      }
                    >
                      <View
                        style={
                          styles.subcategories
                        }
                      >
                        {category?.subcategory?.map(
                          (
                            sub: any,
                            index: any
                          ) => (
                            <TouchableOpacity
                              key={
                                index
                              }
                              style={
                                styles.subcategoryTag
                              }
                            >
                              <Text
                                style={
                                  styles.subcategoryText
                                }
                              >
                                {
                                  sub
                                }
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {selectedcategorydata && (
          <View
            style={
              styles.categoryDetail
            }
          >
            <TouchableOpacity
              onPress={() =>
                setSelectedCategory(
                  null
                )
              }
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ← Back
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.categoryTitle
              }
            >
              {
                selectedcategorydata.name
              }
            </Text>

            <View
              style={
                styles.productsGrid
              }
            >
              {renderProducts(
                selectedcategorydata.productId
              )}
            </View>
          </View>
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
      fontWeight:
        "bold",
      color:
        theme.text,
    },

    searchContainer: {
      padding: 15,
      backgroundColor:
        theme.background,
    },

    searchInputContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        theme.card,
      borderRadius: 10,
      padding: 10,
    },

    searchIcon: {
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      color:
        theme.text,
    },

    content: {
      flex: 1,
    },

    categoriesGrid: {
      padding: 15,
    },

    categoryCard: {
      backgroundColor:
        theme.card,
      borderRadius: 12,
      marginBottom: 15,
      overflow:
        "hidden",
    },

    categoryImage: {
      width: "100%",
      height: 150,
    },

    categoryInfo: {
      padding: 15,
    },

    categoryName: {
      fontSize: 18,
      fontWeight:
        "bold",
      color:
        theme.text,
      marginBottom: 10,
    },

    subcategories: {
      flexDirection:
        "row",
    },

    subcategoryTag: {
      backgroundColor:
        theme.background,
      borderColor:
        theme.border,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginRight: 8,
    },

    subcategoryText: {
      color:
        theme.secondaryText,
    },

    categoryDetail: {
      padding: 15,
    },

    backButtonText: {
      color:
        theme.primary,
      marginBottom: 10,
      fontSize: 16,
    },

    categoryTitle: {
      color:
        theme.text,
      fontSize: 26,
      fontWeight:
        "bold",
      marginBottom: 20,
    },

    productsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "space-between",
    },

    productCard: {
      width: "48%",
      backgroundColor:
        theme.card,
      borderRadius: 10,
      marginBottom: 15,
      overflow:
        "hidden",
    },

    productImage: {
      width: "100%",
      height: 200,
    },

    productInfo: {
      padding: 10,
    },

    brandName: {
      color:
        theme.secondaryText,
    },

    productName: {
      color:
        theme.text,
      marginVertical: 5,
    },

    priceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    price: {
      fontWeight:
        "bold",
      color:
        theme.text,
      marginRight: 8,
    },

    discount: {
      color:
        theme.primary,
    },
  });