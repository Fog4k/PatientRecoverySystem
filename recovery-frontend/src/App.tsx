import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PatientsPage from './pages/Patients/PatientsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import VitalsPage from './pages/Vitals/VitalsPage';
import DiagnosesPage from './pages/Diagnoses/DiagnosesPage';
import RehabilitationPage from './pages/Rehabilitation/RehabilitationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/diagnoses" element={<DiagnosesPage />} />
        <Route path="/rehab" element={<RehabilitationPage />} />
      </Routes>
    </BrowserRouter>
  );
}