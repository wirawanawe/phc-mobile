// Time-based greeting utility functions

export interface TimeGreeting {
  text: string;
  icon: string;
  color: string;
}

/**
 * Get time-based greeting based on current hour
 * @returns TimeGreeting object with text, icon, and color
 */
export const getTimeBasedGreeting = (): TimeGreeting => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { 
      text: "Selamat Pagi", 
      icon: "weather-sunny", 
      color: "#D69E2E" 
    };
  } else if (hour >= 12 && hour < 15) {
    return { 
      text: "Selamat Siang", 
      icon: "weather-sunny", 
      color: "#D69E2E" 
    };
  } else if (hour >= 15 && hour < 18) {
    return { 
      text: "Selamat Sore", 
      icon: "weather-partly-cloudy", 
      color: "#E53E3E" 
    };
  } else if (hour >= 18 && hour < 22) {
    return { 
      text: "Selamat Malam", 
      icon: "weather-night", 
      color: "#9F7AEA" 
    };
  } else {
    return { 
      text: "Selamat Malam", 
      icon: "weather-night", 
      color: "#9F7AEA" 
    };
  }
};

/**
 * Get time-based greeting in English
 * @returns TimeGreeting object with English text
 */
export const getTimeBasedGreetingEnglish = (): TimeGreeting => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { 
      text: "Good Morning", 
      icon: "weather-sunny", 
      color: "#D69E2E" 
    };
  } else if (hour >= 12 && hour < 17) {
    return { 
      text: "Good Afternoon", 
      icon: "weather-sunny", 
      color: "#D69E2E" 
    };
  } else if (hour >= 17 && hour < 22) {
    return { 
      text: "Good Evening", 
      icon: "weather-partly-cloudy", 
      color: "#E53E3E" 
    };
  } else {
    return { 
      text: "Good Night", 
      icon: "weather-night", 
      color: "#9F7AEA" 
    };
  }
}; 