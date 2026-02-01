import { useState, useEffect } from 'react';
import type { Exercise, ExerciseStats, VolumeStats, PersonalRecord } from '../types';
import { getExercises, getExerciseStats, getVolumeStats, getPersonalRecords } from '../api/client';
import { WeightChart, VolumeChart, MuscleVolumeChart } from '../components/StatsChart';

const styles = {
  container: {
    maxWidth: '1200px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    marginTop: '30px',
  },
  periodSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  periodButton: {
    padding: '8px 20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  periodButtonActive: {
    backgroundColor: '#1976d2',
    color: 'white',
    borderColor: '#1976d2',
  },
  exerciseSelector: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minWidth: '200px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  recordsTable: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderCollapse: 'collapse' as const,
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
};

function Stats() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number>(0);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);
  const [volumeStats, setVolumeStats] = useState<VolumeStats | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadExercises();
    loadVolumeStats();
    loadPersonalRecords();
  }, []);

  useEffect(() => {
    loadVolumeStats();
  }, [period]);

  useEffect(() => {
    if (selectedExerciseId > 0) {
      loadExerciseStats();
    }
  }, [selectedExerciseId]);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
      if (data.length > 0) {
        setSelectedExerciseId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const loadExerciseStats = async () => {
    try {
      const data = await getExerciseStats(selectedExerciseId);
      setExerciseStats(data);
    } catch (error) {
      console.error('Failed to load exercise stats:', error);
    }
  };

  const loadVolumeStats = async () => {
    try {
      const data = await getVolumeStats(period);
      setVolumeStats(data);
    } catch (error) {
      console.error('Failed to load volume stats:', error);
    }
  };

  const loadPersonalRecords = async () => {
    try {
      const data = await getPersonalRecords();
      setPersonalRecords(data);
    } catch (error) {
      console.error('Failed to load personal records:', error);
    }
  };

  const periodLabels = {
    week: '週間',
    month: '月間',
    year: '年間',
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>統計</h1>

      <h2 style={styles.sectionTitle}>ボリューム統計</h2>
      <div style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            style={{
              ...styles.periodButton,
              ...(period === p ? styles.periodButtonActive : {}),
            }}
            onClick={() => setPeriod(p)}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {volumeStats && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {volumeStats.total_volume.toLocaleString()}
              </div>
              <div style={styles.statLabel}>{periodLabels[period]}ボリューム</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {volumeStats.daily.length}
              </div>
              <div style={styles.statLabel}>トレーニング日数</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {volumeStats.by_muscle.length}
              </div>
              <div style={styles.statLabel}>筋肉グループ数</div>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <VolumeChart data={volumeStats.daily} title="日別ボリューム" />
            <MuscleVolumeChart data={volumeStats.by_muscle} title="筋肉グループ別ボリューム" />
          </div>
        </>
      )}

      <h2 style={styles.sectionTitle}>種目別統計</h2>
      <div style={styles.exerciseSelector}>
        <label style={{ fontWeight: 'bold' }}>種目:</label>
        <select
          style={styles.select}
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.muscle_group})
            </option>
          ))}
        </select>
      </div>

      {exerciseStats && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{exerciseStats.max_weight}kg</div>
              <div style={styles.statLabel}>最高重量</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{exerciseStats.total_sets}</div>
              <div style={styles.statLabel}>総セット数</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {exerciseStats.total_volume.toLocaleString()}
              </div>
              <div style={styles.statLabel}>総ボリューム</div>
            </div>
          </div>

          {exerciseStats.history.length > 0 && (
            <WeightChart data={exerciseStats.history} title="重量推移" />
          )}
        </>
      )}

      <h2 style={styles.sectionTitle}>自己ベスト記録</h2>
      {personalRecords.length > 0 ? (
        <table style={styles.recordsTable}>
          <thead>
            <tr>
              <th style={styles.th}>種目</th>
              <th style={styles.th}>最高重量</th>
              <th style={styles.th}>レップ数</th>
              <th style={styles.th}>達成日</th>
            </tr>
          </thead>
          <tbody>
            {personalRecords.map((record) => (
              <tr key={record.exercise_id}>
                <td style={styles.td}>
                  {record.exercise_name}
                  <span style={styles.muscleTag}>{record.muscle_group}</span>
                </td>
                <td style={styles.td}>{record.max_weight}kg</td>
                <td style={styles.td}>{record.max_reps}回</td>
                <td style={styles.td}>
                  {record.date
                    ? new Date(record.date).toLocaleDateString('ja-JP')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          まだ記録がありません
        </div>
      )}
    </div>
  );
}

export default Stats;
