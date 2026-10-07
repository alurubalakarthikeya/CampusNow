import { Image, type ImageStyle, type StyleProp } from 'react-native';

const LOGO = require('../../assets/images/logo-no-bg.png');

/**
 * The CampusNow mark. One asset, one size per placement — the artwork is
 * never recoloured or filtered, so the brand looks exactly the same on every
 * screen and in both themes.
 */
export function BrandMark({
  width = 28,
  height = 22,
  style,
}: {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return <Image source={LOGO} resizeMode="contain" style={[{ width, height }, style]} />;
}
