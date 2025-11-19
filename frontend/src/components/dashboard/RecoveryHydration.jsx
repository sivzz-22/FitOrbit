import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RecoveryHydration = ({ entries = [], range, onRangeChange }) => {
  const labels = entries.map(entry => format(new Date(entry.date), 'MMM dd'));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Water Intake (L)',
        data: entries.map(entry => entry.waterIntake || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Sleep (hrs)',
        data: entries.map(entry => entry.sleepHours || 0),
        borderColor: '#a855f7',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10
      }
    }
  };

  const ranges = [7, 14, 30];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Hydration & Recovery</h2>
          <p className="card-subtitle">Sleep and water balance across your logs</p>
        </div>
        <div className="chart-controls">
          {ranges.map(value => (
            <button
              key={value}
              className={range === value ? 'active' : ''}
              onClick={() => onRangeChange(value)}
            >
              {value}d
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: '320px', marginTop: '1rem' }}>
        {entries.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="empty-chart">Keep logging to see hydration insights</div>
        )}
      </div>
    </div>
  );
};

export default RecoveryHydration;

