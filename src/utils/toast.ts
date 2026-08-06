import Toast from 'react-native-toast-message';

export const showToast = {
  error: (message: string, title: string = 'Authentication Failed') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
      visibilityTime: 4500,
    });
  },
  success: (message: string, title: string = 'Success') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
      visibilityTime: 3500,
    });
  },
  warning: (message: string, title: string = 'Warning') => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
      visibilityTime: 4000,
    });
  },
  info: (message: string, title: string = 'Information') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
      visibilityTime: 3500,
    });
  },
};
