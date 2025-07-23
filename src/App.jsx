import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import RegistrationPage from './pages/RegistrationPage.jsx';
import Login from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout';
import ForgotPassword from './pages/ForgotPassword';
import DashboardPage from './pages/DashboardPage';
import Courses from './pages/Courses';
import Progress from './pages/Progress';
import ProtectedRoute from './components/ProtectedRoute';
import CourseDetails from './pages/CourseDetails';
import Events from './pages/Events';
import NotificationBell from './components/NotificationBell';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage.jsx';
import BatchAdmin from './pages/BatchAdmin';
import Enrollments from './pages/Enrollments.jsx';
import Users from './pages/Users.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#311188',
    },
  },
});

function AppRoutes({ isLoggedIn, setIsLoggedIn, showSplash, setShowSplash }) {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowSplash(true);
    navigate('/'); // Always go to root to trigger splash
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Layout>
                <Login onLoginSuccess={handleLoginSuccess} />
              </Layout>
            ) : showSplash ? (
              <LandingPage onComplete={handleSplashComplete} />
            ) : (
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route path="/register" element={<Layout><RegistrationPage /></Layout>} />
        <Route path="/login" element={<Layout><Login onLoginSuccess={handleLoginSuccess} /></Layout>} />
        <Route path="/forgotpassword" element={<Layout><ForgotPassword /></Layout>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Courses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CourseDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Progress />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BatchAdmin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Enrollments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setShowSplash(true);
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AppRoutes
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          showSplash={showSplash}
          setShowSplash={setShowSplash}
        />
        <ToastContainer />
      </ThemeProvider>
    </Router>
  );
}

export default App;