import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Nurse');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch(
        `http://localhost:5066/api/auth/register?username=${username}&password=${password}&role=${role}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setMessage('✅ Успешно зарегистрировано!');
        setUsername('');
        setPassword('');
        setRole('Nurse');
      } else {
        const error = await response.text();
        setMessage(`❌ Ошибка: ${error}`);
      }
    } catch {
      setMessage('❌ Не удалось подключиться к серверу.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 shadow-2xl rounded-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center flex items-center justify-center gap-2">
          📝 Регистрация
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="Nurse">Медсестра</option>
            <option value="Doctor">Доктор</option>
            <option value="System">Системный пользователь</option>
          </select>

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            🚀 Зарегистрироваться
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link to="/" className="text-green-600 hover:underline font-medium">
            Войти
          </Link>
        </p>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}