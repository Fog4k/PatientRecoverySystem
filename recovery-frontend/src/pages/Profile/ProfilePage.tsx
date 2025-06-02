import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';

type DecodedToken = {
  name: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
};

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUsername(decoded.name);
      const roleField = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      setRole(Array.isArray(roleField) ? roleField[0] : roleField);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <Sidebar />

      <div className="flex-1 p-10 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto"
        >
          <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 flex items-center gap-2">
            🙍‍♂️ Профиль
          </h1>

          <div className="space-y-4 text-gray-700 text-lg">
            <div>
              <span className="font-semibold">Имя пользователя:</span> {username}
            </div>
            <div>
              <span className="font-semibold">Роль:</span> {role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            🚪 Выйти
          </button>
        </motion.div>
      </div>
    </div>
  );
}