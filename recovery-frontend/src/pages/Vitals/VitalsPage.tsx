import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface VitalRecord {
  id: number;
  patientId: number;
  pulse: number;
  temperature: number;
  bloodPressure: string;
  recordedAt: string;
}

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [patientId, setPatientId] = useState<number>(0);
  const [pulse, setPulse] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [bloodPressure, setBloodPressure] = useState('');

  const token = localStorage.getItem('token');

  const fetchVitals = async () => {
    try {
      const res = await fetch('http://localhost:5066/api/vitalrecords', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setVitals(data);
      }
    } catch (e) {
      console.error('Ошибка при загрузке показателей:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleAddVital = async () => {
    const newRecord = {
      patientId,
      pulse,
      temperature,
      bloodPressure,
    };

    const res = await fetch('http://localhost:5066/api/vitalrecords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newRecord),
    });

    if (res.ok) {
      setPatientId(0);
      setPulse(0);
      setTemperature(0);
      setBloodPressure('');
      await fetchVitals();
    } else {
      const err = await res.text();
      alert('Ошибка при добавлении показателя: ' + err);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
          📋 Показатели
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4 border">
          <h2 className="text-xl font-semibold text-gray-700">➕ Новый показатель</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="ID пациента"
              value={patientId}
              onChange={(e) => setPatientId(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Пульс"
              value={pulse}
              onChange={(e) => setPulse(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Температура"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Давление (например 120/80)"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleAddVital}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить показатель
          </button>
        </div>

        {loading ? (
          <Skeleton count={4} height={80} />
        ) : vitals.length === 0 ? (
          <p>Нет данных.</p>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-lg font-semibold mb-4">📈 График температуры</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vitals.slice(-10)}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="recordedAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${v} °C`} labelFormatter={(v) => `🕒 ${new Date(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-6">
              {vitals.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow p-6 space-y-2 border"
                >
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">👤 Пациент ID: {v.patientId}</span>
                    <span className="text-sm text-gray-500">{new Date(v.recordedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-6 mt-2 text-gray-800 text-sm">
                    <VitalItem icon="❤️" label="Пульс" value={`${v.pulse} уд/мин`} />
                    <VitalItem icon="🌡️" label="Температура" value={`${v.temperature} °C`} />
                    <VitalItem icon="🩺" label="Давление" value={v.bloodPressure} />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VitalItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
}