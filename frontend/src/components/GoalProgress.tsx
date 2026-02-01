import type { Goal } from '../types';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '15px',
    marginBottom: '15px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: '16px',
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
  achievedBadge: {
    padding: '4px 12px',
    backgroundColor: '#4caf50',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
  },
  target: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '10px',
  },
  progressContainer: {
    marginBottom: '5px',
  },
  progressBar: {
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  deadline: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  button: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  completeButton: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
  },
};

interface Props {
  goal: Goal;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function GoalProgress({ goal, onComplete, onDelete }: Props) {
  const progress = goal.progress || 0;
  const progressColor = goal.achieved
    ? '#4caf50'
    : progress >= 80
    ? '#ff9800'
    : '#1976d2';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.exerciseName}>
          {goal.exercise_name}
          <span style={styles.muscleTag}>{goal.muscle_group}</span>
        </span>
        {goal.achieved && <span style={styles.achievedBadge}>達成!</span>}
      </div>
      <div style={styles.target}>
        目標: {goal.target_weight}kg × {goal.target_reps}レップ
      </div>
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        <div style={styles.progressText}>
          <span>現在: {goal.current_max || 0}kg</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>
      {goal.deadline && (
        <div style={styles.deadline}>
          期限: {new Date(goal.deadline).toLocaleDateString('ja-JP')}
        </div>
      )}
      {(onComplete || onDelete) && !goal.achieved && (
        <div style={styles.actions}>
          {onComplete && (
            <button
              style={{ ...styles.button, ...styles.completeButton }}
              onClick={() => onComplete(goal.id)}
            >
              達成
            </button>
          )}
          {onDelete && (
            <button
              style={{ ...styles.button, ...styles.deleteButton }}
              onClick={() => onDelete(goal.id)}
            >
              削除
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default GoalProgress;
