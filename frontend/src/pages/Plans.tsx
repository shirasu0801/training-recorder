import { useState, useEffect } from 'react';
import type { Plan, Exercise, PlanExercise } from '../types';
import { getPlans, getPlan, createPlan, deletePlan, getExercises, createWorkout } from '../api/client';

const styles = {
  container: {
    maxWidth: '1000px',
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
  planList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
  },
  planName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  planDescription: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
  },
  exerciseList: {
    marginBottom: '15px',
  },
  exerciseItem: {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  muscleTag: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '10px',
    fontSize: '10px',
    marginLeft: '8px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  startButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1,
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minHeight: '80px',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  exerciseSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto auto',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  smallInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    width: '80px',
  },
  addExerciseButton: {
    padding: '8px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '6px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  noData: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
  },
  workoutModal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  workoutItem: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
};

interface PlanExerciseInput {
  exercise_id: number;
  target_sets: number;
  target_reps: number;
}

interface WorkoutInput {
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
}

function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [workoutInputs, setWorkoutInputs] = useState<WorkoutInput[]>([]);

  // Form state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planExercises, setPlanExercises] = useState<PlanExerciseInput[]>([]);

  useEffect(() => {
    loadPlans();
    loadExercises();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getPlans();
      const plansWithExercises = await Promise.all(
        data.map(async (plan) => {
          const fullPlan = await getPlan(plan.id);
          return fullPlan;
        })
      );
      setPlans(plansWithExercises);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleAddExercise = () => {
    if (exercises.length === 0) return;
    setPlanExercises([
      ...planExercises,
      { exercise_id: exercises[0].id, target_sets: 3, target_reps: 10 },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setPlanExercises(planExercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (
    index: number,
    field: keyof PlanExerciseInput,
    value: number
  ) => {
    const updated = [...planExercises];
    updated[index] = { ...updated[index], [field]: value };
    setPlanExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    try {
      await createPlan({
        name: planName.trim(),
        description: planDescription.trim(),
        exercises: planExercises.map((ex, index) => ({
          ...ex,
          order_index: index + 1,
        })),
      });
      setPlanName('');
      setPlanDescription('');
      setPlanExercises([]);
      setShowForm(false);
      loadPlans();
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('プランの作成に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このプランを削除しますか？')) return;
    try {
      await deletePlan(id);
      loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('削除に失敗しました');
    }
  };

  const handleStartPlan = (plan: Plan) => {
    if (!plan.exercises || plan.exercises.length === 0) {
      alert('このプランには種目がありません');
      return;
    }
    setActivePlan(plan);
    setWorkoutInputs(
      plan.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name || '',
        sets: ex.target_sets,
        reps: ex.target_reps,
        weight: 0,
      }))
    );
  };

  const handleWorkoutInputChange = (
    index: number,
    field: keyof WorkoutInput,
    value: number
  ) => {
    const updated = [...workoutInputs];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutInputs(updated);
  };

  const handleSaveWorkouts = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      for (const workout of workoutInputs) {
        if (workout.weight > 0) {
          await createWorkout({
            exercise_id: workout.exercise_id,
            date: today,
            sets: workout.sets,
            reps: workout.reps,
            weight: workout.weight,
          });
        }
      }
      setActivePlan(null);
      setWorkoutInputs([]);
      alert('ワークアウトを記録しました');
    } catch (error) {
      console.error('Failed to save workouts:', error);
      alert('記録に失敗しました');
    }
  };

  const getExerciseName = (id: number) => {
    const ex = exercises.find((e) => e.id === id);
    return ex ? `${ex.name} (${ex.muscle_group})` : '';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ワークアウトプラン</h1>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : '+ プランを作成'}
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>プラン名</label>
            <input
              type="text"
              style={styles.input}
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="例: 胸の日"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>説明</label>
            <textarea
              style={styles.textarea}
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="オプション"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>種目</label>
            {planExercises.map((ex, index) => (
              <div key={index} style={styles.exerciseSelector}>
                <select
                  style={styles.select}
                  value={ex.exercise_id}
                  onChange={(e) =>
                    handleExerciseChange(index, 'exercise_id', Number(e.target.value))
                  }
                >
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} ({exercise.muscle_group})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  style={styles.smallInput}
                  value={ex.target_sets}
                  onChange={(e) =>
                    handleExerciseChange(index, 'target_sets', Number(e.target.value))
                  }
                  min="1"
                  placeholder="セット"
                />
                <input
                  type="number"
                  style={styles.smallInput}
                  value={ex.target_reps}
                  onChange={(e) =>
                    handleExerciseChange(index, 'target_reps', Number(e.target.value))
                  }
                  min="1"
                  placeholder="レップ"
                />
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() => handleRemoveExercise(index)}
                >
                  x
                </button>
              </div>
            ))}
            <button
              type="button"
              style={styles.addExerciseButton}
              onClick={handleAddExercise}
            >
              + 種目を追加
            </button>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              プランを作成
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

      {plans.length > 0 ? (
        <div style={styles.planList}>
          {plans.map((plan) => (
            <div key={plan.id} style={styles.planCard}>
              <div style={styles.planName}>{plan.name}</div>
              {plan.description && (
                <div style={styles.planDescription}>{plan.description}</div>
              )}
              <div style={styles.exerciseList}>
                {plan.exercises?.map((ex: PlanExercise) => (
                  <div key={ex.id} style={styles.exerciseItem}>
                    {ex.exercise_name}
                    <span style={styles.muscleTag}>{ex.muscle_group}</span>
                    <span style={{ color: '#666', marginLeft: '10px' }}>
                      {ex.target_sets}×{ex.target_reps}
                    </span>
                  </div>
                ))}
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.startButton}
                  onClick={() => handleStartPlan(plan)}
                >
                  このプランで開始
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(plan.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noData}>プランがありません</div>
      )}

      {activePlan && (
        <div style={styles.workoutModal}>
          <div style={styles.modalContent}>
            <div style={styles.modalTitle}>{activePlan.name} - ワークアウト入力</div>
            {workoutInputs.map((input, index) => (
              <div key={index} style={styles.workoutItem}>
                <span style={{ fontWeight: 'bold' }}>{input.exercise_name}</span>
                <input
                  type="number"
                  style={styles.smallInput}
                  value={input.sets}
                  onChange={(e) =>
                    handleWorkoutInputChange(index, 'sets', Number(e.target.value))
                  }
                  min="1"
                  placeholder="セット"
                />
                <input
                  type="number"
                  style={styles.smallInput}
                  value={input.reps}
                  onChange={(e) =>
                    handleWorkoutInputChange(index, 'reps', Number(e.target.value))
                  }
                  min="1"
                  placeholder="レップ"
                />
                <input
                  type="number"
                  style={styles.smallInput}
                  value={input.weight || ''}
                  onChange={(e) =>
                    handleWorkoutInputChange(index, 'weight', Number(e.target.value))
                  }
                  min="0"
                  step="0.5"
                  placeholder="kg"
                />
              </div>
            ))}
            <div style={styles.buttonGroup}>
              <button style={styles.submitButton} onClick={handleSaveWorkouts}>
                記録を保存
              </button>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setActivePlan(null);
                  setWorkoutInputs([]);
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plans;
