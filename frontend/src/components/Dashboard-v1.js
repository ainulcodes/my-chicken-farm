import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Bird, HeartHandshake, Egg, Network } from 'lucide-react';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import IndukanPage from './admin/IndukanPage';
import BreedingPage from './admin/BreedingPage';
import AnakanPage from './admin/AnakanPage';
import TrahPage from './admin/TrahPage';

const NAV = [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'indukan', label: 'Ayam Indukan', icon: Bird },
  { id: 'breeding', label: 'Breeding', icon: HeartHandshake },
  { id: 'anakan', label: 'Ayam Anakan', icon: Egg },
  { id: 'trah', label: 'Trah', icon: Network },
];

export default function Dashboard() {
  const [section, setSection] = useState('ringkasan');
  const [trahBreedingId, setTrahBreedingId] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const goTrah = (breedingId) => {
    setTrahBreedingId(breedingId || null);
    setSection('trah');
  };

  const navigateSection = (id) => {
    if (id !== 'trah') setTrahBreedingId(null);
    setSection(id);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AdminLayout
      nav={NAV}
      current={section}
      onNavigate={navigateSection}
      onLogout={handleLogout}
      onViewPublic={() => navigate('/')}
    >
      {section === 'ringkasan' && <AdminDashboard onNavigate={navigateSection} onNavigateToTrah={goTrah} />}
      {section === 'indukan' && <IndukanPage />}
      {section === 'breeding' && <BreedingPage />}
      {section === 'anakan' && <AnakanPage onNavigateToTrah={goTrah} />}
      {section === 'trah' && <TrahPage autoExpandBreedingId={trahBreedingId} />}
    </AdminLayout>
  );
}
