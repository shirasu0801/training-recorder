import { useState, useEffect } from 'react';
import type { Workout, Exercise } from '../types';
import { getWorkouts, getExercises, deleteWorkout } from '../api/client';

const styles = {
  container: {
    maxWidth: '1000px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '150px',
  },
  table: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderCollapse: 'collapse' as const,
    overflow: 'hidden',
  },
  th: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left' as const,
    fontWeight: 'bold',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '15px',
    borderBottom: '1px solid #eee',
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
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  noData: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
  },
  volume: {
    color: '#666',
    fontSize: '12px',
  },
};

function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exerciseId, setExerciseId] = useState<number | ''>('');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [startDate, endDate, exerciseId]);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const loadWorkouts = async () => {
    try {
      const filters: {
        start_date?: string;
        end_date?: string;
        exercise_id?: number;
      } = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (exerciseId !== '') filters.exercise_id = exerciseId;
      const data = await getWorkouts(filters);
      setWorkouts(data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このワークアウトを削除しますか？')) return;
    try {
      await deleteWorkout(id);
      loadWorkouts();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ワークアウト履歴</h1>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>開始日</label>
          <input
            type="date"
            style={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.label}>終了日</label>
          <input
            type="date"
            style={styles.input}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.label}>種目</label>
          <select
            style={styles.select}
            value={exerciseId}
            onChange={(e) =>
              setExerciseId(e.target.value === '' ? '' : Number(e.target.value))
            }
          >
            <option value="">すべて</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {workouts.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>日付</th>
              <th style={styles.th}>種目</th>
              <th style={styles.th}>セット</th>
              <th style={styles.th}>レップ</th>
              <th style={styles.th}>重量</th>
              <th style={styles.th}>メモ</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout.id}>
                <td style={styles.td}>{formatDate(workout.date)}</td>
                <td style={styles.td}>
                  {workout.exercise_name}
                  <span style={styles.muscleTag}>{workout.muscle_group}</span>
                </td>
                <td style={styles.td}>{workout.sets}</td>
                <td style={styles.td}>{workout.reps}</td>
                <td style={styles.td}>
                  {workout.weight}kg
                  <div style={styles.volume}>
                    Vol: {(workout.sets * workout.reps * workout.weight).toLocaleString()}
                  </div>
                </td>
                <td style={styles.td}>{workout.notes || '-'}</td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(workout.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.noData}>ワークアウト履歴がありません</div>
      )}
    </div>
  );
}

export default History;
