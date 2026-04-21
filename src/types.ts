export interface UserProfile {
  name: string;
  goal: 'Weight Loss' | 'Muscle Gain' | 'Heart Health' | 'Diabetes Control';
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
  bmr: number;
  tdee: number;
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  score: number;
  verdict: 'Great' | 'Moderate' | 'Avoid';
  insights: string[];
  swaps: {
    original: string;
    replacement: string;
    description: string;
    caloriesSaved: number;
  }[];
  micronutrients?: {
    name: string;
    percent: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface WeeklyInsight {
  summary: string;
  wins: string[];
  improvements: string[];
  patterns: string[];
}
