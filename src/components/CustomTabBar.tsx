import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const renderTabItem = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    // 获取图标名称
    let iconName: keyof typeof Ionicons.glyphMap;
    if (route.name === 'Home') {
      iconName = isFocused ? 'home' : 'home-outline';
    } else if (route.name === 'Analysis') {
      iconName = isFocused ? 'analytics' : 'analytics-outline';
    } else if (route.name === 'Settings') {
      iconName = isFocused ? 'settings' : 'settings-outline';
    } else {
      iconName = 'help-outline';
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconContainer,
          isFocused && styles.activeIconContainer
        ]}>
          <Ionicons
            name={iconName}
            size={25}
            color={isFocused ? '#007AFF' : '#8E8E93'}
          />
        </View>
        <Text style={[
          styles.tabLabel,
          { color: isFocused ? '#007AFF' : '#8E8E93' }
        ]}>
          {label as string}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.tabBar}
          intensity={100}
          tint="systemThickMaterial"
        >
          {state.routes.map((route, index) => renderTabItem(route, index))}
        </BlurView>
      ) : (
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => renderTabItem(route, index))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 34, // 适配 iPhone 的安全区域
    left: 20,
    right: 20,
    alignItems: 'center',
    // 添加容器阴影增强层次感
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(255, 255, 255, 0.1)' // iOS 增加轻微背景色
      : 'rgba(255, 255, 255, 0.98)', // Android 增强不透明度
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: width - 40,
    overflow: 'hidden',
    // 增强边框效果
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: Platform.OS === 'ios' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.08)',
    // 内阴影效果
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.5)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 0,
      },
      android: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    // 添加触摸反馈背景
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 3,
    backgroundColor: 'transparent',
    // 添加轻微的阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    // 增强活跃状态的视觉效果
    transform: [{ scale: 1.08 }],
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    // 增强字体对比度
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
    // iOS 16 风格的字体
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});
