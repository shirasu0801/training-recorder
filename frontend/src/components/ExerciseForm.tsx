import { useState } from 'react';
import type { Exercise } from '../types';
import { MUSCLE_GROUPS } from '../types';

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    padding: '12px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '12px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
};

interface Props {
  exercise?: Exercise;
  onSubmit: (data: { name: string; muscle_group: string }) => void;
  onCancel?: () => void;
}

function ExerciseForm({ exercise, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(exercise?.name || '');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscle_group || MUSCLE_GROUPS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), muscle_group: muscleGroup });
      if (!exercise) {
        setName('');
      }
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>種目名</label>
        <input
          type="text"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: ベンチプレス"
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>筋肉グループ</label>
        <select
          style={styles.select}
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
        >
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.button}>
          {exercise ? '更新' : '追加'}
        </button>
        {onCancel && (
          <button type="button" style={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}

export default ExerciseForm;
