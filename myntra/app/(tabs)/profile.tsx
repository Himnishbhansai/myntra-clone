import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";

import { useRouter } from "expo-router";

import {
  User,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

import React from "react";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const {
    theme,
    mode,
    setMode,
    accent,
    setAccent,
  } = useTheme();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const themeModes = [
    "light",
    "system",
    "dark",
  ];

  const activeIndex =
    themeModes.indexOf(mode);

  const sliderWidth =
    (width - 60) / 3;

  const dynamicStyles =
    createStyles(
      theme,
      sliderWidth
    );

  if (!user) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>
            Profile
          </Text>
        </View>

        <View style={dynamicStyles.emptyState}>
          <User
            size={64}
            color={theme.primary}
          />

          <Text
            style={
              dynamicStyles.emptyTitle
            }
          >
            Please login to view your profile
          </Text>

          <TouchableOpacity
            style={[
              dynamicStyles.loginButton,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
            onPress={() =>
              router.push("/login")
            }
          >
            <Text
              style={
                dynamicStyles.loginButtonText
              }
            >
              LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={dynamicStyles.content}
      >
        <View style={dynamicStyles.userInfo}>
          <View
            style={[
              dynamicStyles.avatar,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <User
              size={40}
              color="#fff"
            />
          </View>

          <View
            style={
              dynamicStyles.userDetails
            }
          >
            <Text
              style={
                dynamicStyles.userName
              }
            >
              {user.name}
            </Text>

            <Text
              style={
                dynamicStyles.userEmail
              }
            >
              {user.email}
            </Text>
          </View>
        </View>

        <View
          style={
            dynamicStyles.themeCard
          }
        >
          <Text
            style={
              dynamicStyles.sectionTitle
            }
          >
            Theme
          </Text>

          <View
            style={
              dynamicStyles.toggleContainer
            }
          >
            <View
              style={[
                dynamicStyles.slider,
                {
                  transform: [
                    {
                      translateX:
                        activeIndex *
                        sliderWidth,
                    },
                  ],
                  backgroundColor:
                    theme.primary,
                },
              ]}
            />

            {themeModes.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={
                    dynamicStyles.toggleItem
                  }
                  onPress={() =>
                    setMode(
                      item as any
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        mode === item
                          ? "#fff"
                          : theme.text,
                      fontWeight:
                        "600",
                    }}
                  >
                    {item
                      .charAt(0)
                      .toUpperCase() +
                      item.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
            
          </View>

          {mode === "system" && (
            <>
              <Text
                style={
                  dynamicStyles.sectionTitle
                }
              >
                Accent Color
              </Text>

              <TextInput
                value={accent}
                onChangeText={
                  setAccent
                }
                placeholder="#FF3F6C"
                placeholderTextColor={
                  theme.secondaryText
                }
                autoCapitalize="none"
                style={
                  dynamicStyles.colorInput
                }
              />

              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor:
                    accent,

                  alignSelf:
                    "center",

                  marginTop: 15,

                  borderWidth: 2,

                  borderColor:
                    theme.border,
                }}
              />

              <Text
                style={{
                  textAlign:
                    "center",

                  marginTop: 10,

                  color:
                    theme.secondaryText,
                }}
              >
                Current:
                {" "}
                {accent}
              </Text>
            </>
          )}
        </View>

        <View
          style={
            dynamicStyles.menuSection
          }
        >
          {menuItems.map(
            (
              item,
              index
            ) => (
              <TouchableOpacity
                key={index}
                style={
                  dynamicStyles.menuItem
                }
                onPress={() =>
                  router.push(
                    item.route as any
                  )
                }
              >
                <View
                  style={
                    dynamicStyles.menuItemLeft
                  }
                >
                  <item.icon
                    size={24}
                    color={
                      theme.text
                    }
                  />

                  <Text
                    style={
                      dynamicStyles.menuItemLabel
                    }
                  >
                    {item.label}
                  </Text>
                </View>

                <ChevronRight
                  size={24}
                  color={
                    theme.text
                  }
                />
              </TouchableOpacity>
            )
          )}
        </View>

        <TouchableOpacity
          style={[
            dynamicStyles.logoutButton,
            {
              borderColor:
                theme.primary,
            },
          ]}
          onPress={
            handleLogout
          }
        >
          <LogOut
            size={24}
            color={
              theme.primary
            }
          />

          <Text
            style={[
              dynamicStyles.logoutText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (
  theme: any,
  sliderWidth: number
) =>
  StyleSheet.create({
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
    },

    userInfo: {
      flexDirection:
        "row",
      alignItems:
        "center",
      padding: 20,
      backgroundColor:
        theme.card,
    },

    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    userDetails: {
      marginLeft: 15,
    },

    userName: {
      fontSize: 20,
      fontWeight:
        "bold",
      color:
        theme.text,
    },

    userEmail: {
      color:
        theme.secondaryText,
    },

    themeCard: {
      margin: 15,
      padding: 15,
      borderRadius: 12,
      backgroundColor:
        theme.card,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 10,
    },

    toggleContainer: {
      height: 50,
      flexDirection: "row",
      borderRadius: 25,
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor:
        theme.border,
      marginBottom: 20,
    },

    slider: {
      position: "absolute",
      width: sliderWidth,
      height: "100%",
      borderRadius: 25,
    },

    toggleItem: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      zIndex: 2,
    },

    colorInput: {
      borderWidth: 1,
      borderColor:
        theme.border,
      borderRadius: 10,
      padding: 12,
      color:
        theme.text,
      backgroundColor:
        theme.background,
    },

    menuSection: {
      marginTop: 20,
    },

    menuItem: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      padding: 15,
      backgroundColor:
        theme.card,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border,
    },

    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    menuItemLabel: {
      marginLeft: 15,
      color:
        theme.text,
      fontSize: 16,
    },

    logoutButton: {
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
      padding: 15,
      borderWidth: 1,
      borderRadius: 10,
      margin: 15,
    },

    logoutText: {
      marginLeft: 10,
      fontWeight: "bold",
      fontSize: 16,
    },

    emptyState: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    emptyTitle: {
      color:
        theme.text,
      marginVertical: 20,
      fontSize: 18,
    },

    loginButton: {
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
    },

    loginButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });