import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const KEY = "recently_viewed";

export const mergeRecentsOnLogin = async (userId: string) => {
  try {
    // 1. get local recents
    const localData = await AsyncStorage.getItem(KEY);
    const localRecents = localData ? JSON.parse(localData) : [];

    // 2. get server recents
    const res = await axios.get(
      `https://myntra-clone-7tse.onrender.com/recent/${userId}`
    );

    const serverRecents = res.data || [];

    // 3. normalize both
    const formattedServer = serverRecents.map((item: any) => ({
      ...item.productId,
      viewedAt: item.createdAt,
    }));

    // 4. merge + remove duplicates
    const mergedMap = new Map();

    [...localRecents, ...formattedServer].forEach((item) => {
      mergedMap.set(item._id, item);
    });

    let merged = Array.from(mergedMap.values());

    // 5. sort by latest
    merged.sort(
      (a: any, b: any) =>
        new Date(b.viewedAt).getTime() -
        new Date(a.viewedAt).getTime()
    );

    // 6. limit 20
    merged = merged.slice(0, 20);

    // 7. push back to server
    for (let item of merged) {
      await axios.post(
        "https://myntra-clone-7tse.onrender.com/recent",
        {
          userId,
          productId: item._id,
        }
      );
    }

    // 8. clear local (optional but clean)
    await AsyncStorage.removeItem(KEY);

    console.log("✅ Recents merged successfully");
  } catch (err) {
    console.log("MERGE ERROR:", err);
  }
};