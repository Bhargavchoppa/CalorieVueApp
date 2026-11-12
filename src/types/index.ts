export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type Goal = 'lose_weight' | 'maintain_weight' | 'gain_weight';
export interface UserProfile {
  id: 'local'; name: string; age: number; gender: Gender; heightCm: number; weightKg: number;
  goalWeightKg: number; activityLevel: ActivityLevel; goal: Goal; targetCalories: number;
  targetProtein: number; targetCarbs: number; targetFat: number; createdAt: string; updatedAt: string;
}
export interface FoodAnalysis { calories: number; protein: number; carbs: number; fat: number; description: string; }
export interface WatchAnalysis { calories: number; exercise: number; stand: number; }
export interface Meal extends FoodAnalysis {
  id: string; date: string; meal_type: string; image_uri: string | null; thumbnail_uri: string | null; created_at: string;
}
export interface DailyTotals { date: string; calories: number; protein: number; carbs: number; fat: number; exercise: number; stand: number; }
