import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const KEY = "recently_viewed";

export const mergeRecentsOnLogin = async (userId: string) => {
  try {
    const local = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    if (!local.length) return;

    const formatted = local.map((item: any) => ({
      productId: item.productId || item._id,
      viewedAt: item.viewedAt || new Date().toISOString(),
    }));

    await axios.post(
      "https://myntra-clone-7tse.onrender.com/recent",
      {
        userId,
        products: formatted, // 🔥 IMPORTANT KEY NAME
      }
    );

    localStorage.removeItem("recentlyViewed");
  } catch (err) {
    console.log("MERGE ERROR:", err);
  }
};