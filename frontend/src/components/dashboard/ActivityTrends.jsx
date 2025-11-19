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

const ActivityTrends = ({ entries = [], range, onRangeChange }) => {
  const labels = entries.map(entry => format(new Date(entry.date), 'MMM dd'));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Calories',
        data: entries.map(entry => entry.calories || 0),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Steps',
        data: entries.map(entry => entry.steps || 0),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Calories'
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Steps'
        }
      }
    }
  };

  const ranges = [7, 14, 30];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Activity Trends</h2>
          <p className="card-subtitle">Calories vs. steps from your daily entries</p>
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
          <div className="empty-chart">Log your first entry to unlock trends</div>
        )}
      </div>
    </div>
  );
};

export default ActivityTrends;

