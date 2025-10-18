import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { cachedAPI } from '../../services/cachedApi';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Heart,
  Baby,
  Calendar,
  RefreshCw
} from 'lucide-react';

const BreedingTreePageV1 = () => {
  const [breedingData, setBreedingData] = useState([]);
  const [indukanData, setIndukanData] = useState([]);
  const [anakanData, setAnakanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 breeding cards per page

  useEffect(() => {
    loadAllData();
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadAllData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [breedingRes, indukanRes, anakanRes] = await Promise.all([
        cachedAPI.getBreeding(forceRefresh),
        cachedAPI.getAyamInduk(forceRefresh),
        cachedAPI.getAyamAnakan(forceRefresh)
      ]);

      // cachedAPI returns {data: [], fromCache: boolean}
      setBreedingData(breedingRes.data || []);
      setIndukanData(indukanRes.data || []);
      setAnakanData(anakanRes.data || []);

      // Only show toast if not from cache
      if (!breedingRes.fromCache || !indukanRes.fromCache || !anakanRes.fromCache) {
        if (forceRefresh) {
          toast.success('✅ Data berhasil disinkronkan');
        } else {
          toast.success(`✅ Loaded ${breedingRes.data?.length || 0} breeding records`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('❌ Failed to load breeding data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get indukan by ID
  const getIndukanById = (id) => {
    return indukanData.find(i => i.id === id);
  };

  // Helper function to get anakan by breeding ID
  const getAnakanByBreedingId = (breedingId) => {
    return anakanData.filter(a => a.breeding_id === breedingId);
  };

  // Format breeding number
  const formatBreedingNumber = (breeding, index) => {
    const number = String(index + 1).padStart(3, '0');
    const date = breeding.tanggal_menetas ? new Date(breeding.tanggal_menetas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    return `Breeding #${number} - ${date}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} hari`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return days > 0 ? `${months}bln ${days}hr` : `${months} bulan`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      if (months > 0) {
        return `${years}th ${months}bln`;
      }
      return `${years} tahun`;
    }
  };

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Expand all nodes
  const expandAll = () => {
    const allIds = new Set(breedingData.map(b => b.id));
    setExpandedNodes(allIds);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Filter breeding data based on search
  const filteredBreeding = breedingData.filter(breeding => {
    if (!searchTerm) return true;

    const pejantan = getIndukanById(breeding.pejantan_id);
    const betina = getIndukanById(breeding.betina_id);
    const anakan = getAnakanByBreedingId(breeding.id);

    const searchLower = searchTerm.toLowerCase();

    return (
      pejantan?.kode?.toLowerCase().includes(searchLower) ||
      betina?.kode?.toLowerCase().includes(searchLower) ||
      pejantan?.ras?.toLowerCase().includes(searchLower) ||
      betina?.ras?.toLowerCase().includes(searchLower) ||
      anakan.some(a => a.kode?.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBreeding.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBreeding.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render individual chicken card
  const ChickenCard = ({ chicken, type, breedingDate }) => {
    if (!chicken) return <div className="text-gray-400 italic text-sm">Data not found</div>;

    // For indukan (pejantan/betina), use tanggal_lahir; for anakan, use breedingDate (tanggal_menetas)
    const birthDate = type === 'anakan' ? breedingDate : chicken.tanggal_lahir;

    return (
      <div className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
        type === 'pejantan' ? 'border-blue-400 bg-blue-50' :
        type === 'betina' ? 'border-pink-400 bg-pink-50' :
        'border-yellow-400 bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={type === 'pejantan' ? 'default' : type === 'betina' ? 'secondary' : 'outline'} className="text-xs">
            {type === 'pejantan' ? '♂ Jantan' : type === 'betina' ? '♀ Betina' : '🐣 Anakan'}
          </Badge>
          <span className="font-mono font-bold text-sm">{chicken.kode}</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="font-semibold text-gray-800">{chicken.ras}</div>
          <div className="text-gray-600 text-xs">Warna: {chicken.warna}</div>
          {birthDate && (
            <>
              <div className="text-gray-500 text-xs">
                {type === 'anakan' ? 'Menetas' : 'Lahir'}: {formatDate(birthDate)}
              </div>
              <div className="text-xs font-semibold" style={{ color: type === 'pejantan' ? '#1e40af' : type === 'betina' ? '#be185d' : '#d97706' }}>
                Umur: {calculateAge(birthDate)}
              </div>
            </>
          )}
          {chicken.status && (
            <Badge
              variant={chicken.status === 'Sehat' ? 'default' : 'destructive'}
              className="text-xs mt-1"
            >
              {chicken.status}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // Render breeding node
  const BreedingNode = ({ breeding, index }) => {
    const pejantan = getIndukanById(breeding.pejantan_id);
    const betina = getIndukanById(breeding.betina_id);
    const anakan = getAnakanByBreedingId(breeding.id);
    const isExpanded = expandedNodes.has(breeding.id);

    return (
      <Card className="mb-4 shadow-md hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-mono">{formatBreedingNumber(breeding, index)}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNode(breeding.id)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Kawin: {formatDate(breeding.tanggal_kawin)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Menetas: {formatDate(breeding.tanggal_menetas)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Baby className="w-3 h-3" />
              <Badge variant="outline" className="text-xs">{anakan.length} Anakan</Badge>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            {/* Parents Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Heart className="w-4 h-4" />
                Indukan (Parents)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Pejantan */}
                <ChickenCard chicken={pejantan} type="pejantan" />

                {/* Connector heart */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-2 shadow-md border-2 border-red-200">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                </div>

                {/* Betina */}
                <ChickenCard chicken={betina} type="betina" />
              </div>
            </div>

            {/* Offspring Section */}
            {anakan.length > 0 ? (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Baby className="w-4 h-4" />
                  Keturunan ({anakan.length} Anakan)
                </div>

                {/* Connector line down */}
                <div className="flex justify-center mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {anakan.map((anak) => (
                    <div key={anak.id}>
                      <ChickenCard chicken={anak} type="anakan" breedingDate={breeding.tanggal_menetas} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm italic">
                Belum ada anakan dari breeding ini
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading breeding tree...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          🌳 Silsilah Breeding
        </h2>
        <p className="text-sm text-gray-600">
          Visualisasi hierarki breeding - dari indukan ke keturunan
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan kode, ras, atau warna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={expandAll} variant="outline" size="sm">
                <ChevronDown className="w-4 h-4 mr-1" />
                Expand All
              </Button>
              <Button onClick={collapseAll} variant="outline" size="sm">
                <ChevronRight className="w-4 h-4 mr-1" />
                Collapse All
              </Button>
              <Button
                onClick={() => loadAllData(true)}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Syncing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge variant="default" className="text-xs">
              {breedingData.length} Breeding
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {indukanData.length} Indukan
            </Badge>
            <Badge variant="outline" className="text-xs">
              {anakanData.length} Anakan
            </Badge>
            {searchTerm && (
              <Badge variant="destructive" className="text-xs">
                {filteredBreeding.length} Hasil Filter
              </Badge>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Breeding Tree */}
      <div className="space-y-4">
        {filteredBreeding.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-2">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Tidak ada hasil breeding yang cocok dengan pencarian'
                  : 'Belum ada data breeding. Mulai dengan membuat pasangan breeding!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentItems.map((breeding, index) => (
              <BreedingNode key={breeding.id} breeding={breeding} index={indexOfFirstItem + index} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="mt-6">
                <CardContent className="py-4">
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      ← Prev
                    </Button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              className={`px-3 ${currentPage === pageNumber ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      Next →
                    </Button>
                  </div>

                  <div className="text-center mt-3 text-sm text-gray-600">
                    Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBreeding.length)} of {filteredBreeding.length} breeding records
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BreedingTreePageV1;
