import type { Exercise, Workout, Plan, Goal, ExerciseStats, VolumeStats, PersonalRecord } from '../types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Exercises
export const getExercises = (muscleGroup?: string) => {
  const params = muscleGroup ? `?muscle_group=${encodeURIComponent(muscleGroup)}` : '';
  return fetchAPI<Exercise[]>(`/exercises${params}`);
};

export const createExercise = (data: { name: string; muscle_group: string }) =>
  fetchAPI<{ id: number; message: string }>('/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateExercise = (id: number, data: { name?: string; muscle_group?: string }) =>
  fetchAPI<{ message: string }>(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteExercise = (id: number) =>
  fetchAPI<{ message: string }>(`/exercises/${id}`, {
    method: 'DELETE',
  });

// Workouts
export const getWorkouts = (filters?: {
  date?: string;
  exercise_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.exercise_id) params.append('exercise_id', String(filters.exercise_id));
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI<Workout[]>(`/workouts${query}`);
};

export const createWorkout = (data: {
  exercise_id: number;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}) =>
  fetchAPI<{ id: number; message: string }>('/workouts', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateWorkout = (id: number, data: Partial<Workout>) =>
  fetchAPI<{ message: string }>(`/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteWorkout = (id: number) =>
  fetchAPI<{ message: string }>(`/workouts/${id}`, {
    method: 'DELETE',
  });

// Plans
export const getPlans = () => fetchAPI<Plan[]>('/plans');

export const getPlan = (id: number) => fetchAPI<Plan>(`/plans/${id}`);

export const createPlan = (data: {
  name: string;
  description?: string;
  exercises?: Array<{
    exercise_id: number;
    target_sets: number;
    target_reps: number;
    order_index?: number;
  }>;
}) =>
  fetchAPI<{ id: number; message: string }>('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePlan = (id: number, data: Partial<Plan> & {
  exercises?: Array<{
    exercise_id: number;
    target_sets: number;
    target_reps: number;
    order_index?: number;
  }>;
}) =>
  fetchAPI<{ message: string }>(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePlan = (id: number) =>
  fetchAPI<{ message: string }>(`/plans/${id}`, {
    method: 'DELETE',
  });

// Goals
export const getGoals = () => fetchAPI<Goal[]>('/goals');

export const createGoal = (data: {
  exercise_id: number;
  target_weight: number;
  target_reps: number;
  deadline?: string;
}) =>
  fetchAPI<{ id: number; message: string }>('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateGoal = (id: number, data: Partial<Goal>) =>
  fetchAPI<{ message: string }>(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteGoal = (id: number) =>
  fetchAPI<{ message: string }>(`/goals/${id}`, {
    method: 'DELETE',
  });

// Stats
export const getExerciseStats = (exerciseId: number) =>
  fetchAPI<ExerciseStats>(`/stats/exercise/${exerciseId}`);

export const getVolumeStats = (period?: 'week' | 'month' | 'year') => {
  const params = period ? `?period=${period}` : '';
  return fetchAPI<VolumeStats>(`/stats/volume${params}`);
};

export const getPersonalRecords = () => fetchAPI<PersonalRecord[]>('/stats/records');
