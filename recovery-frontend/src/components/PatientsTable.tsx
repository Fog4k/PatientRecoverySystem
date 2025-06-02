import { useEffect, useState } from 'react';

interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  contactNumber: string;
  address: string;
}

export default function PatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5066/api/patients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error('Ошибка загрузки пациентов:', err));
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Список пациентов</h2>
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">ФИО</th>
            <th className="p-3">Дата рождения</th>
            <th className="p-3">Контакт</th>
            <th className="p-3">Адрес</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.id}</td>
              <td className="p-3">{p.fullName}</td>
              <td className="p-3">{new Date(p.birthDate).toLocaleDateString()}</td>
              <td className="p-3">{p.contactNumber}</td>
              <td className="p-3">{p.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}