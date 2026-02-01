import { useState, useEffect } from 'react';
import type { Workout, Goal, VolumeStats } from '../types';
import { getWorkouts, getGoals, getVolumeStats } from '../api/client';
import WorkoutLog from '../components/WorkoutLog';
import GoalProgress from '../components/GoalProgress';
import Reminder from '../components/Reminder';

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  dateInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  statItem: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  noData: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '20px',
  },
};

function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [volumeStats, setVolumeStats] = useState<VolumeStats | null>(null);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    try {
      const [workoutsData, goalsData, volumeData] = await Promise.all([
        getWorkouts({ date }),
        getGoals(),
        getVolumeStats('week'),
      ]);
      setWorkouts(workoutsData);
      setGoals(goalsData.filter((g) => !g.achieved).slice(0, 3));
      setVolumeStats(volumeData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const todayVolume = workouts
    .filter((w) => w.date === date)
    .reduce((sum, w) => sum + w.sets * w.reps * w.weight, 0);

  const todayExercises = new Set(workouts.filter((w) => w.date === date).map((w) => w.exercise_id)).size;

  return (
    <div>
      <div style={styles.dateSelector}>
        <label style={{ fontWeight: 'bold' }}>日付:</label>
        <input
          type="date"
          style={styles.dateInput}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div style={styles.container}>
        <div>
          <WorkoutLog date={date} workouts={workouts} onWorkoutAdded={loadData} />
        </div>

        <div>
          <div style={styles.card}>
            <h2 style={styles.title}>今日のサマリー</h2>
            <div style={styles.statGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{todayExercises}</div>
                <div style={styles.statLabel}>種目数</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {workouts.filter((w) => w.date === date).length}
                </div>
                <div style={styles.statLabel}>セット数</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{todayVolume.toLocaleString()}</div>
                <div style={styles.statLabel}>ボリューム</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {volumeStats ? volumeStats.total_volume.toLocaleString() : '-'}
                </div>
                <div style={styles.statLabel}>週間ボリューム</div>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h2 style={styles.title}>進行中の目標</h2>
            {goals.length > 0 ? (
              goals.map((goal) => <GoalProgress key={goal.id} goal={goal} />)
            ) : (
              <div style={styles.noData}>目標がありません</div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <Reminder />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
