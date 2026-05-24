import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

// 🔥 HANDLE FOREGROUND NOTIFICATIONS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotifications = async (userId) => {
  try {
    if (!Device.isDevice) return;

    // ✅ PERMISSION
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    // ✅ GET TOKEN
    const token = (
      await Notifications.getExpoPushTokenAsync()
    ).data;

    // ✅ SEND TO BACKEND
    await axios.post(
      "https://myntra-clone-7tse.onrender.com/save-token",
      {
        userId,
        token,
      }
    );

    return token;
  } catch (err) {
    console.log("Notification error:", err);
  }
};

const sendPushNotification = async (token, title, body) => {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: token,
      sound: "default",
      title,
      body,
    });
  } catch (err) {
    console.log("Push error:", err);
  }
};

module.exports = { sendPushNotification };