import './DashboardStats.css';

const DashboardStats = ({ summary }) => {
  const latest = summary?.latest;
  const averages = summary?.averages;

  if (!latest) {
    return (
      <div className="dashboard-stats-empty card">
        <p>Log your first wellness entry to see quick stats here.</p>
      </div>
    );
  }

  const cards = [
    {
      label: 'Calories',
      value: `${latest.calories?.toLocaleString?.() || latest.calories || 0} kcal`,
      sub: averages?.calories ? `Avg ${Math.round(averages.calories).toLocaleString()} kcal` : 'No history yet'
    },
    {
      label: 'Steps',
      value: `${latest.steps?.toLocaleString?.() || latest.steps || 0}`,
      sub: averages?.steps ? `Avg ${Math.round(averages.steps).toLocaleString()} steps` : 'No history yet'
    },
    {
      label: 'Water Intake',
      value: `${Number(latest.waterIntake || 0).toFixed(1)} L`,
      sub: averages?.waterIntake ? `Avg ${averages.waterIntake.toFixed(1)} L` : 'No history yet'
    },
    {
      label: 'Sleep',
      value: `${Number(latest.sleepHours || 0).toFixed(1)} hrs`,
      sub: averages?.sleepHours ? `Avg ${averages.sleepHours.toFixed(1)} hrs` : 'No history yet'
    }
  ];

  return (
    <div className="dashboard-stats">
      {cards.map(card => (
        <div key={card.label} className="stat-card">
          <h3>{card.label}</h3>
          <p className="stat-value">{card.value}</p>
          <span className="stat-subtext">{card.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;

