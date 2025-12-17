// Gamification Component Exports
export { default as AchievementNotification } from './AchievementNotification';
export { default as RealTimeStats } from './RealTimeStats';
export { default as CelebrationModal } from './CelebrationModal';
export { default as XPFloatingAnimation, PointsCounter, XPProgressRing } from './XPFloatingAnimation';
// Feature unlock system
export { 
  FeatureGate, 
  LockedFeatureCard, 
  FeatureUnlockBadge, 
  useFeatureUnlock 
} from '../FeatureGate';

// Unlock notifications
export { 
  UnlockNotification, 
  UnlockToast 
} from './UnlockNotification';

// Feature unlock notification wrapper
export { FeatureUnlockNotificationWrapper } from './FeatureUnlockNotificationWrapper';

// Progress dashboard
export { 
  FeatureProgressDashboard, 
  FeatureProgressList 
} from './FeatureProgressDashboard';

// Re-export config for convenience
export { 
  FEATURE_UNLOCKS, 
  TIERS, 
  CATEGORIES,
  LEVEL_MILESTONES,
  QUIZ_MILESTONES,
  STREAK_MILESTONES,
  checkFeatureUnlock,
  getUnlockedFeatures,
  getUpcomingFeatures,
  getFeaturesByCategory,
} from '../../config/featureUnlocks';