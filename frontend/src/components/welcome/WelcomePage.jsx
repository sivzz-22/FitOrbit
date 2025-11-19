import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './WelcomePage.css';

const WelcomePage = () => {
  const { theme } = useTheme();

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Your Fitness Journey Starts Here</span>
          </div>
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">FitOrbit</span>
          </h1>
          <p className="hero-subtitle">
            Your complete fitness companion for tracking workouts, monitoring progress, 
            achieving your health goals, and connecting with a community of fitness enthusiasts.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-hero-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-hero-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">💪</div>
            <h4>Track Workouts</h4>
            <p>Log your exercises and progress</p>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📊</div>
            <h4>Monitor Metrics</h4>
            <p>Track calories, steps, and more</p>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">👥</div>
            <h4>Connect & Compete</h4>
            <p>Join challenges with friends</p>
          </div>
        </div>
      </div>

      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏋️</div>
              <h3>Workout Library</h3>
              <p>Access hundreds of exercises with detailed instructions, muscle targeting, and difficulty levels. Create custom workout plans tailored to your goals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your fitness journey with comprehensive metrics including calories burned, steps taken, water intake, and sleep quality. Visualize your progress with beautiful charts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Challenges & Goals</h3>
              <p>Participate in community challenges, compete on leaderboards, and achieve your fitness milestones. Get motivated by seeing your friends' progress.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Social Hub</h3>
              <p>Connect with friends, join groups, share your achievements, and get support from the community. Chat, post updates, and celebrate wins together.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for both beginners and fitness enthusiasts. Track your workouts in seconds and access your data anywhere, anytime.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌙</div>
              <h3>Dark Mode</h3>
              <p>Comfortable viewing experience with beautiful dark and light themes. Customize your experience to match your preference.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Fitness Journey?</h2>
          <p>Join thousands of users who are already achieving their fitness goals with FitOrbit</p>
          <Link to="/register" className="btn btn-cta">
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;

