const axios = require("axios");
const User = require("./models/User"); // ✅ ADD

const sendPushNotification = async (token, title, body, userId) => {
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

    const data = res.data;

    // ✅ HANDLE INVALID TOKEN
    if (data?.data?.status === "error") {
      console.log("Invalid token, removing...");

      await User.findByIdAndUpdate(userId, {
        expoPushToken: null,
      });
    }

    console.log("✅ Notification sent");
  } catch (error) {
    console.log("❌ Notification failed, retrying...");

    // 🔁 SIMPLE RETRY (1 retry)
    try {
      await axios.post(
        "https://exp.host/--/api/v2/push/send",
        {
          to: token,
          sound: "default",
          title,
          body,
        }
      );

      console.log("✅ Retry success");
    } catch (err) {
      console.log("❌ Retry failed");
    }
  }
};

module.exports = { sendPushNotification };