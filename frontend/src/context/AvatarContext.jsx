import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../lib/axios';
import { useAuth } from './AuthContext';

const AvatarContext = createContext();

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};

export const AvatarProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's avatar
  const fetchAvatar = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/avatar/me');
      const data = response.data.data || response.data;
      setAvatar(data.avatar);
    } catch (err) {
      console.error('Error fetching avatar:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load avatar';
      setError(errorMsg);
      // Set a default avatar to prevent infinite loading
      setAvatar(null);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Fetch available items with unlock status
  const fetchItems = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await axiosInstance.get('/api/avatar/items');
      const data = response.data.data || response.data;
      setItems(data.items);
    } catch (err) {
      console.error('Error fetching avatar items:', err);
    }
  }, [user, token]);

  // Fetch avatar statistics
  const fetchStats = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await axiosInstance.get('/api/avatar/stats');
      const data = response.data.data || response.data;
      setStats(data);
    } catch (err) {
      console.error('Error fetching avatar stats:', err);
    }
  }, [user, token]);

  // Customize avatar (colors, features, accessories)
  const customizeAvatar = async (customization) => {
    try {
      const response = await axiosInstance.put('/api/avatar/customize', { customization });
      const data = response.data.data || response.data;
      setAvatar(data.avatar);
      return { success: true, avatar: data.avatar };
    } catch (err) {
      console.error('Error customizing avatar:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to customize avatar' 
      };
    }
  };

  // Change base character
  const changeCharacter = async (characterId) => {
    try {
      const response = await axiosInstance.put('/api/avatar/character', { characterId });
      const data = response.data.data || response.data;
      setAvatar(data.avatar);
      await fetchStats(); // Refresh stats
      return { success: true, avatar: data.avatar };
    } catch (err) {
      console.error('Error changing character:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to change character' 
      };
    }
  };

  // Update avatar mood
  const updateMood = async (mood) => {
    try {
      const response = await axiosInstance.put('/api/avatar/mood', { mood });
      const data = response.data.data || response.data;
      setAvatar(data.avatar);
      return { success: true, avatar: data.avatar };
    } catch (err) {
      console.error('Error updating mood:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update mood' 
      };
    }
  };

  // Unlock avatar item (called when achievement is earned)
  const unlockItem = async (itemId, itemType) => {
    try {
      const response = await axiosInstance.post('/api/avatar/unlock', { itemId, itemType });
      const data = response.data.data || response.data;
      setAvatar(data.avatar);
      await fetchItems(); // Refresh items to show new unlock
      await fetchStats(); // Refresh stats
      return { 
        success: true, 
        avatar: data.avatar,
        newUnlock: data.newUnlock 
      };
    } catch (err) {
      console.error('Error unlocking item:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to unlock item' 
      };
    }
  };

  // Get items by category
  const getItemsByCategory = (category) => {
    if (!items) return [];
    return items[category] || [];
  };

  // Check if item is unlocked
  const isItemUnlocked = (itemId, category) => {
    if (!avatar) return false;
    
    const categoryMap = {
      baseCharacters: 'baseCharacters',
      headAccessories: 'accessories',
      faceAccessories: 'accessories',
      badges: 'accessories',
      backgrounds: 'backgrounds',
      hairStyles: 'hairStyles',
      expressions: 'expressions',
    };
    
    const unlockedArray = avatar.unlockedItems[categoryMap[category]];
    return unlockedArray?.includes(itemId) || false;
  };

  // Refresh all avatar data
  const refreshAvatarData = useCallback(async () => {
    await Promise.all([
      fetchAvatar(),
      fetchItems(),
      fetchStats(),
    ]);
  }, [fetchAvatar, fetchItems, fetchStats]);

  // Initial load
  useEffect(() => {
    if (user && token) {
      refreshAvatarData();
    } else {
      setLoading(false); // Not authenticated, stop loading
    }
  }, [user, token, refreshAvatarData]);

  const value = {
    // State
    avatar,
    items,
    stats,
    loading,
    error,
    
    // Actions
    fetchAvatar,
    fetchItems,
    fetchStats,
    customizeAvatar,
    changeCharacter,
    updateMood,
    unlockItem,
    refreshAvatarData,
    
    // Helpers
    getItemsByCategory,
    isItemUnlocked,
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

export default AvatarContext;
