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
import { GenderBadge, HealthBadge, BreedingStatusBadge } from '../shared/StatusBadge';
import {
  calculateAge,
  formatDate,
  isCurrentlyBreeding,
  getBreedingCount
} from '../../utils/workflowHelpers';

const AyamIndukModuleV2 = () => {
  const [ayamList, setAyamList] = useState([]);
  const [breedingList, setBreedingList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAyam, setEditingAyam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const [formData, setFormData] = useState({
    kode: '',
    jenis_kelamin: '',
    ras: '',
    warna: '',
    tanggal_lahir: '',
    status: 'Sehat'
  });

  const [filters, setFilters] = useState({
    ras: 'all',
    jenis_kelamin: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [ayamResponse, breedingResponse] = await Promise.all([
        cachedAPI.getAyamInduk(forceRefresh),
        cachedAPI.getBreeding(forceRefresh)
      ]);
      setAyamList(ayamResponse.data || []);
      setBreedingList(breedingResponse.data || []);
      setIsFromCache(ayamResponse.fromCache && breedingResponse.fromCache);

      if (!ayamResponse.fromCache || !breedingResponse.fromCache) {
        if (forceRefresh) {
          toast.success('✅ Data berhasil disinkronkan');
        } else {
          toast.success('✅ Data berhasil dimuat');
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data ayam indukan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAyam) {
        const response = await cachedAPI.updateAyamInduk(editingAyam.id, formData);
        if (response.success) {
          setAyamList(ayamList.map(a =>
            a.id === editingAyam.id ? { ...a, ...formData } : a
          ));
          toast.success('Ayam indukan berhasil diupdate');
        }
      } else {
        const response = await cachedAPI.addAyamInduk(formData);
        if (response.success && response.data) {
          setAyamList([...ayamList, response.data]);
          toast.success('Ayam indukan berhasil ditambahkan');
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
        const response = await cachedAPI.deleteAyamInduk(id);
        if (response.success) {
          setAyamList(ayamList.filter(a => a.id !== id));
          toast.success('Ayam indukan berhasil dihapus');
        }
      } catch (error) {
        toast.error('Gagal menghapus data');
        loadData();
      }
    }
  };

  const handleEdit = (ayam) => {
    setEditingAyam(ayam);
    setFormData({
      kode: ayam.kode,
      jenis_kelamin: ayam.jenis_kelamin,
      ras: ayam.ras,
      warna: ayam.warna,
      tanggal_lahir: ayam.tanggal_lahir || '',
      status: ayam.status
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      kode: '',
      jenis_kelamin: '',
      ras: '',
      warna: '',
      tanggal_lahir: '',
      status: 'Sehat'
    });
    setEditingAyam(null);
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Get unique values for filters
  const uniqueRas = useMemo(() => {
    return [...new Set(ayamList.map(a => a.ras))].filter(Boolean).sort();
  }, [ayamList]);

  // Filter ayam list
  const filteredAyamList = useMemo(() => {
    return ayamList.filter(ayam => {
      if (filters.ras !== 'all' && ayam.ras !== filters.ras) return false;
      if (filters.jenis_kelamin !== 'all' && ayam.jenis_kelamin !== filters.jenis_kelamin) return false;
      if (filters.status !== 'all' && ayam.status !== filters.status) return false;
      return true;
    });
  }, [ayamList, filters]);

  const resetFilters = () => {
    setFilters({
      ras: 'all',
      jenis_kelamin: 'all',
      status: 'all'
    });
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAyamList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAyamList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Indukan Card Component
  const IndukanCard = ({ ayam }) => {
    const breedingCount = getBreedingCount(ayam.id, breedingList);
    const isBreeding = isCurrentlyBreeding(ayam.id, breedingList);
    const ageText = calculateAge(ayam.tanggal_lahir);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">{ayam.kode}</p>
              <p className="text-xs text-gray-500">{ayam.ras}</p>
            </div>
            <GenderBadge gender={ayam.jenis_kelamin} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status:</span>
              <HealthBadge status={ayam.status} />
            </div>

            {/* Breeding Status - NEW! */}
            {ayam.status === 'Sehat' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Breeding:</span>
                <BreedingStatusBadge isActive={isBreeding} />
              </div>
            )}

            {/* Breeding History - NEW! */}
            {breedingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Riwayat:</span>
                <Badge variant="outline" className="text-xs">
                  📊 {breedingCount} breeding
                </Badge>
              </div>
            )}

            {/* Warna */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">Warna</p>
              <p className="font-medium">{ayam.warna}</p>
            </div>

            {/* Age */}
            {ayam.tanggal_lahir && (
              <div>
                <p className="text-xs text-gray-500">Umur</p>
                <p className="font-medium">{ageText}</p>
                <p className="text-xs text-gray-400">{formatDate(ayam.tanggal_lahir)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t">
              <Button
                onClick={() => handleEdit(ayam)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(ayam.id)}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                Hapus
              </Button>
            </div>
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
            Data Ayam Indukan <Badge variant="outline" className="ml-2 text-xs">v2</Badge>
          </h2>
          <p className="text-sm text-gray-500">
            {filteredAyamList.length} dari {ayamList.length} ayam indukan
            {isFromCache && <span className="ml-2 text-xs text-blue-600">⚡ Loaded from cache</span>}
          </p>
        </div>
        <div className="flex gap-2">
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
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md">
                + Tambah Indukan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAyam ? 'Edit Ayam Indukan' : 'Tambah Ayam Indukan'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
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
                  <Label htmlFor="tanggal_lahir">Tanggal Lahir (Opsional)</Label>
                  <Input
                    id="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
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
                      <SelectItem value="Dijual">Dijual</SelectItem>
                      <SelectItem value="Mati">Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Batal</Button>
                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {ayamList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Indukan</CardTitle>
              <Button onClick={resetFilters} variant="outline" size="sm">
                Reset Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Ras</Label>
                <Select
                  value={filters.ras}
                  onValueChange={(value) => setFilters({ ...filters, ras: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Semua Ras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Ras</SelectItem>
                    {uniqueRas.map((ras) => (
                      <SelectItem key={ras} value={ras}>{ras}</SelectItem>
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
                    <SelectItem value="Dijual">Dijual</SelectItem>
                    <SelectItem value="Mati">Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {loading && ayamList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : ayamList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Belum ada data ayam indukan</p>
        </Card>
      ) : filteredAyamList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Tidak ada ayam yang sesuai dengan filter</p>
          <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4">
            Reset Filter
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((ayam) => (
              <IndukanCard key={ayam.id} ayam={ayam} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
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
                        className={`px-3 ${currentPage === pageNumber ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
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
          )}
        </>
      )}
    </div>
  );
};

export default AyamIndukModuleV2;
