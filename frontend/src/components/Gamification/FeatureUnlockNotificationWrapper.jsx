import React, { useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { useGamification } from "../../context/GamificationContext";
import { AuthContext } from "../../context/AuthContext";
import { UnlockNotification } from "./UnlockNotification";

/**
 * Feature Unlock Notification Wrapper
 * Listens to GamificationContext and shows unlock notifications
 * Only shown to students, not to teachers/admins/moderators
 */
export function FeatureUnlockNotificationWrapper() {
  const { featureUnlockNotification, clearFeatureUnlockNotification } =
    useGamification();

  const { user } = useContext(AuthContext);

  // Only show notifications for students
  const isStudent = user?.role === "Student" || !user?.role;

  if (!isStudent) {
    return null;
  }

  return (
    <AnimatePresence>
      {featureUnlockNotification && (
        <UnlockNotification
          featureId={featureUnlockNotification}
          onClose={clearFeatureUnlockNotification}
          onNavigate={(feature) => {
            // Could navigate to the feature or rewards page
            console.log("Navigate to feature:", feature);
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default FeatureUnlockNotificationWrapper;
