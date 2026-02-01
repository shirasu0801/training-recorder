import { useState, useEffect } from 'react';
import type { Exercise } from '../types';
import { MUSCLE_GROUPS } from '../types';
import { getExercises, createExercise, updateExercise, deleteExercise } from '../api/client';
import ExerciseForm from '../components/ExerciseForm';

const styles = {
  container: {
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    backgroundColor: '#1976d2',
    color: 'white',
    borderColor: '#1976d2',
  },
  exerciseList: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
  },
  exerciseInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  muscleTag: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
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
  formContainer: {
    marginBottom: '20px',
  },
  noData: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
  },
};

function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, [filter]);

  const loadExercises = async () => {
    try {
      const data = await getExercises(filter || undefined);
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleCreate = async (data: { name: string; muscle_group: string }) => {
    try {
      await createExercise(data);
      loadExercises();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create exercise:', error);
      alert('種目の追加に失敗しました');
    }
  };

  const handleUpdate = async (data: { name: string; muscle_group: string }) => {
    if (!editingExercise) return;
    try {
      await updateExercise(editingExercise.id, data);
      loadExercises();
      setEditingExercise(null);
    } catch (error) {
      console.error('Failed to update exercise:', error);
      alert('種目の更新に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この種目を削除しますか？関連するワークアウトも削除されます。')) return;
    try {
      await deleteExercise(id);
      loadExercises();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>種目管理</h1>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : '+ 種目を追加'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <ExerciseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingExercise && (
        <div style={styles.formContainer}>
          <ExerciseForm
            exercise={editingExercise}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExercise(null)}
          />
        </div>
      )}

      <div style={styles.filterContainer}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === '' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter('')}
        >
          すべて
        </button>
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            style={{
              ...styles.filterButton,
              ...(filter === group ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter(group)}
          >
            {group}
          </button>
        ))}
      </div>

      <div style={styles.exerciseList}>
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div key={exercise.id} style={styles.exerciseItem}>
              <div style={styles.exerciseInfo}>
                <span style={styles.exerciseName}>{exercise.name}</span>
                <span style={styles.muscleTag}>{exercise.muscle_group}</span>
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.editButton}
                  onClick={() => setEditingExercise(exercise)}
                >
                  編集
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(exercise.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.noData}>種目がありません</div>
        )}
      </div>
    </div>
  );
}

export default Exercises;
