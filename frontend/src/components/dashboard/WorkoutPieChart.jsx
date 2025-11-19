import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const WorkoutPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        No workout data available. Complete some workouts to see the distribution.
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.section),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => item.color || '#4a90e2'),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', marginTop: '1rem' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default WorkoutPieChart;

