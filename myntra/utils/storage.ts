import * as SecureStore from "expo-secure-store";

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  try {
    await SecureStore.setItemAsync("userid", _id);
    await SecureStore.setItemAsync("userName", name);
    await SecureStore.setItemAsync("userEmail", email);

    console.log("User data saved");
  } catch (error) {
    console.log("SaveUserData Error:", error);
  }
};

export const getUserData = async () => {
  try {
    const _id =
      (await SecureStore.getItemAsync("userid")) || "";

    const name =
      (await SecureStore.getItemAsync("userName")) || "";

    const email =
      (await SecureStore.getItemAsync("userEmail")) || "";

    return {
      _id,
      name,
      email,
    };
  } catch (error) {
    console.log("GetUserData Error:", error);

    return {
      _id: "",
      name: "",
      email: "",
    };
  }
};

export const clearUserData = async () => {
  try {
    await SecureStore.deleteItemAsync("userid");

    await SecureStore.deleteItemAsync("userName");

    await SecureStore.deleteItemAsync("userEmail");

    console.log("User data cleared");
  } catch (error) {
    console.log("ClearUserData Error:", error);
  }
};