import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>FitOrbit</h3>
          <p>Your complete fitness companion for tracking workouts, monitoring progress, and achieving your health goals.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/workouts">Workouts</a></li>
            <li><a href="/exercises">Exercises</a></li>
            <li><a href="/metrics">Metrics</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Get In Touch</h4>
          <p>support@fitorbit.com</p>
          <p>Serving fitness enthusiasts worldwide</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FitOrbit. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

