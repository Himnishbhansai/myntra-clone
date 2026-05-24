import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";
import { Platform } from "react-native";
const User = require("../models/User");

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

const sendPushNotification = async (token, title, body, retries = 2) => {
  try {
    const res = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      {
        to: token,
        sound: "default",
        title,
        body,
      }
    );

    // 🔥 check expo response
    const data = res.data;

    if (data?.data?.status === "error") {
      throw new Error(data.data.message);
    }

  } catch (err) {
    console.log("Push error:", err.message);

    // 🔁 RETRY LOGIC
    if (retries > 0) {
      console.log("Retrying...", retries);
      return sendPushNotification(token, title, body, retries - 1);
    }

    // ❌ REMOVE INVALID TOKEN
    if (
      err.message?.includes("DeviceNotRegistered") ||
      err.message?.includes("InvalidCredentials")
    ) {
      console.log("Removing invalid token");

      await User.findOneAndUpdate(
        { expoPushToken: token },
        { $unset: { expoPushToken: "" } }
      );
    }
  }
};

module.exports = { sendPushNotification };