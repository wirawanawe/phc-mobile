import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Use development service for now
import socialAuthService from '../services/socialAuthDev';

interface SocialLoginButtonsProps {
  onSocialLoginSuccess: (data: any) => void;
  onSocialLoginError: (error: string) => void;
  loading?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSocialLoginSuccess,
  onSocialLoginError,
  loading = false,
}) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await socialAuthService.signInWithGoogle();
      if (result?.success) {
        onSocialLoginSuccess(result.data);
      }
    } catch (error) {
      onSocialLoginError('Google login failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const result = await socialAuthService.signInWithApple();
      if (result?.success) {
        onSocialLoginSuccess(result.data);
      }
    } catch (error) {
      onSocialLoginError('Apple login failed. Please try again.');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await socialAuthService.signInWithFacebook();
      if (result?.success) {
        onSocialLoginSuccess(result.data);
      }
    } catch (error) {
      onSocialLoginError('Facebook login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.buttonContainer}>
        {/* Google Login */}
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text style={[styles.buttonText, styles.googleText]}>
            {loading ? 'Loading...' : 'Google'}
          </Text>
        </TouchableOpacity>

        {/* Apple Login - Only show on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={24} color="#000000" />
            <Text style={[styles.buttonText, styles.appleText]}>
              {loading ? 'Loading...' : 'Apple'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Facebook Login */}
        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton]}
          onPress={handleFacebookLogin}
          disabled={loading}
        >
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          <Text style={[styles.buttonText, styles.facebookText]}>
            {loading ? 'Loading...' : 'Facebook'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Dengan melanjutkan, Anda menyetujui{' '}
        <Text style={styles.link}>Syarat & Ketentuan</Text> dan{' '}
        <Text style={styles.link}>Kebijakan Privasi</Text> kami
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  googleText: {
    color: '#DB4437',
  },
  appleText: {
    color: '#000000',
  },
  facebookText: {
    color: '#4267B2',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default SocialLoginButtons; 