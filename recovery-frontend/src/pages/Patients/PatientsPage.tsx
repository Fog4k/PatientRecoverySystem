import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  contactNumber: string;
  address: string;
  doctorId: number | null;
}

interface Doctor {
  id: number;
  username: string;
}

type DecodedToken = {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  const token = localStorage.getItem('token');
  let userRole = '';

  if (token) {
    const decoded: DecodedToken = jwtDecode(token);
    const roleField = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    userRole = Array.isArray(roleField) ? roleField[0] : roleField;
  }

  const fetchPatients = async () => {
    try {
      let url = 'http://localhost:5066/api/patients';
      if (selectedDoctorId !== 'all') {
        url += `?doctorId=${selectedDoctorId}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error('Ошибка при загрузке пациентов:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5066/api/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (e) {
      console.error('Ошибка при загрузке докторов:', e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedDoctorId]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddPatient = async () => {
    const newPatient = { fullName, birthDate, contactNumber, address };

    const res = await fetch('http://localhost:5066/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newPatient),
    });

    if (res.ok) {
      setFullName('');
      setBirthDate('');
      setContactNumber('');
      setAddress('');
      await fetchPatients();
      setShowForm(false);
    } else {
      const err = await res.text();
      alert('Ошибка при добавлении пациента: ' + err);
    }
  };

  const handleReassign = async (patientId: number, newDoctorId: number) => {
    const res = await fetch(`http://localhost:5066/api/patients/${patientId}/assign?doctorId=${newDoctorId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await fetchPatients();
    } else {
      const err = await res.text();
      alert('Ошибка при назначении врача: ' + err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить пациента?')) return;

    const res = await fetch(`http://localhost:5066/api/patients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await fetchPatients();
    } else {
      const err = await res.text();
      alert('Ошибка при удалении пациента: ' + err);
    }
  };

  const chartData = doctors.map((doc) => ({
    name: doc.username,
    count: patients.filter((p) => p.doctorId === doc.id).length,
  }));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">🧑‍⚕️ Пациенты</h1>

        {userRole === 'Admin' && (
          <div className="mb-6 flex items-center gap-4">
            <label className="font-semibold">Фильтр по врачу:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) =>
                setSelectedDoctorId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
              }
              className="p-2 border rounded"
            >
              <option value="all">Все</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.username}
                </option>
              ))}
            </select>
          </div>
        )}

        <ResponsiveContainer width="100%" height={300} className="mb-10">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showForm ? 'Скрыть форму' : '➕ Добавить пациента'}
        </button>

        {showForm && (
          <div className="bg-white p-4 rounded-xl shadow mb-8 space-y-3 border">
            <input
              type="text"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Телефон"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Адрес"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleAddPatient}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Добавить пациента
            </button>
          </div>
        )}

        {loading ? (
          <Skeleton count={4} height={100} />
        ) : patients.length === 0 ? (
          <p>Пациентов нет.</p>
        ) : (
          <div className="grid gap-6">
            {patients.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all"
              >
                <div className="text-lg font-bold text-blue-700">{p.fullName}</div>
                <div className="text-sm text-gray-700 mt-2">
                  🆔 ID: {p.id} <br />
                  📞 {p.contactNumber} <br />
                  🎂 {new Date(p.birthDate).toLocaleDateString()} <br />
                  📍 {p.address} <br />
                  👨‍⚕️ Доктор ID: {p.doctorId ?? '—'}
                </div>

                {userRole === 'Admin' && (
                  <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                    <select
                      onChange={(e) => handleReassign(p.id, parseInt(e.target.value))}
                      defaultValue=""
                      className="p-2 border rounded w-full md:w-auto"
                    >
                      <option disabled value="">Назначить врача</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.username}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      🗑 Удалить
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}