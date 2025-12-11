import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../services/cachedApi';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import WorkflowActionCard, { StatCard } from './shared/WorkflowActionCard';
import StatusBadge, { AgeBadge, HealthBadge, GenderBadge } from './shared/StatusBadge';
import {
  getAgeInDays,
  getMaturityStatus,
  getAnakanProgress,
  filterBreedingByWorkflow,
  filterMatureAnakan,
  calculateAge,
  formatDate,
  isCurrentlyBreeding,
  getBreedingCount,
  getAnakanByBreedingId
} from '../utils/workflowHelpers';

// Import modules
import BreedingModuleV2 from './modules/BreedingModule-v2';
import AyamAnakanModuleV2 from './modules/AyamAnakanModule-v2';
import AyamIndukModuleV2 from './modules/AyamIndukModule-v2';
import BreedingTreePageV1 from './modules/BreedingTreePage-v1';

/**
 * Dashboard V2 - Workflow-Driven Interface
 * Follows natural farmer lifecycle: Breeding → Anakan → Indukan
 */
const DashboardV2Workflow = () => {
  const [activeModule, setActiveModule] = useState(null); // null = dashboard, or module name
  const [selectedBreedingId, setSelectedBreedingId] = useState(null); // for auto-expanding trah
  const [breedingList, setBreedingList] = useState([]);
  const [anakanList, setAnakanList] = useState([]);
  const [indukanList, setIndukanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [breedingRes, anakanRes, indukanRes] = await Promise.all([
        cachedAPI.getBreeding(forceRefresh),
        cachedAPI.getAyamAnakan(null, forceRefresh),
        cachedAPI.getAyamInduk(forceRefresh)
      ]);

      setBreedingList(breedingRes.data || []);
      setAnakanList(anakanRes.data || []);
      setIndukanList(indukanRes.data || []);

      if (!breedingRes.fromCache || !anakanRes.fromCache || !indukanRes.fromCache) {
        if (forceRefresh) {
          toast.success('✅ Data berhasil disinkronkan');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('❌ Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter data by workflow stages using useMemo for performance
  const newBreeding = useMemo(() =>
    filterBreedingByWorkflow(breedingList, anakanList, 'new'),
    [breedingList, anakanList]
  );

  const readyToRecordBreeding = useMemo(() =>
    filterBreedingByWorkflow(breedingList, anakanList, 'ready-to-record'),
    [breedingList, anakanList]
  );

  const matureAnakan = useMemo(() =>
    filterMatureAnakan(anakanList, breedingList),
    [anakanList, breedingList]
  );

  const healthyIndukan = useMemo(() => {
    // Filter: Sehat dan bukan Dijual/Mati
    const filtered = indukanList.filter(i =>
      i.status === 'Sehat' ||
      (i.status !== 'Mati' && i.status !== 'Dijual')
    );

    // Sort by tanggal_lahir (oldest first) if available
    return filtered.sort((a, b) => {
      const dateA = a.tanggal_lahir ? new Date(a.tanggal_lahir) : new Date(0);
      const dateB = b.tanggal_lahir ? new Date(b.tanggal_lahir) : new Date(0);
      return dateA - dateB;
    });
  }, [indukanList]);

  // Get indukan by ID
  const getIndukanById = (id) => {
    return indukanList.find(i => i.id === id);
  };

  // Render breeding card for sections 1 & 2
  const BreedingCard = ({ breeding }) => {
    const pejantan = getIndukanById(breeding.pejantan_id);
    const betina = getIndukanById(breeding.betina_id);
    const maturityStatus = getMaturityStatus(breeding.tanggal_menetas);
    const ageText = calculateAge(breeding.tanggal_menetas);
    const progress = getAnakanProgress(breeding, anakanList);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-sm">
              {formatDate(breeding.tanggal_menetas)}
            </span>
            <AgeBadge
              birthDate={breeding.tanggal_menetas}
              ageText={ageText}
              maturityStatus={maturityStatus}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Parents */}
            <div className="bg-blue-50 p-2 rounded text-xs">
              <span className="text-blue-600 font-medium">
                ♂ {pejantan?.kode || '-'}
              </span>
              {' × '}
              <span className="text-pink-600 font-medium">
                ♀ {betina?.kode || '-'}
              </span>
            </div>

            {/* Progress Bar */}
            {maturityStatus.status !== 'young' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Anakan Tercatat</span>
                  <span className="font-medium">
                    {progress.recorded}/{progress.total}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            {maturityStatus.status === 'ready' && !progress.isComplete && (
              <Button
                className="w-full btn-action-catat"
                size="sm"
                onClick={() => {
                  toast.info(`Fitur catat anakan untuk breeding ini akan segera hadir`);
                }}
              >
                ➕ Catat Anakan ({progress.total - progress.recorded} tersisa)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render anakan card for section 3
  const AnakanCard = ({ anakan }) => {
    const breeding = breedingList.find(b => b.id === anakan.breeding_id);
    const pejantan = breeding ? getIndukanById(breeding.pejantan_id) : null;
    const betina = breeding ? getIndukanById(breeding.betina_id) : null;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm">{anakan.kode}</span>
            <GenderBadge gender={anakan.jenis_kelamin} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm">
            {/* Breed info */}
            <div>
              <span className="text-gray-500 text-xs">Ras:</span>
              <p className="font-medium">{anakan.ras}</p>
            </div>

            {/* Parents lineage */}
            {breeding && (
              <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-2 rounded text-xs">
                <p className="text-gray-600 mb-1">Trah:</p>
                <p className="font-medium">
                  {pejantan?.kode || '?'} × {betina?.kode || '?'}
                </p>
              </div>
            )}

            {/* Age */}
            {breeding && (
              <div className="text-xs text-gray-600">
                <Badge className="bg-blue-100 text-blue-800">
                  🔥 {calculateAge(breeding.tanggal_menetas)}
                </Badge>
              </div>
            )}

            {/* Promotion button */}
            <Button
              className="w-full btn-action-promosi"
              size="sm"
              onClick={() => {
                toast.info(`Fitur promosi ke indukan untuk ${anakan.kode} akan segera hadir`);
              }}
            >
              ⬆️ Promosi ke Indukan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render indukan card for section 4
  const IndukanCard = ({ indukan }) => {
    const breedingCount = getBreedingCount(indukan.id, breedingList);
    const isBreeding = isCurrentlyBreeding(indukan.id, breedingList);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">{indukan.kode}</p>
              <p className="text-xs text-gray-500">{indukan.ras}</p>
            </div>
            <GenderBadge gender={indukan.jenis_kelamin} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className={isBreeding ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                {isBreeding ? '🥚 Sedang Breeding' : '✅ Siap Kawin'}
              </Badge>
            </div>

            {breedingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Riwayat:</span>
                <Badge variant="outline" className="text-xs">
                  📊 {breedingCount} breeding
                </Badge>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-gray-600">Warna: <span className="font-medium text-gray-800">{indukan.warna}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat workflow...</p>
        </div>
      </div>
    );
  }

  // Render individual module
  if (activeModule) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          onClick={() => {
            setActiveModule(null);
            setSelectedBreedingId(null); // Reset filter
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          ← Kembali ke Workflow Dashboard
        </Button>

        {/* Render selected module */}
        {activeModule === 'breeding' && <BreedingModuleV2 />}
        {activeModule === 'anakan' && (
          <AyamAnakanModuleV2
            onNavigateToTrah={(breedingId) => {
              setSelectedBreedingId(breedingId);
              setActiveModule('trah');
            }}
          />
        )}
        {activeModule === 'indukan' && <AyamIndukModuleV2 />}
        {activeModule === 'trah' && (
          <BreedingTreePageV1
            autoExpandBreedingId={selectedBreedingId}
            onBack={() => {
              setSelectedBreedingId(null);
              setActiveModule(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔄 Workflow Breeding</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dashboard berbasis alur kerja peternak
          </p>
        </div>
        <Button
          onClick={() => loadAllData(true)}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          {refreshing ? 'Syncing...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Quick Access Module Navigation */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">📌 Akses Cepat Module</CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Kelola data detail dengan CRUD operations
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all"
              onClick={() => setActiveModule('breeding')}
            >
              <div className="text-left w-full">
                <div className="font-semibold text-sm">🥚 Breeding</div>
                <div className="text-xs text-gray-500">Kelola breeding pairs</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 bg-white hover:bg-amber-50 hover:border-amber-400 transition-all"
              onClick={() => setActiveModule('anakan')}
            >
              <div className="text-left w-full">
                <div className="font-semibold text-sm">🐣 Anakan</div>
                <div className="text-xs text-gray-500">Kelola ayam anakan</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-all"
              onClick={() => setActiveModule('indukan')}
            >
              <div className="text-left w-full">
                <div className="font-semibold text-sm">🐔 Indukan</div>
                <div className="text-xs text-gray-500">Kelola ayam indukan</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 bg-white hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => {
                setSelectedBreedingId(null); // Clear filter
                setActiveModule('trah');
              }}
            >
              <div className="text-left w-full">
                <div className="font-semibold text-sm">🌳 Trah</div>
                <div className="text-xs text-gray-500">Lihat breeding tree</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🥚"
          label="Total Breeding"
          value={breedingList.length}
          colorScheme="yellow"
        />
        <StatCard
          icon="🐣"
          label="Total Anakan"
          value={anakanList.length}
          colorScheme="green"
        />
        <StatCard
          icon="🐔"
          label="Indukan Sehat"
          value={healthyIndukan.length}
          colorScheme="blue"
        />
        <StatCard
          icon="✅"
          label="Siap Promosi"
          value={matureAnakan.length}
          colorScheme="purple"
        />
      </div>

      {/* Workflow Sections */}
      <div className="space-y-6">
        {/* Section 1: New Breeding (< 3 months) */}
        <WorkflowActionCard
          title="Breeding Baru Menetas"
          subtitle="Umur < 3 bulan - Monitoring awal"
          icon="🥚"
          items={newBreeding}
          colorScheme="yellow"
          emptyMessage="Tidak ada breeding baru yang perlu dipantau"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newBreeding.slice(0, 6).map(breeding => (
              <BreedingCard key={breeding.id} breeding={breeding} />
            ))}
          </div>
          {newBreeding.length > 6 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModule('breeding')}
              >
                Lihat Semua ({newBreeding.length})
              </Button>
            </div>
          )}
        </WorkflowActionCard>

        {/* Section 2: Ready to Record Anakan (3+ months) */}
        <WorkflowActionCard
          title="Siap Dicatat Anakan"
          subtitle="Umur 3+ bulan - Waktunya mencatat detail anakan"
          icon="✅"
          items={readyToRecordBreeding}
          colorScheme="green"
          emptyMessage="Tidak ada breeding yang perlu dicatat anakannya"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyToRecordBreeding.slice(0, 6).map(breeding => (
              <BreedingCard key={breeding.id} breeding={breeding} />
            ))}
          </div>
          {readyToRecordBreeding.length > 6 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModule('breeding')}
              >
                Lihat Semua ({readyToRecordBreeding.length})
              </Button>
            </div>
          )}
        </WorkflowActionCard>

        {/* Section 3: Mature Anakan (6+ months) */}
        <WorkflowActionCard
          title="Anakan Siap Promosi"
          subtitle="Umur 6+ bulan & sehat - Siap jadi indukan"
          icon="🔥"
          items={matureAnakan}
          colorScheme="purple"
          emptyMessage="Tidak ada anakan yang siap dipromosi"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matureAnakan.slice(0, 6).map(anakan => (
              <AnakanCard key={anakan.id} anakan={anakan} />
            ))}
          </div>
          {matureAnakan.length > 6 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModule('anakan')}
              >
                Lihat Semua ({matureAnakan.length})
              </Button>
            </div>
          )}
        </WorkflowActionCard>

        {/* Section 4: Active Healthy Indukan */}
        <WorkflowActionCard
          title="Indukan Aktif & Siap"
          subtitle="Indukan sehat yang siap untuk breeding"
          icon="🐔"
          items={healthyIndukan}
          colorScheme="blue"
          emptyMessage="Tidak ada indukan yang aktif"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthyIndukan.slice(0, 8).map(indukan => (
              <IndukanCard key={indukan.id} indukan={indukan} />
            ))}
          </div>
          {healthyIndukan.length > 8 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModule('indukan')}
              >
                Lihat Semua ({healthyIndukan.length})
              </Button>
            </div>
          )}
        </WorkflowActionCard>
      </div>
    </div>
  );
};

export default DashboardV2Workflow;
