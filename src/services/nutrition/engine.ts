import type { ActivityLevel, Goal, UserProfile } from '@/types';
const ACTIVITY: Record<ActivityLevel, number> = { sedentary:1.2, lightly_active:1.375, moderately_active:1.55, very_active:1.725, extra_active:1.9 };
export function calculateTargets(input: { age:number; gender:'male'|'female'; heightCm:number; weightKg:number; goalWeightKg:number; activityLevel:ActivityLevel; goal:Goal }) {
  const {age,gender,heightCm,weightKg,goalWeightKg,activityLevel,goal}=input;
  if (![age,heightCm,weightKg,goalWeightKg].every(Number.isFinite) || age<18 || age>100 || heightCm<100 || heightCm>250 || weightKg<30 || weightKg>350) throw new Error('Please enter valid age, height, and weight values.');
  const bmr=10*weightKg+6.25*heightCm-5*age+(gender==='male'?5:-161);
  const tdee=bmr*ACTIVITY[activityLevel];
  const delta=goal==='lose_weight'?-500:goal==='gain_weight'?300:0;
  const min=gender==='male'?1500:1200;
  const calories=Math.round(Math.max(min,Math.min(5500,tdee+delta)));
  const protein=Math.round(Math.max(60,Math.min(weightKg*1.8,calories*.4/4)));
  const fat=Math.round(Math.max(35,Math.min(180,calories*.28/9)));
  const carbs=Math.max(50,Math.round((calories-protein*4-fat*9)/4));
  return { calories, protein, carbs, fat, bmr:Math.round(bmr), tdee:Math.round(tdee) };
}
export function profileWithTargets(p: Omit<UserProfile,'targetCalories'|'targetProtein'|'targetCarbs'|'targetFat'>): UserProfile {
 const t=calculateTargets(p); return {...p,targetCalories:t.calories,targetProtein:t.protein,targetCarbs:t.carbs,targetFat:t.fat};
}
