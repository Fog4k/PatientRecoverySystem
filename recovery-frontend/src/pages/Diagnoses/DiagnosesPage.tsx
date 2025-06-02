import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';

interface Diagnosis {
  id: number;
  patientId: number;
  condition: string;
  notes: string;
}

interface Patient {
  id: number;
  fullName: string;
}

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('token');

  const fetchDiagnoses = async () => {
    try {
      const res = await fetch('http://localhost:5066/api/diagnoses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDiagnoses(data);
    } catch (e) {
      console.error('Ошибка загрузки диагнозов:', e);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5066/api/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPatients(data);
      if (data.length > 0) setSelectedPatientId(data[0].id);
    } catch (e) {
      console.error('Ошибка загрузки пациентов(вы не доктор):', e);
    }
  };

  const handleAddDiagnosis = async () => {
    if (!selectedPatientId) {
      alert('Выберите пациента');
      return;
    }

    const newDiagnosis = {
      patientId: selectedPatientId,
      condition,
      notes,
    };

    try {
      const res = await fetch('http://localhost:5066/api/diagnoses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDiagnosis),
      });

      if (res.ok) {
        setCondition('');
        setNotes('');
        await fetchDiagnoses();
      } else {
        const err = await res.text();
        console.error('Диагноз error:', err);
        alert('Ошибка при добавлении диагноза: ' + err);
      }
    } catch (e) {
      console.error('Ошибка при добавлении:', e);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDiagnoses();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-extrabold mb-6 flex items-center gap-3 text-indigo-800">
          🧾 Диагнозы
        </h1>

        {/* Форма */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-xl mb-8 space-y-4 border"
        >
          <div>
            <label className="block mb-1 font-semibold">Пациент:</label>
            <select
              value={selectedPatientId ?? ''}
              onChange={(e) => setSelectedPatientId(parseInt(e.target.value))}
              className="w-full p-3 border rounded-xl shadow-sm"
            >
              <option disabled value="">
                Выберите пациента
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Состояние:</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-sm"
              placeholder="Например: Артериальная гипертензия"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Заметки:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-sm"
              placeholder="Дополнительная информация..."
            />
          </div>

          <button
            onClick={handleAddDiagnosis}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md"
          >
            ➕ Добавить диагноз
          </button>
        </motion.div>

        {/* Карточки диагнозов */}
        <div className="grid gap-6">
          {diagnoses.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all"
            >
              <div className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                🩺 {d.condition}
              </div>
              <div className="text-gray-700 mt-2 flex items-center gap-2">
                📝 {d.notes || '—'}
              </div>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                👤 Пациент ID: {d.patientId}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}