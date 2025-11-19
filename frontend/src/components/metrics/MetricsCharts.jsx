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
import './MetricsCharts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const metricConfigs = [
  { key: 'calories', label: 'Calories', suffix: 'kcal', color: '#f97316' },
  { key: 'steps', label: 'Steps', suffix: 'steps', color: '#0ea5e9' },
  { key: 'waterIntake', label: 'Water Intake', suffix: 'L', color: '#3b82f6', decimals: 1 },
  { key: 'sleepHours', label: 'Sleep', suffix: 'hrs', color: '#a855f7', decimals: 1 }
];

const MetricsCharts = ({ metrics, onEdit, onDelete }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="no-metrics card">
        <p>No wellness metrics yet. Add an entry to see personalized charts.</p>
      </div>
    );
  }

  const normalized = metrics.map(entry => ({
    ...entry,
    calories: Number(entry.calories || 0),
    steps: Number(entry.steps || 0),
    waterIntake: Number(entry.waterIntake || 0),
    sleepHours: Number(entry.sleepHours || 0)
  }));

  const labels = normalized.map(m => format(new Date(m.date), 'MMM dd'));
  const latest = normalized[normalized.length - 1];

  const average = (key, decimals = 0) => {
    const value = normalized.reduce((sum, entry) => sum + entry[key], 0) / normalized.length;
    return decimals ? value.toFixed(decimals) : Math.round(value);
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="metrics-charts">
      <div className="metric-chart-grid">
        {metricConfigs.map(config => (
          <div key={config.key} className="metric-chart-card card">
            <div className="metric-card-header">
              <div>
                <p className="metric-eyebrow">{config.label}</p>
                <h3>
                  {config.decimals
                    ? Number(latest[config.key] || 0).toFixed(config.decimals)
                    : latest[config.key] || 0}{' '}
                  <span>{config.suffix}</span>
                </h3>
                <p className="metric-average">
                  Avg {average(config.key, config.decimals || 0)} {config.suffix}
                </p>
              </div>
            </div>
            <div className="metric-mini-chart">
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: config.label,
                      data: normalized.map(entry => entry[config.key]),
                      borderColor: config.color,
                      backgroundColor: config.color + '22',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={baseOptions}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="metrics-table card">
        <h3>Recent Entries</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Calories</th>
              <th>Steps</th>
              <th>Water (L)</th>
              <th>Sleep (hrs)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {normalized.slice().reverse().map(metric => (
              <tr key={metric._id}>
                <td>{format(new Date(metric.date), 'MMM dd, yyyy')}</td>
                <td>{metric.calories.toLocaleString()}</td>
                <td>{metric.steps.toLocaleString()}</td>
                <td>{metric.waterIntake.toFixed(1)}</td>
                <td>{metric.sleepHours.toFixed(1)}</td>
                <td className="notes-cell">{metric.notes || '—'}</td>
                <td>
                  <button className="btn-link" onClick={() => onEdit(metric)}>
                    Edit
                  </button>
                  {' | '}
                  <button
                    className="btn-link btn-link-danger"
                    onClick={() => onDelete(metric._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetricsCharts;

