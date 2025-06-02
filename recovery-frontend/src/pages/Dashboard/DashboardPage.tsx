import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import PatientsTable from '../../components/PatientsTable';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<null | {
    patients: number;
    diagnoses: number;
    vitals: number;
    logs: number;
  }>(null);

  const [chartData, setChartData] = useState<{ date: string; patients: number }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchCount = async (endpoint: string): Promise<number> => {
      try {
        const res = await fetch(`http://localhost:5066/api/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Ошибка запроса: ${endpoint}`);
        const data = await res.json();
        return Array.isArray(data) ? data.length : 0;
      } catch (err) {
        console.error(`Ошибка при загрузке ${endpoint}:`, err);
        return 0;
      }
    };

    const loadStats = async () => {
      const [patients, diagnoses, vitals, logs] = await Promise.all([
        fetchCount('patients'),
        fetchCount('diagnoses'),
        fetchCount('vitalrecords'),
        fetchCount('rehabilitationlogs'),
      ]);

      setStats({ patients, diagnoses, vitals, logs });

      setChartData([
        { date: 'Пн', patients: patients - 4 },
        { date: 'Вт', patients: patients - 2 },
        { date: 'Ср', patients: patients - 1 },
        { date: 'Чт', patients: patients - 3 },
        { date: 'Пт', patients: patients },
      ]);
    };

    loadStats();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
          📊 Обзор панели
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Пациенты" value={stats?.patients} color="blue" />
          <StatCard title="Диагнозы" value={stats?.diagnoses} color="green" />
          <StatCard title="Показатели" value={stats?.vitals} color="indigo" />
          <StatCard title="Реабилитация" value={stats?.logs} color="purple" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📈 График посещений</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Диагнозы по дням</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🧬 Распределение данных</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Пациенты', value: stats?.patients || 0 },
                  { name: 'Диагнозы', value: stats?.diagnoses || 0 },
                  { name: 'Показатели', value: stats?.vitals || 0 },
                  { name: 'Реабилитация', value: stats?.logs || 0 },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#6366f1"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8">
          <PatientsTable />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl bg-${color}-100 text-${color}-800 shadow-lg flex flex-col justify-center`}
    >
      <div className="text-sm font-semibold mb-1 text-gray-700">{title}</div>
      <div className="text-2xl font-extrabold">
        {value !== undefined ? value : <Skeleton width={40} />}
      </div>
    </motion.div>
  );
}