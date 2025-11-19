import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Welcome page
import WelcomePage from './components/welcome/WelcomePage';

// Auth pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User pages
import Dashboard from './components/dashboard/Dashboard';
import WorkoutPage from './components/workout/WorkoutPage';
import WorkoutSession from './components/workout/WorkoutSession';
import ExerciseLibrary from './components/exercise/ExerciseLibrary';
import ExerciseDetail from './components/exercise/ExerciseDetail';
import MetricsPage from './components/metrics/MetricsPage';
import ProfilePage from './components/profile/ProfilePage';
import SocialPage from './components/social/SocialPage';

// Admin pages
import AdminPanel from './components/admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Dashboard />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/workouts" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <WorkoutPage />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/workout-session/:id" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <WorkoutSession />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/exercises" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <ExerciseLibrary />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/exercises/:id" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <ExerciseDetail />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/metrics" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <MetricsPage />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/social" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <SocialPage />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <AdminPanel />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
        </div>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

