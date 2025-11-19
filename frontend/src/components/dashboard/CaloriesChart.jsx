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

const CaloriesChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Calories Burned',
        data: data.map(item => item.calories),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 100
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', marginTop: '1rem' }}>
      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          No data available for the selected period
        </div>
      )}
    </div>
  );
};

export default CaloriesChart;

