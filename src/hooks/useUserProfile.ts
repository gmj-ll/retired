import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { StorageService } from '@/services/StorageService';

// 全局状态管理
let globalProfile: UserProfile | null = null;
let globalLoading = true;
let globalError: string | null = null;
const subscribers: Set<() => void> = new Set();

// 通知所有订阅者状态已更新
const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// 全局状态更新函数
const updateGlobalState = (profile: UserProfile | null, loading: boolean, error: string | null) => {
  globalProfile = profile;
  globalLoading = loading;
  globalError = error;
  notifySubscribers();
};

// 全局加载函数
const loadGlobalProfile = async () => {
  try {
    updateGlobalState(null, true, null);
    const savedProfile = await StorageService.getUserProfile();
    updateGlobalState(savedProfile, false, null);
  } catch (err) {
    updateGlobalState(null, false, '加载用户资料失败');
    console.error('Error loading profile:', err);
  }
};

// 全局保存函数
const saveGlobalProfile = async (newProfile: UserProfile) => {
  try {
    updateGlobalState(globalProfile, globalLoading, null);
    await StorageService.saveUserProfile(newProfile);
    updateGlobalState(newProfile, false, null);
  } catch (err) {
    updateGlobalState(globalProfile, false, '保存用户资料失败');
    console.error('Error saving profile:', err);
    throw err;
  }
};

export const useUserProfile = () => {
  const [, forceUpdate] = useState({});
  
  // 强制重新渲染
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    // 订阅全局状态变化
    subscribers.add(triggerUpdate);
    
    // 如果是第一次加载，初始化数据
    if (subscribers.size === 1 && globalLoading && !globalProfile) {
      loadGlobalProfile();
    }

    return () => {
      // 取消订阅
      subscribers.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!globalProfile) return;

    const updatedProfile: UserProfile = {
      ...globalProfile,
      ...updates,
      updatedAt: new Date(),
    };

    await saveGlobalProfile(updatedProfile);
  };

  const reloadProfile = async () => {
    await loadGlobalProfile();
  };

  return {
    profile: globalProfile,
    loading: globalLoading,
    error: globalError,
    saveProfile: saveGlobalProfile,
    updateProfile,
    reloadProfile,
  };
};
