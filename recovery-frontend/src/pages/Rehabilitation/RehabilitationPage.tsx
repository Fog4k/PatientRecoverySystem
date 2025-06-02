import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface RehabLog {
  id: number;
  patientId: number;
  description: string;
  timestamp: string;
}

export default function RehabilitationPage() {
  const [logs, setLogs] = useState<RehabLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterId, setFilterId] = useState<number | ''>('');
  const [patientId, setPatientId] = useState<number>(0);
  const [description, setDescription] = useState('');

  const token = localStorage.getItem('token');

  const fetchLogs = async () => {
    try {
      let url = 'http://localhost:5066/api/rehabilitationlogs';
      if (filterId) {
        url += `?patientId=${filterId}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Ошибка при загрузке логов:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterId]);

  const handleAddLog = async () => {
    const newLog = { patientId, description };

    const res = await fetch('http://localhost:5066/api/rehabilitationlogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newLog),
    });

    if (res.ok) {
      setPatientId(0);
      setDescription('');
      await fetchLogs();
    } else {
      const err = await res.text();
      alert('Ошибка при добавлении лога: ' + err);
    }
  };

  const chartData = logs.map((log) => ({
    name: `ID ${log.patientId}`,
    length: log.description?.length ?? 0,
  }));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-extrabold mb-6 flex items-center gap-2 text-indigo-800">
          💪 Реабилитация
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">📤 Добавить запись</h2>
          <input
            type="number"
            placeholder="ID пациента"
            value={patientId}
            onChange={(e) => setPatientId(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <textarea
            placeholder="Описание реабилитации"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <button
            onClick={handleAddLog}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            ➕ Добавить
          </button>
        </motion.div>

        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow mb-10"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 Длина описаний</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="length" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {loading ? (
          <Skeleton count={4} height={120} className="mb-4" />
        ) : logs.length === 0 ? (
          <p className="text-gray-500 italic">Нет записей.</p>
        ) : (
          <ul className="grid gap-6">
            {logs.map((log) => (
              <motion.li
                key={log.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="text-indigo-700 font-semibold mb-2">👤 Пациент ID: {log.patientId}</div>
                <div className="text-gray-800 mb-1">📝 {log.description}</div>
                <div className="text-sm text-gray-500">🕒 {new Date(log.timestamp).toLocaleString()}</div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}