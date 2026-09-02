/**
 * Safe wrapper around expo-image-picker.
 * Prevents app crashing if ExpoImagePicker native module is unavailable.
 */

let ImagePickerModule: typeof import('expo-image-picker') | null = null;
try {
  ImagePickerModule = require('expo-image-picker');
} catch {
  ImagePickerModule = null;
}

export const ImagePicker = {
  isSupported(): boolean {
    return !!ImagePickerModule;
  },

  async requestMediaLibraryPermissionsAsync() {
    try {
      if (!ImagePickerModule) {
        return { status: 'undetermined', granted: false, canAskAgain: false };
      }
      return await ImagePickerModule.requestMediaLibraryPermissionsAsync();
    } catch {
      return { status: 'undetermined', granted: false, canAskAgain: false };
    }
  },

  async requestCameraPermissionsAsync() {
    try {
      if (!ImagePickerModule) {
        return { status: 'undetermined', granted: false, canAskAgain: false };
      }
      return await ImagePickerModule.requestCameraPermissionsAsync();
    } catch {
      return { status: 'undetermined', granted: false, canAskAgain: false };
    }
  },

  async launchImageLibraryAsync(options?: any) {
    if (!ImagePickerModule) {
      throw new Error('Image picker not supported on this client build');
    }
    try {
      return await ImagePickerModule.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        ...options,
      });
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to open photo library');
    }
  },

  async launchCameraAsync(options?: any) {
    if (!ImagePickerModule) {
      throw new Error('Camera picker not supported on this client build');
    }
    try {
      return await ImagePickerModule.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        ...options,
      });
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to open camera. Camera is not available on iOS Simulator.');
    }
  },
};

export default ImagePicker;
