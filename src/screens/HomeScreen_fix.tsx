// 在 HomeScreen.tsx 中需要修复的部分

// 1. 修改背景图时使用最新的 profile
const handleChangeBackground = () => {
  ImagePickerService.showImagePickerOptions(async (uri: string) => {
    try {
      await updateProfile({ profileImage: uri });
      // 使用更新后的 profile
      if (profile) {
        const updatedProfile = { ...profile, profileImage: uri };
        await WidgetService.updateWidgetData(updatedProfile, currentFormat);
        console.log('✅ Background updated and widget refreshed');
      }
    } catch (error) {
      console.error('更新背景图片失败:', error);
      Alert.alert('错误', '更新背景图片失败，请重试');
    }
  });
};

// 2. 修复 useEffect，当 currentFormat 变化时也更新
useEffect(() => {
  if (profile && WidgetService.isWidgetAvailable()) {
    console.log('🔄 Profile or format changed, updating widget...');
    WidgetService.updateWidgetData(profile, currentFormat);
  }
}, [profile, currentFormat]); // 添加 currentFormat 依赖
