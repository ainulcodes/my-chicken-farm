import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { GenderBadge, HealthBadge } from '../shared/StatusBadge';
import {
  getAgeInDays,
  getMaturityStatus,
  calculateAge,
  formatDate,
  groupAnakanByBreeding
} from '../../utils/workflowHelpers';

const AyamAnakanModuleV2 = ({ onNavigateToTrah }) => {
  const [anakanList, setAnakanList] = useState([]);
  const [breedingList, setBreedingList] = useState([]);
  const [indukanList, setIndukanList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnakan, setEditingAnakan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  const [formData, setFormData] = useState({
    breeding_id: '',
    kode: '',
    jenis_kelamin: '',
    ras: '',
    warna: '',
    status: 'Sehat'
  });

  const [filters, setFilters] = useState({
    breeding_id: 'all',
    jenis_kelamin: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [anakanResponse, breedingResponse, indukanResponse] = await Promise.all([
        cachedAPI.getAyamAnakan(null, forceRefresh),
        cachedAPI.getBreeding(forceRefresh),
        cachedAPI.getAyamInduk(forceRefresh)
      ]);
      setAnakanList(anakanResponse.data || []);
      setBreedingList(breedingResponse.data || []);
      setIndukanList(indukanResponse.data || []);
      setIsFromCache(anakanResponse.fromCache && breedingResponse.fromCache);

      if (!anakanResponse.fromCache || !breedingResponse.fromCache) {
        if (forceRefresh) {
          toast.success('✅ Data berhasil disinkronkan');
        } else {
          toast.success('✅ Data berhasil dimuat');
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getIndukanById = (id) => {
    return indukanList.find(i => i.id === id);
  };

  const getBreedingInfo = (breedingId) => {
    const breeding = breedingList.find(b => b.id === breedingId);
    if (!breeding) return null;
    return breeding;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAnakan) {
        const response = await cachedAPI.updateAyamAnakan(editingAnakan.id, formData);
        if (response.success) {
          setAnakanList(anakanList.map(a =>
            a.id === editingAnakan.id ? { ...a, ...formData } : a
          ));
          toast.success('Ayam anakan berhasil diupdate');
        }
      } else {
        const response = await cachedAPI.addAyamAnakan(formData);
        if (response.success && response.data) {
          setAnakanList([...anakanList, response.data]);
          toast.success('Ayam anakan berhasil ditambahkan');
        }
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await cachedAPI.deleteAyamAnakan(id);
        if (response.success) {
          setAnakanList(anakanList.filter(a => a.id !== id));
          toast.success('Ayam anakan berhasil dihapus');
        }
      } catch (error) {
        toast.error('Gagal menghapus data');
        loadData();
      }
    }
  };

  const handleEdit = (anakan) => {
    setEditingAnakan(anakan);
    setFormData({
      breeding_id: anakan.breeding_id,
      kode: anakan.kode,
      jenis_kelamin: anakan.jenis_kelamin,
      ras: anakan.ras || '',
      warna: anakan.warna,
      status: anakan.status
    });
    setIsDialogOpen(true);
  };

  const handlePromoteToIndukan = (anakan) => {
    toast.info(`Fitur promosi ${anakan.kode} ke indukan akan segera hadir`);
  };

  const resetForm = () => {
    setFormData({
      breeding_id: '',
      kode: '',
      jenis_kelamin: '',
      ras: '',
      warna: '',
      status: 'Sehat'
    });
    setEditingAnakan(null);
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Filter anakan
  const filteredAnakanList = useMemo(() => {
    return anakanList.filter(anakan => {
      if (filters.breeding_id !== 'all' && anakan.breeding_id !== filters.breeding_id) return false;
      if (filters.jenis_kelamin !== 'all' && anakan.jenis_kelamin !== filters.jenis_kelamin) return false;
      if (filters.status !== 'all' && anakan.status !== filters.status) return false;
      return true;
    });
  }, [anakanList, filters]);

  // Group by breeding
  const groupedAnakan = useMemo(() => {
    return groupAnakanByBreeding(filteredAnakanList);
  }, [filteredAnakanList]);

  const resetFilters = () => {
    setFilters({
      breeding_id: 'all',
      jenis_kelamin: 'all',
      status: 'all'
    });
  };

  // Breeding Header Component
  const BreedingGroupHeader = ({ breeding, anakanCount }) => {
    const pejantan = getIndukanById(breeding.pejantan_id);
    const betina = getIndukanById(breeding.betina_id);
    const ageText = calculateAge(breeding.tanggal_menetas);

    return (
      <Card className="mb-4 bg-gradient-to-r from-blue-50 to-pink-50 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥚</span>
              <div>
                <p className="font-bold text-sm text-gray-800">
                  Breeding: {formatDate(breeding.tanggal_menetas)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="text-blue-600 font-medium">♂ {pejantan?.kode || '?'}</span>
                  {' × '}
                  <span className="text-pink-600 font-medium">♀ {betina?.kode || '?'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-800">
                {ageText}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {anakanCount} anakan
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  // Anakan Card Component
  const AnakanCard = ({ anakan }) => {
    const breeding = getBreedingInfo(anakan.breeding_id);
    const ageInDays = breeding ? getAgeInDays(breeding.tanggal_menetas) : 0;
    const isMature = ageInDays >= 180;
    const canPromote = isMature && anakan.status === 'Sehat';

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
            <div>
              <p className="text-xs text-gray-500">Ras</p>
              <p className="font-medium">{anakan.ras || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Warna</p>
              <p className="font-medium">{anakan.warna}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <HealthBadge status={anakan.status} />
            </div>

            {/* Maturity indicator */}
            {isMature && (
              <div className="pt-2 border-t">
                <Badge className="bg-purple-100 text-purple-800 w-full justify-center">
                  🔥 Dewasa - Siap Promosi
                </Badge>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 border-t">
              <Button
                onClick={() => handleEdit(anakan)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(anakan.id)}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                Hapus
              </Button>
            </div>

            {/* Promote button */}
            {canPromote && (
              <Button
                onClick={() => handlePromoteToIndukan(anakan)}
                className="w-full btn-action-promosi mt-2"
                size="sm"
              >
                ⬆️ Promosi ke Indukan
              </Button>
            )}

            {/* View Trah Button */}
            {anakan.breeding_id && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 mt-2"
                onClick={() => {
                  if (onNavigateToTrah) {
                    onNavigateToTrah(anakan.breeding_id);
                  } else {
                    toast.info(`Lihat trah untuk ${anakan.kode}`);
                  }
                }}
              >
                🌳 Lihat Trah
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Data Ayam Anakan <Badge variant="outline" className="ml-2 text-xs">v2</Badge>
          </h2>
          <p className="text-sm text-gray-500">
            {filteredAnakanList.length} dari {anakanList.length} ayam anakan
            {isFromCache && <span className="ml-2 text-xs text-blue-600">⚡ Loaded from cache</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode(viewMode === 'grouped' ? 'list' : 'grouped')}
            variant="outline"
            size="sm"
          >
            {viewMode === 'grouped' ? '📋 List View' : '🗂️ Group View'}
          </Button>
          <Button
            onClick={() => loadData(true)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? 'Syncing...' : '🔄 Refresh'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-md">
                + Tambah Anakan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAnakan ? 'Edit Ayam Anakan' : 'Tambah Ayam Anakan'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="breeding">Breeding</Label>
                  <Select
                    value={formData.breeding_id}
                    onValueChange={(value) => setFormData({ ...formData, breeding_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih breeding" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {breedingList.map((breeding) => (
                        <SelectItem key={breeding.id} value={breeding.id}>
                          {formatDate(breeding.tanggal_menetas)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kode">Kode Ayam</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jantan">Jantan</SelectItem>
                      <SelectItem value="Betina">Betina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ras">Ras</Label>
                  <Input
                    id="ras"
                    value={formData.ras}
                    onChange={(e) => setFormData({ ...formData, ras: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="warna">Warna</Label>
                  <Input
                    id="warna"
                    value={formData.warna}
                    onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sehat">Sehat</SelectItem>
                      <SelectItem value="Sakit">Sakit</SelectItem>
                      <SelectItem value="Mati">Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Batal</Button>
                  <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {anakanList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Anakan</CardTitle>
              <Button onClick={resetFilters} variant="outline" size="sm">
                Reset Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Breeding</Label>
                <Select
                  value={filters.breeding_id}
                  onValueChange={(value) => setFilters({ ...filters, breeding_id: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Semua Breeding" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Semua Breeding</SelectItem>
                    {breedingList.map((breeding) => (
                      <SelectItem key={breeding.id} value={breeding.id}>
                        {formatDate(breeding.tanggal_menetas)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Jenis Kelamin</Label>
                <Select
                  value={filters.jenis_kelamin}
                  onValueChange={(value) => setFilters({ ...filters, jenis_kelamin: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Jantan">Jantan</SelectItem>
                    <SelectItem value="Betina">Betina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Sehat">Sehat</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Mati">Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {loading && anakanList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : anakanList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Belum ada data ayam anakan</p>
        </Card>
      ) : filteredAnakanList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Tidak ada anakan yang sesuai dengan filter</p>
          <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4">
            Reset Filter
          </Button>
        </Card>
      ) : viewMode === 'grouped' ? (
        /* Grouped View */
        <div className="space-y-6">
          {Object.entries(groupedAnakan).map(([breedingId, anakans]) => {
            const breeding = getBreedingInfo(breedingId);
            if (!breeding) return null;

            return (
              <div key={breedingId}>
                <BreedingGroupHeader breeding={breeding} anakanCount={anakans.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {anakans.map(anakan => (
                    <AnakanCard key={anakan.id} anakan={anakan} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnakanList.map(anakan => (
            <AnakanCard key={anakan.id} anakan={anakan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AyamAnakanModuleV2;
