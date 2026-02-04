import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export class ImagePickerService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '权限需要',
          '需要访问您的照片库来设置背景图片',
          [{ text: '确定' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('请求权限失败:', error);
      return false;
    }
  }

  static async pickImageFromLibrary(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [47, 22], // 匹配iOS小组件中等尺寸的比例 (约2.13:1)
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试');
      return null;
    }
  }

  static async takePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '权限需要',
          '需要访问相机来拍摄背景图片',
          [{ text: '确定' }]
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [47, 22], // 匹配iOS小组件中等尺寸的比例 (约2.13:1)
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('拍摄照片失败:', error);
      Alert.alert('错误', '拍摄照片失败，请重试');
      return null;
    }
  }

  static showImagePickerOptions(
    onImageSelected: (uri: string) => void
  ): void {
    Alert.alert(
      '选择背景图片',
      '请选择图片来源',
      [
        {
          text: '从相册选择',
          onPress: async () => {
            const uri = await this.pickImageFromLibrary();
            if (uri) onImageSelected(uri);
          },
        },
        {
          text: '拍摄照片',
          onPress: async () => {
            const uri = await this.takePhoto();
            if (uri) onImageSelected(uri);
          },
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  }
}
