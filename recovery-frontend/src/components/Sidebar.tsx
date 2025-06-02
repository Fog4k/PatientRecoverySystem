import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Users, ClipboardList, Activity, User } from 'lucide-react'; // npm install lucide-react

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: <Menu size={20} /> },
  { path: '/patients', label: 'Пациенты', icon: <Users size={20} /> },
  { path: '/vitals', label: 'Показатели', icon: <ClipboardList size={20} /> },
  { path: '/rehab', label: 'Реабилитация', icon: <Activity size={20} /> },
  { path: '/diagnoses', label: 'Диагнозы', icon: <ClipboardList size={20} /> },
  { path: '/profile', label: 'Профиль', icon: <User size={20} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-screen bg-white border-r shadow-sm ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
      <div className="p-4 border-b flex justify-between items-center">
        <span className={`font-bold text-xl ${isCollapsed ? 'hidden' : 'block'}`}>🏥 Recovery</span>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-600">
          <Menu size={20} />
        </button>
      </div>

      <ul className="mt-4 space-y-1">
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 ${location.pathname === link.path ? 'bg-gray-200 font-semibold' : ''}`}
            >
              {link.icon}
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}