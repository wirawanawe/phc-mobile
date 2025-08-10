export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  healthScore: number;
  points: number;
  level: number;
  role: "user" | "admin" | "doctor";
}

export interface HealthAssessment {
  id: string;
  userId: string;
  date: Date;
  category: string;
  score: number;
  answers: AssessmentAnswer[];
  recommendations: string[];
}

export interface AssessmentAnswer {
  questionId: string;
  question: string;
  answer: string | number;
  category: string;
}

export interface HealthEducation {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  readTime: number;
  tags: string[];
  date: Date;
}

export interface FitnessActivity {
  id: string;
  name: string;
  description: string;
  calories: number;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  completed: boolean;
}

export interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  participants: number;
  maxParticipants: number;
  date: Date;
  location: string;
  points: number;
}

export interface HealthNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  source: string;
  date: Date;
  category: string;
  readTime: number;
}

export interface ExpertConsultation {
  id: string;
  expertName: string;
  specialty: string;
  availability: string[];
  rating: number;
  experience: number;
  imageUrl?: string;
  description: string;
}

export interface HealthReport {
  id: string;
  userId: string;
  period: string;
  healthScore: number;
  activitiesCompleted: number;
  pointsEarned: number;
  recommendations: string[];
  date: Date;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  target_value: number;
  unit?: string;
  points: number;
  icon?: string;
  color?: string;
  difficulty: string;
}

export interface UserMission {
  id: number;
  user_id: number;
  mission_id: number;
  status: string;
  progress: number;
  current_value: number;
  start_date: string;
  completed_date?: string;
  due_date?: string;
  points_earned?: number;
  streak_count: number;
  last_completed_date?: string;
  notes?: string;
  mission?: Mission;
}
