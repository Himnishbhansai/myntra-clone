import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";
import { Platform } from "react-native";

// 🔥 CONFIG (IMPORTANT for foreground handling)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotifications = async (userId: string) => {
  try {
    if (!Device.isDevice) {
      console.log("Must use physical device for push notifications");
      return;
    }

    // 🔥 PERMISSIONS
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission not granted");
      return;
    }

    // 🔥 GET TOKEN
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    // 🔥 ANDROID CHANNEL (VERY IMPORTANT)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // 🔥 SEND TOKEN TO BACKEND
    await axios.post(
      "https://myntra-clone-7tse.onrender.com/save-token",
      {
        userId,
        token,
      }
    );

    return token;
  } catch (error) {
    console.log("Push registration error:", error);
  }
};