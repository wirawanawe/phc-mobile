import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitnessGoals: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privacySettings: {
      shareData: boolean;
      publicProfile: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

class UserProfileService {
  private readonly STORAGE_KEY = 'user_profile';
  private currentProfile: UserProfile | null = null;

  /**
   * Get user profile from storage
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      if (this.currentProfile) {
        return this.currentProfile;
      }

      const profileData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (profileData) {
        this.currentProfile = JSON.parse(profileData);
        return this.currentProfile;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save user profile to storage
   */
  async saveUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const existingProfile = await this.getUserProfile();
      const updatedProfile: UserProfile = {
        ...existingProfile,
        ...profile,
        updatedAt: new Date(),
      } as UserProfile;

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProfile));
      this.currentProfile = updatedProfile;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user weight for calorie calculations
   */
  async getUserWeight(): Promise<number> {
    try {
      const profile = await this.getUserProfile();
      return profile?.weight || 70; // Default weight if not set
    } catch (error) {
      return 70; // Default weight
    }
  }

  /**
   * Update user weight
   */
  async updateUserWeight(weight: number): Promise<boolean> {
    try {
      return await this.saveUserProfile({ weight });
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user height
   */
  async getUserHeight(): Promise<number> {
    try {
      const profile = await this.getUserProfile();
      return profile?.height || 170; // Default height if not set
    } catch (error) {
      return 170; // Default height
    }
  }

  /**
   * Calculate BMI (Body Mass Index)
   */
  async calculateBMI(): Promise<number | null> {
    try {
      const weight = await this.getUserWeight();
      const height = await this.getUserHeight();
      
      if (weight > 0 && height > 0) {
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get BMI category
   */
  async getBMICategory(): Promise<string> {
    try {
      const bmi = await this.calculateBMI();
      if (!bmi) return 'Unknown';

      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal weight';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
   */
  async calculateBMR(): Promise<number | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      const { weight, height, age, gender } = profile;
      
      // Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      
      if (gender === 'male') {
        bmr += 5;
      } else {
        bmr -= 161;
      }

      return Math.round(bmr);
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  async calculateTDEE(): Promise<number | null> {
    try {
      const bmr = await this.calculateBMR();
      if (!bmr) return null;

      const profile = await this.getUserProfile();
      if (!profile) return null;

      const activityMultipliers = {
        sedentary: 1.2, // Little or no exercise
        lightly_active: 1.375, // Light exercise 1-3 days/week
        moderately_active: 1.55, // Moderate exercise 3-5 days/week
        very_active: 1.725, // Hard exercise 6-7 days/week
        extremely_active: 1.9, // Very hard exercise, physical job
      };

      const multiplier = activityMultipliers[profile.activityLevel] || 1.2;
      return Math.round(bmr * multiplier);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create default profile for new user
   */
  async createDefaultProfile(userId: string, name: string, email: string): Promise<boolean> {
    try {
      const defaultProfile: UserProfile = {
        id: userId,
        name,
        email,
        weight: 70, // Default weight in kg
        height: 170, // Default height in cm
        age: 25, // Default age
        gender: 'other',
        activityLevel: 'moderately_active',
        fitnessGoals: ['general_fitness'],
        medicalConditions: [],
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
        preferences: {
          units: 'metric',
          notifications: true,
          privacySettings: {
            shareData: false,
            publicProfile: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await this.saveUserProfile(defaultProfile);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear user profile (for logout)
   */
  async clearUserProfile(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.currentProfile = null;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if profile exists
   */
  async hasProfile(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(): Promise<number> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return 0;

      const requiredFields = [
        'name',
        'email',
        'weight',
        'height',
        'age',
        'gender',
        'activityLevel',
      ];

      const optionalFields = [
        'fitnessGoals',
        'medicalConditions',
        'emergencyContact.name',
        'emergencyContact.phone',
      ];

      let completedRequired = 0;
      let completedOptional = 0;

      // Check required fields
      requiredFields.forEach(field => {
        const value = profile[field as keyof UserProfile];
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && value !== '') {
            completedRequired++;
          } else if (typeof value === 'number' && value > 0) {
            completedRequired++;
          } else if (typeof value === 'object' && value !== null) {
            completedRequired++;
          }
        }
      });

      // Check optional fields
      optionalFields.forEach(field => {
        const keys = field.split('.');
        let value: any = profile;
        for (const key of keys) {
          value = value[key as keyof typeof value];
        }
        if (value && typeof value === 'string' && value !== '' || typeof value === 'number' && value !== 0) {
          completedOptional++;
        }
      });

      const requiredWeight = 0.7; // 70% weight for required fields
      const optionalWeight = 0.3; // 30% weight for optional fields

      const requiredPercentage = (completedRequired / requiredFields.length) * requiredWeight;
      const optionalPercentage = (completedOptional / optionalFields.length) * optionalWeight;

      return Math.round((requiredPercentage + optionalPercentage) * 100);
    } catch (error) {
      return 0;
    }
  }
}

export default new UserProfileService(); 