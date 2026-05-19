import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recently_viewed";

export const addRecentlyViewed = async (product: any) => {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    let items = existing ? JSON.parse(existing) : [];

    // remove duplicate
    items = items.filter((item: any) => item._id !== product._id);

    // add newest on top
    items.unshift({
      ...product,
      viewedAt: new Date().toISOString(),
    });

    // limit to 20
    if (items.length > 20) {
      items = items.slice(0, 20);
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch (err) {
    console.log(err);
  }
};

export const getRecentlyViewed = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};