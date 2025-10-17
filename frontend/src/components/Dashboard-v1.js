import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from './ui/card';
import AyamIndukModuleV1 from './modules/AyamIndukModule-v1';
import BreedingModuleV1 from './modules/BreedingModule-v1';
import AyamAnakanModuleV1 from './modules/AyamAnakanModule-v1';

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('indukan');

  const modules = [
    { id: 'indukan', name: 'Ayam Indukan', icon: '🐓', color: 'from-emerald-500 to-teal-600' },
    { id: 'breeding', name: 'Breeding', icon: '💑', color: 'from-blue-500 to-cyan-600' },
    { id: 'anakan', name: 'Ayam Anakan', icon: '🐣', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Breeding Ayam - V1
                </h1>
                <p className="text-xs text-gray-500">Sistem Manajemen Sederhana</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                activeModule === module.id
                  ? 'ring-2 ring-offset-2 ring-emerald-500 shadow-xl'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setActiveModule(module.id)}
              data-testid={`module-${module.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
                    {module.icon}
                  </div>
                  <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {module.name}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Active Module Content */}
        <div className="animate-fadeIn">
          {activeModule === 'indukan' && <AyamIndukModuleV1 />}
          {activeModule === 'breeding' && <BreedingModuleV1 />}
          {activeModule === 'anakan' && <AyamAnakanModuleV1 />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
