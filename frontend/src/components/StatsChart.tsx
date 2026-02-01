import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { WorkoutHistory, DailyVolume, MuscleVolume } from '../types';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  chartContainer: {
    width: '100%',
    height: 300,
  },
};

interface WeightChartProps {
  data: WorkoutHistory[];
  title: string;
}

export function WeightChart({ data, title }: WeightChartProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chartContainer}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
            <YAxis yAxisId="right" orientation="right" stroke="#4caf50" />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('ja-JP');
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              name="重量 (kg)"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ fill: '#1976d2' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              name="ボリューム"
              stroke="#4caf50"
              strokeWidth={2}
              dot={{ fill: '#4caf50' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface VolumeChartProps {
  data: DailyVolume[];
  title: string;
}

export function VolumeChart({ data, title }: VolumeChartProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('ja-JP');
              }}
              formatter={(value: number) => [value.toLocaleString(), 'ボリューム']}
            />
            <Bar dataKey="volume" name="ボリューム" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface MuscleVolumeChartProps {
  data: MuscleVolume[];
  title: string;
}

const MUSCLE_COLORS: Record<string, string> = {
  '胸': '#f44336',
  '背中': '#2196f3',
  '肩': '#ff9800',
  '腕': '#9c27b0',
  '脚': '#4caf50',
  '腹筋': '#795548',
};

export function MuscleVolumeChart({ data, title }: MuscleVolumeChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: MUSCLE_COLORS[item.muscle_group] || '#757575',
  }));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="muscle_group" type="category" width={60} />
            <Tooltip formatter={(value: number) => [value.toLocaleString(), 'ボリューム']} />
            <Bar dataKey="volume" name="ボリューム">
              {chartData.map((entry, index) => (
                <rect key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
