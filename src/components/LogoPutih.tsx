import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface LogoPutihProps {
  size?: number;
  style?: ViewStyle;
}

const LogoPutih: React.FC<LogoPutihProps> = ({ size = 200, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../../assets/logo-phc-putih.png")}
        style={[styles.logoImage, { width: size, height: size * 0.4 }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    // Aspect ratio 5:2.5 (600:240) to accommodate full text
    aspectRatio: 5/2.5,
  },
});

export default LogoPutih;
