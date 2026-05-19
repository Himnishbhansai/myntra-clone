import { Tabs } from "expo-router";
import React from "react";

import {
  Chrome,
  Heart,
  Search,
  ShoppingBag,
  User,
} from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor:
            theme.card,

          borderTopColor:
            theme.border,

          borderTopWidth: 1,

          height: 65,

          paddingBottom: 8,

          paddingTop: 8,
        },

        tabBarActiveTintColor:
          theme.primary,

        tabBarInactiveTintColor:
          theme.secondaryText,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Chrome
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Search
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Heart
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bag"
        options={{
          title: "Bag",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <ShoppingBag
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <User
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}