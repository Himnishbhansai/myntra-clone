import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { registerForPushNotifications } from "@/utils/notifications";

export default function Login() {
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setisloading] = useState(false);

  const router = useRouter();

  // ✅ Register push token after login
  useEffect(() => {
    if (user?._id) {
      registerForPushNotifications(user._id);
    }
  }, [user?._id]);

  const handleLogin = async () => {
    try {
      setisloading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
    } finally {
      setisloading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.backgroundImage}
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to Myntra</Text>
        <Text style={styles.subtitle}>Login to continue shopping</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.text} />
            ) : (
              <Eye size={20} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isloading}
        >
          {isloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.background,
    },

    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
    },

    formContainer: {
      width: "90%",
      maxWidth: 400, // ✅ fixes desktop issue
      alignSelf: "center",
      padding: 20,
      borderRadius: 20,
      backgroundColor: theme.card,
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.text,
      textAlign: "center",
    },

    subtitle: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 30,
      textAlign: "center",
    },

    input: {
      backgroundColor: theme.background,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      color: theme.text,
    },

    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 10,
      marginBottom: 15,
    },

    passwordInput: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: theme.text,
    },

    eyeIcon: {
      padding: 15,
    },

    button: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },

    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    signupLink: {
      marginTop: 20,
      alignItems: "center",
    },

    signupText: {
      color: theme.primary,
      fontSize: 16,
    },
  });