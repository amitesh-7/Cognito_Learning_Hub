import React from "react";
import { useNavigate } from "react-router-dom";
import { useAvatar } from "../../context/AvatarContext";
import Avatar3D from "./Avatar3D";
import { FaCube, FaEdit } from "react-icons/fa";

/**
 * Compact 3D Avatar Display Component
 * Shows the user's 3D avatar with edit button
 */
const Avatar3DDisplay = ({
  size = "medium",
  showEditButton = true,
  animate = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const { avatar3DConfig, isUsing3D, loading } = useAvatar();

  const sizes = {
    small: { width: "150px", height: "150px" },
    medium: { width: "250px", height: "250px" },
    large: { width: "400px", height: "400px" },
  };

  const defaultConfig = {
    skinColor: "#FFD6A5",
    eyeColor: "#2C3E50",
    hairColor: "#8B4513",
    hairStyle: "short",
    shirtColor: "#3498DB",
    pantsColor: "#2C3E50",
    expression: "happy",
    glasses: false,
    hat: null,
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}
        style={sizes[size]}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!isUsing3D) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl ${className}`}
        style={sizes[size]}
      >
        <FaCube className="text-5xl text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          Create your 3D avatar
        </p>
        <button
          onClick={() => navigate("/avatar/customize")}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-all shadow-md"
        >
          Create Avatar
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-xl"
        style={sizes[size]}
      >
        <Avatar3D
          config={avatar3DConfig || defaultConfig}
          width="100%"
          height="100%"
          animate={animate}
        />
      </div>

      {showEditButton && (
        <button
          onClick={() => navigate("/avatar/customize")}
          className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all"
          title="Customize Avatar"
        >
          <FaEdit className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default Avatar3DDisplay;
