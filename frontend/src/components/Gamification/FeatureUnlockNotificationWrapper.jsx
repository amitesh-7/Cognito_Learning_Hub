import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGamification } from '../../context/GamificationContext';
import { UnlockNotification } from './UnlockNotification';

/**
 * Feature Unlock Notification Wrapper
 * Listens to GamificationContext and shows unlock notifications
 */
export function FeatureUnlockNotificationWrapper() {
  const { 
    featureUnlockNotification, 
    clearFeatureUnlockNotification 
  } = useGamification();

  return (
    <AnimatePresence>
      {featureUnlockNotification && (
        <UnlockNotification
          featureId={featureUnlockNotification}
          onClose={clearFeatureUnlockNotification}
          onNavigate={(feature) => {
            // Could navigate to the feature or rewards page
            console.log('Navigate to feature:', feature);
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default FeatureUnlockNotificationWrapper;
