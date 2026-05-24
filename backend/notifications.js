const axios = require("axios");

const sendPushNotification = async (token, title, body) => {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: token,
      sound: "default",
      title,
      body,
    });

    console.log("✅ Notification sent");
  } catch (error) {
    console.log("❌ Notification error:", error.response?.data || error);
  }
};

module.exports = { sendPushNotification };