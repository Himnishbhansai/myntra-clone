import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recently_viewed";

// ✅ ADD PRODUCT
export const addRecentlyViewed = async (product: any) => {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    let items = existing ? JSON.parse(existing) : [];

    // ❌ REMOVE DUPLICATES
    items = items.filter(
      (item: any) => item._id !== product._id
    );

    // ✅ ADD NEW ITEM ON TOP
    items.unshift({
      ...product,
      viewedAt: new Date().toISOString(),
    });

    // ✅ LIMIT TO 20
    items = items.slice(0, 20);

    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch (err) {
    console.log("Add Recently Viewed Error:", err);
  }
};

// ✅ GET ITEMS (ALWAYS SORT SAFE)
export const getRecentlyViewed = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    let items = data ? JSON.parse(data) : [];

    // 🔥 ENSURE SORT (latest first even if corrupted)
    items.sort(
      (a: any, b: any) =>
        new Date(b.viewedAt).getTime() -
        new Date(a.viewedAt).getTime()
    );

    return items;
  } catch (error) {
    console.log("Get Recently Viewed Error:", error);
    return [];
  }
};

// ✅ REMOVE SINGLE ITEM (useful later)
export const removeRecentlyViewed = async (productId: string) => {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    let items = existing ? JSON.parse(existing) : [];

    items = items.filter(
      (item: any) => item._id !== productId
    );

    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch (err) {
    console.log("Remove Error:", err);
  }
};

// ✅ CLEAR ALL (for logout / debug)
export const clearRecentlyViewed = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.log("Clear Error:", err);
  }
};