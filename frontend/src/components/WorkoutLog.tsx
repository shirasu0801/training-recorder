import { useState, useEffect } from 'react';
import type { Exercise, Workout } from '../types';
import { getExercises, createWorkout, deleteWorkout } from '../api/client';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    alignSelf: 'flex-end' as const,
  },
  workoutList: {
    marginTop: '20px',
  },
  workoutItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
  },
  workoutInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  workoutDetails: {
    color: '#666',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  muscleTag: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    marginLeft: '8px',
  },
};

interface Props {
  date: string;
  workouts: Workout[];
  onWorkoutAdded: () => void;
}

function WorkoutLog({ date, workouts, onWorkoutAdded }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<number>(0);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
      if (data.length > 0 && exerciseId === 0) {
        setExerciseId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exerciseId === 0 || weight <= 0) return;

    try {
      await createWorkout({
        exercise_id: exerciseId,
        date,
        sets,
        reps,
        weight,
        notes,
      });
      setNotes('');
      onWorkoutAdded();
    } catch (error) {
      console.error('Failed to create workout:', error);
      alert('ワークアウトの記録に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このワークアウトを削除しますか？')) return;
    try {
      await deleteWorkout(id);
      onWorkoutAdded();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('削除に失敗しました');
    }
  };

  const todayWorkouts = workouts.filter((w) => w.date === date);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ワークアウト記録</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>種目</label>
          <select
            style={styles.select}
            value={exerciseId}
            onChange={(e) => setExerciseId(Number(e.target.value))}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.muscle_group})
              </option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>セット数</label>
          <input
            type="number"
            style={styles.input}
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>レップ数</label>
          <input
            type="number"
            style={styles.input}
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>重量 (kg)</label>
          <input
            type="number"
            style={styles.input}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min="0"
            step="0.5"
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>メモ</label>
          <input
            type="text"
            style={styles.input}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="オプション"
          />
        </div>
        <button type="submit" style={styles.button}>
          記録
        </button>
      </form>

      {todayWorkouts.length > 0 && (
        <div style={styles.workoutList}>
          <h3 style={{ marginBottom: '10px' }}>今日のワークアウト</h3>
          {todayWorkouts.map((workout) => (
            <div key={workout.id} style={styles.workoutItem}>
              <div style={styles.workoutInfo}>
                <span style={styles.exerciseName}>
                  {workout.exercise_name}
                  <span style={styles.muscleTag}>{workout.muscle_group}</span>
                </span>
                <span style={styles.workoutDetails}>
                  {workout.sets}セット × {workout.reps}レップ @ {workout.weight}kg
                  {workout.notes && ` - ${workout.notes}`}
                </span>
              </div>
              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(workout.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkoutLog;
