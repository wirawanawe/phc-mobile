/**
 * Safe navigation utility to prevent GO_BACK errors
 * This utility checks if navigation can go back before attempting to do so
 */

export const safeGoBack = (navigation: any, fallbackRoute: string = 'Main') => {
  try {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no previous screen, navigate to fallback route
      navigation.navigate(fallbackRoute);
    }
  } catch (error) {
    console.warn('Navigation error:', error);
    // Fallback to main screen if navigation fails
    try {
      navigation.navigate(fallbackRoute);
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError);
    }
  }
};

/**
 * Safe navigation with custom fallback route
 */
export const safeNavigate = (navigation: any, route: string, params?: any) => {
  try {
    navigation.navigate(route, params);
  } catch (error) {
    console.warn('Navigation error:', error);
    // Try to navigate to main screen as ultimate fallback
    try {
      navigation.navigate('Main');
    } catch (fallbackError) {
      console.error('Fallback navigation failed:', fallbackError);
    }
  }
};

/**
 * Safe replace navigation
 */
export const safeReplace = (navigation: any, route: string, params?: any) => {
  try {
    navigation.replace(route, params);
  } catch (error) {
    console.warn('Navigation replace error:', error);
    // Try to navigate to main screen as ultimate fallback
    try {
      navigation.navigate('Main');
    } catch (fallbackError) {
      console.error('Fallback navigation failed:', fallbackError);
    }
  }
};
