export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  created_at: string;
}

export interface Workout {
  id: number;
  exercise_id: number;
  exercise_name?: string;
  muscle_group?: string;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  exercises?: PlanExercise[];
  created_at: string;
}

export interface PlanExercise {
  id: number;
  plan_id: number;
  exercise_id: number;
  exercise_name?: string;
  muscle_group?: string;
  target_sets: number;
  target_reps: number;
  order_index: number;
}

export interface Goal {
  id: number;
  exercise_id: number;
  exercise_name?: string;
  muscle_group?: string;
  target_weight: number;
  target_reps: number;
  deadline: string;
  achieved: boolean;
  current_max?: number;
  progress?: number;
  created_at: string;
}

export interface ExerciseStats {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  max_weight: number;
  max_reps: number;
  total_sets: number;
  total_volume: number;
  history: WorkoutHistory[];
}

export interface WorkoutHistory {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
}

export interface VolumeStats {
  period: string;
  total_volume: number;
  by_muscle: MuscleVolume[];
  daily: DailyVolume[];
}

export interface MuscleVolume {
  muscle_group: string;
  volume: number;
}

export interface DailyVolume {
  date: string;
  volume: number;
}

export interface PersonalRecord {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  max_weight: number;
  max_reps: number;
  date: string;
}

export const MUSCLE_GROUPS = ['胸', '背中', '肩', '腕', '脚', '腹筋'] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];
