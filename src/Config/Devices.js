import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window')
const screenWidth = Math.round(width);
const screenHeight = Math.round(height);

const isIphoneX = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (height >= 812 || width >= 812)

export default {
  screenWidth,
  screenHeight,
  isIphoneX,
  ToolbarHeight: isIphoneX ? 35 : 0,
}
