import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Chrome, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const GoogleAuthButton = ({
  onSuccess,
  onError,
  text = "Continue with Google",
  variant = "default",
  className = "",
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setTimeout(() => {
          onSuccess(data);
        }, 500);
      } else {
        throw new Error(data.message || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      setStatus("error");
      setTimeout(() => {
        setStatus(null);
        onError(error.message || "Google authentication failed");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error(
      "Google OAuth error: User cancelled or authentication failed"
    );
    setStatus("error");
    setTimeout(() => {
      setStatus(null);
      onError("Google authentication was cancelled or failed");
    }, 2000);
  };

  // Custom button styles based on variant
  const getButtonStyle = () => {
    const baseStyle =
      "relative overflow-hidden transition-all duration-300 transform hover:scale-105 focus:scale-105 active:scale-95";

    switch (variant) {
      case "outline":
        return `${baseStyle} border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
      case "minimal":
        return `${baseStyle} bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300`;
      case "primary":
        return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl`;
      default:
        return `${baseStyle} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg`;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
        return "text-white";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    if (status === "success") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === "error") {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <Chrome className={`w-5 h-5 ${getIconColor()}`} />;
  };

  const getStatusText = () => {
    if (isLoading) return "Authenticating...";
    if (status === "success") return "Success!";
    if (status === "error") return "Failed";
    return text;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Custom styled button wrapper */}
      <motion.button
        onClick={() => !disabled && !isLoading && loginWithGoogle()}
        disabled={disabled || isLoading}
        className={`rounded-xl px-6 py-3 font-semibold text-center cursor-pointer flex items-center justify-center gap-3 ${getButtonStyle()} ${
          disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background for primary variant */}
        {variant === "primary" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Content */}
        <motion.div
          className="relative z-10 flex items-center gap-3"
          animate={{
            scale: status === "success" ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </motion.div>

        {/* Success/Error overlay animation */}
        {status && (
          <motion.div
            className={`absolute inset-0 rounded-xl ${
              status === "success"
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-red-500/20 border-2 border-red-500"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    </div>
  );
};

// Alternative component for direct Google Login button (uses custom flow to avoid COOP)
export const GoogleLoginButton = ({ onSuccess, onError, className = "" }) => {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoResponse.json();

        onSuccess({ credential: tokenResponse.access_token, userInfo });
      } catch (error) {
        console.error("Google OAuth error:", error);
        onError(error);
      }
    },
    onError: () => {
      console.error("Google OAuth failed");
      onError();
    },
    flow: "implicit",
  });

  return (
    <motion.button
      onClick={() => loginWithGoogle()}
      className={`inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Chrome className="w-5 h-5" />
      <span className="font-medium">Continue with Google</span>
    </motion.button>
  );
};

export default GoogleAuthButton;
