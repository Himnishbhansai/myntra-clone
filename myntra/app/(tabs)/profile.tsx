import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import ColorPicker from "react-native-wheel-color-picker";

const { width } = Dimensions.get("window");

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Transactions", route: "/transactions" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const { theme, mode, setMode, accent, setAccent } = useTheme();

  const [color, setColor] = useState(accent);

  const handleColorChange = (c: string) => {
    setColor(c);
    setAccent(c); // 🔥 sync with theme
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const themeModes = ["light", "system", "dark"];
  const activeIndex = themeModes.indexOf(mode);
  const sliderWidth = (width - 60) / 3;

  const dynamicStyles = createStyles(theme, sliderWidth);

  if (!user) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Profile</Text>
        </View>

        <View style={dynamicStyles.emptyState}>
          <User size={64} color={"#ff3f6c"} />

          <Text style={dynamicStyles.emptyTitle}>
            Please login to view your profile
          </Text>

          <TouchableOpacity
            style={[
              dynamicStyles.loginButton,
              { backgroundColor: "#ff3f6c" },
            ]}
            onPress={() => router.push("/login")}
          >
            <Text style={dynamicStyles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={dynamicStyles.content}>
        {/* USER */}
        <View style={dynamicStyles.userInfo}>
          <View
            style={[
              dynamicStyles.avatar,
              { backgroundColor: accent },
            ]}
          >
            <User size={40} color="#fff" />
          </View>

          <View style={dynamicStyles.userDetails}>
            <Text style={dynamicStyles.userName}>
              {user.name}
            </Text>
            <Text style={dynamicStyles.userEmail}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* THEME */}
        <View style={dynamicStyles.themeCard}>
          <Text style={dynamicStyles.sectionTitle}>
            Theme
          </Text>

          <View style={dynamicStyles.toggleContainer}>
            <View
              style={[
                dynamicStyles.slider,
                {
                  transform: [
                    { translateX: activeIndex * sliderWidth },
                  ],
                  backgroundColor: accent,
                },
              ]}
            />

            {themeModes.map((item) => (
              <TouchableOpacity
                key={item}
                style={dynamicStyles.toggleItem}
                onPress={() => setMode(item as any)}
              >
                <Text
                  style={{
                    color:
                      mode === item ? "#fff" : theme.text,
                    fontWeight: "600",
                  }}
                >
                  {item.charAt(0).toUpperCase() +
                    item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🎨 COLOR PICKER */}
          {mode === "system" && (
            <>
              <Text style={dynamicStyles.sectionTitle}>
                Accent Color
              </Text>

              <ColorPicker
                color={color}
                onColorChange={handleColorChange}
                thumbSize={35}
                sliderSize={30}
                noSnap={true}
                row={false}
              />

              {/* 🔥 GLOW PREVIEW */}
              <View style={{ alignItems: "center", marginTop: 25 }}>
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: color,

                    shadowColor: color,
                    shadowOpacity: 0.9,
                    shadowRadius: 25,
                    shadowOffset: { width: 0, height: 0 },

                    elevation: 20,

                    borderWidth: 2,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  style={{
                    marginTop: 10,
                    color: theme.secondaryText,
                    fontSize: 12,
                  }}
                >
                  Selected: {color}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* MENU */}
        <View style={dynamicStyles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.menuItem}
              onPress={() =>
                router.push(item.route as any)
              }
            >
              <View style={dynamicStyles.menuItemLeft}>
                <item.icon
                  size={24}
                  color={theme.text}
                />
                <Text style={dynamicStyles.menuItemLabel}>
                  {item.label}
                </Text>
              </View>

              <ChevronRight
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={[
            dynamicStyles.logoutButton,
            { borderColor: accent },
          ]}
          onPress={handleLogout}
        >
          <LogOut size={24} color={accent} />
          <Text
            style={[
              dynamicStyles.logoutText,
              { color: accent },
            ]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, sliderWidth: number) =>
  StyleSheet.create({
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
    content: { flex: 1 },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.card,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    userDetails: { marginLeft: 15 },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    userEmail: { color: theme.secondaryText },

    themeCard: {
      margin: 15,
      padding: 15,
      borderRadius: 12,
      backgroundColor: theme.card,
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
      borderWidth: 1,
      borderColor: theme.border,
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
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },

    menuSection: { marginTop: 20 },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemLabel: {
      marginLeft: 15,
      color: theme.text,
      fontSize: 16,
    },

    logoutButton: {
      flexDirection: "row",
      justifyContent: "center",
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
      justifyContent: "center",
      alignItems: "center",
    },
    emptyTitle: {
      color: theme.text,
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