import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5066/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert('❌ Неверные данные для входа');
        return;
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem('token', token);

      // ✅ Проверяем Telegram
      const tgRes = await fetch('http://localhost:5066/api/auth/check-telegram', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tgData = await tgRes.json();
      if (!tgData.linked) {
        const tgLink = `https://t.me/notifierforexam_bot?start=${token}`;
        alert(`🔗 Привяжите Telegram: ${tgLink}`);
        window.open(tgLink, '_blank');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 shadow-2xl rounded-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-6 text-center flex items-center justify-center gap-2">
          🔐 Вход в систему
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            🚀 Войти
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </motion.div>
    </div>
  );
}