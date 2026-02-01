import { useState, useEffect } from 'react';
import type { Goal, Exercise } from '../types';
import { getGoals, createGoal, updateGoal, deleteGoal, getExercises } from '../api/client';
import GoalProgress from '../components/GoalProgress';

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
  form: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
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
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  noData: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  achievedSection: {
    opacity: 0.7,
  },
};

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [exerciseId, setExerciseId] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [targetReps, setTargetReps] = useState<number>(1);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    loadGoals();
    loadExercises();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

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
    if (exerciseId === 0 || targetWeight <= 0) return;

    try {
      await createGoal({
        exercise_id: exerciseId,
        target_weight: targetWeight,
        target_reps: targetReps,
        deadline: deadline || undefined,
      });
      setTargetWeight(0);
      setTargetReps(1);
      setDeadline('');
      setShowForm(false);
      loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('目標の作成に失敗しました');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await updateGoal(id, { achieved: true });
      loadGoals();
    } catch (error) {
      console.error('Failed to complete goal:', error);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この目標を削除しますか？')) return;
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('削除に失敗しました');
    }
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) => g.achieved);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>目標設定</h1>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : '+ 目標を追加'}
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
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
              <label style={styles.label}>目標重量 (kg)</label>
              <input
                type="number"
                style={styles.input}
                value={targetWeight || ''}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                min="0"
                step="0.5"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>目標レップ数</label>
              <input
                type="number"
                style={styles.input}
                value={targetReps}
                onChange={(e) => setTargetReps(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>期限</label>
              <input
                type="date"
                style={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              目標を作成
            </button>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>進行中の目標 ({activeGoals.length})</h2>
        {activeGoals.length > 0 ? (
          activeGoals.map((goal) => (
            <GoalProgress
              key={goal.id}
              goal={goal}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div style={styles.noData}>進行中の目標がありません</div>
        )}
      </div>

      {achievedGoals.length > 0 && (
        <div style={{ ...styles.section, ...styles.achievedSection }}>
          <h2 style={styles.sectionTitle}>達成した目標 ({achievedGoals.length})</h2>
          {achievedGoals.map((goal) => (
            <GoalProgress key={goal.id} goal={goal} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Goals;
