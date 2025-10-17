import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import api from '../services/api-v1';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Heart,
  Baby,
  Calendar,
  Hash
} from 'lucide-react';

const BreedingTreePage = () => {
  const [breedingData, setBreedingData] = useState([]);
  const [indukanData, setIndukanData] = useState([]);
  const [anakanData, setAnakanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [breedingRes, indukanRes, anakanRes] = await Promise.all([
        api.getAllBreeding(),
        api.getAllAyamInduk(),
        api.getAllAyamAnakan()
      ]);

      setBreedingData(breedingRes.data || []);
      setIndukanData(indukanRes.data || []);
      setAnakanData(anakanRes.data || []);

      toast.success(`✅ Loaded ${breedingRes.data?.length || 0} breeding records`);
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Render individual chicken card
  const ChickenCard = ({ chicken, type }) => {
    if (!chicken) return <div className="text-gray-400 italic">Data not found</div>;

    return (
      <div className={`p-3 rounded-lg border-2 ${
        type === 'pejantan' ? 'border-blue-400 bg-blue-50' :
        type === 'betina' ? 'border-pink-400 bg-pink-50' :
        'border-yellow-400 bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={type === 'pejantan' ? 'default' : type === 'betina' ? 'secondary' : 'outline'}>
            {type === 'pejantan' ? '♂ Jantan' : type === 'betina' ? '♀ Betina' : '🐣 Anakan'}
          </Badge>
          <span className="font-mono font-bold text-sm">{chicken.kode}</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="font-semibold">{chicken.ras}</div>
          <div className="text-gray-600">Warna: {chicken.warna}</div>
          {chicken.status && (
            <Badge variant={chicken.status === 'Sehat' ? 'success' : 'destructive'} className="text-xs">
              {chicken.status}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // Render breeding node
  const BreedingNode = ({ breeding }) => {
    const pejantan = getIndukanById(breeding.pejantan_id);
    const betina = getIndukanById(breeding.betina_id);
    const anakan = getAnakanByBreedingId(breeding.id);
    const isExpanded = expandedNodes.has(breeding.id);

    return (
      <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Breeding #{breeding.id}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNode(breeding.id)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Kawin: {breeding.tanggal_kawin}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Menetas: {breeding.tanggal_menetas}</span>
            </div>
            <div className="flex items-center gap-1">
              <Baby className="w-4 h-4" />
              <span>{anakan.length} Anakan</span>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            {/* Parents Section */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Indukan (Parents)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Pejantan */}
                <ChickenCard chicken={pejantan} type="pejantan" />

                {/* Connector line */}
                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                </div>

                {/* Betina */}
                <ChickenCard chicken={betina} type="betina" />
              </div>
            </div>

            {/* Offspring Section */}
            {anakan.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  Anakan ({anakan.length})
                </div>

                {/* Connector line down */}
                <div className="flex justify-center mb-4">
                  <div className="w-px h-8 bg-gray-300"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {anakan.map((anak, idx) => (
                    <div key={anak.id} className="relative">
                      {/* Connector line from top */}
                      {idx === 0 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
                      )}
                      <ChickenCard chicken={anak} type="anakan" />
                    </div>
                  ))}
                </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading breeding data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🌳 Silsilah Breeding
        </h1>
        <p className="text-gray-600">
          Visualisasi hierarki breeding ayam aduan - Parent to Offspring
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by kode, ras, or warna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={expandAll} variant="outline" size="sm">
                <ChevronDown className="w-4 h-4 mr-1" />
                Expand All
              </Button>
              <Button onClick={collapseAll} variant="outline" size="sm">
                <ChevronRight className="w-4 h-4 mr-1" />
                Collapse All
              </Button>
              <Button onClick={loadAllData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">{breedingData.length} Total Breeding</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{indukanData.length} Indukan</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{anakanData.length} Anakan</Badge>
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{filteredBreeding.length} Filtered Results</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breeding Tree */}
      <div className="space-y-4">
        {filteredBreeding.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {searchTerm
                  ? 'No breeding records match your search'
                  : 'No breeding records found. Start by creating breeding pairs!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBreeding.map(breeding => (
            <BreedingNode key={breeding.id} breeding={breeding} />
          ))
        )}
      </div>
    </div>
  );
};

export default BreedingTreePage;
