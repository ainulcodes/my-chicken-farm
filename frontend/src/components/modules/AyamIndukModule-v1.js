import React, { useState, useEffect } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';

console.log('🟢 AyamIndukModule-v1 loaded');
console.log('📦 cachedAPI imported:', cachedAPI);
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const AyamIndukModuleV1 = () => {
  console.log('🎯 AyamIndukModule-v1 component initialized');
  const [ayamList, setAyamList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAyam, setEditingAyam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3 kolom x 3 baris
  const [formData, setFormData] = useState({
    kode: '',
    jenis_kelamin: '',
    ras: '',
    warna: '',
    tanggal_lahir: '',
    status: 'Sehat'
  });

  // Filter states
  const [filters, setFilters] = useState({
    ras: 'all',
    warna: 'all',
    jenis_kelamin: 'all',
    status: 'all',
    ageMin: '',
    ageMax: '',
    ageUnit: 'months' // 'months' or 'years'
  });

  useEffect(() => {
    loadAyamInduk();
  }, []);

  const loadAyamInduk = async (forceRefresh = false) => {
    console.log('🔄 loadAyamInduk called, forceRefresh:', forceRefresh);
    setLoading(true);
    try {
      console.log('📞 Calling cachedAPI.getAyamInduk...');
      const response = await cachedAPI.getAyamInduk(forceRefresh);
      console.log('📥 Response received:', {
        dataLength: response.data?.length,
        fromCache: response.fromCache,
        loadTime: response.loadTime
      });
      setAyamList(response.data);
      setIsFromCache(response.fromCache);

      // Hanya tampilkan notifikasi saat fetch dari API
      if (response.stale) {
        toast.warning('Menggunakan data offline (koneksi bermasalah)');
      } else if (!response.fromCache) {
        if (forceRefresh) {
          toast.success(`✅ Synced ${response.data.length} items in ${response.loadTime}ms`);
        } else {
          toast.success(`✅ Loaded ${response.data.length} items in ${response.loadTime}ms`);
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
          // Update lokal tanpa refetch
          setAyamList(ayamList.map(a =>
            a.id === editingAyam.id ? { ...a, ...formData } : a
          ));
          toast.success('Ayam indukan berhasil diupdate');
        }
      } else {
        const response = await cachedAPI.addAyamInduk(formData);
        if (response.success && response.data) {
          // Update lokal tanpa refetch
          setAyamList([...ayamList, response.data]);
          toast.success('Ayam indukan berhasil ditambahkan');
        }
      }
      setIsDialogOpen(false);
      resetForm();
      // TIDAK perlu loadAyamInduk() lagi karena sudah optimistic update
    } catch (error) {
      toast.error('Gagal menyimpan data');
      // Jika error, refetch untuk sync
      loadAyamInduk();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await cachedAPI.deleteAyamInduk(id);
        if (response.success) {
          // Update lokal tanpa refetch
          setAyamList(ayamList.filter(a => a.id !== id));
          toast.success('Ayam indukan berhasil dihapus');
        }
      } catch (error) {
        toast.error('Gagal menghapus data');
        // Jika error, refetch untuk sync
        loadAyamInduk();
      }
    }
  };

  const handleEdit = (ayam) => {
    setEditingAyam(ayam);

    // Convert ISO date string to YYYY-MM-DD format for date input
    let tanggalLahir = ayam.tanggal_lahir;
    if (tanggalLahir) {
      try {
        // If it's ISO format (e.g., "2003-03-10T17:00:00.000Z"), extract date part
        const date = new Date(tanggalLahir);
        if (!isNaN(date.getTime())) {
          tanggalLahir = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }

    setFormData({
      kode: ayam.kode,
      jenis_kelamin: ayam.jenis_kelamin,
      ras: ayam.ras,
      warna: ayam.warna,
      tanggal_lahir: tanggalLahir,
      status: ayam.status || 'Sehat'
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
      return days > 0 ? `${months} bulan ${days} hari` : `${months} bulan`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      if (months > 0) {
        return `${years} tahun ${months} bulan`;
      }
      return `${years} tahun`;
    }
  };

  // Get age in days for filtering
  const getAgeInDays = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today - birth);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get unique values for filters
  const getUniqueRas = () => {
    const uniqueRas = [...new Set(ayamList.map(a => a.ras))].filter(Boolean).sort();
    return uniqueRas;
  };

  const getUniqueWarna = () => {
    const uniqueWarna = [...new Set(ayamList.map(a => a.warna))].filter(Boolean).sort();
    return uniqueWarna;
  };

  // Filter ayam list
  const filteredAyamList = ayamList.filter(ayam => {
    // Filter by ras
    if (filters.ras !== 'all' && ayam.ras !== filters.ras) {
      return false;
    }

    // Filter by warna
    if (filters.warna !== 'all' && ayam.warna !== filters.warna) {
      return false;
    }

    // Filter by jenis kelamin
    if (filters.jenis_kelamin !== 'all' && ayam.jenis_kelamin !== filters.jenis_kelamin) {
      return false;
    }

    // Filter by status
    if (filters.status !== 'all' && ayam.status !== filters.status) {
      return false;
    }

    // Filter by age
    const ageInDays = getAgeInDays(ayam.tanggal_lahir);
    if (ageInDays !== null) {
      let ageMinInDays = null;
      let ageMaxInDays = null;

      // Convert filter values to days based on unit
      if (filters.ageMin) {
        ageMinInDays = filters.ageUnit === 'years'
          ? parseInt(filters.ageMin) * 365
          : parseInt(filters.ageMin) * 30;
      }
      if (filters.ageMax) {
        ageMaxInDays = filters.ageUnit === 'years'
          ? parseInt(filters.ageMax) * 365
          : parseInt(filters.ageMax) * 30;
      }

      if (ageMinInDays && ageInDays < ageMinInDays) {
        return false;
      }
      if (ageMaxInDays && ageInDays > ageMaxInDays) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setFilters({
      ras: 'all',
      warna: 'all',
      jenis_kelamin: 'all',
      status: 'all',
      ageMin: '',
      ageMax: '',
      ageUnit: 'months'
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ayam Indukan</h2>
          <p className="text-sm text-gray-500">
            {filteredAyamList.length} dari {ayamList.length} ayam indukan
            {isFromCache && <span className="ml-2 text-xs text-blue-600">⚡ Loaded from cache</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => loadAyamInduk(true)}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-gray-600"
          >
            {loading ? 'Syncing...' : '🔄 Refresh'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md" data-testid="add-indukan-button">
              + Tambah Indukan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" data-testid="indukan-dialog">
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
                  placeholder="Contoh: IND-001"
                  required
                  data-testid="indukan-kode-input"
                />
              </div>
              <div>
                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                <Select
                  value={formData.jenis_kelamin}
                  onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}
                  required
                >
                  <SelectTrigger data-testid="indukan-gender-select">
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
                  placeholder="Contoh: Bangkok, Saigon"
                  required
                  data-testid="indukan-ras-input"
                />
              </div>
              <div>
                <Label htmlFor="warna">Warna</Label>
                <Input
                  id="warna"
                  value={formData.warna}
                  onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                  placeholder="Contoh: Hitam, Merah"
                  required
                  data-testid="indukan-warna-input"
                />
              </div>
              <div>
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <Input
                  id="tanggal_lahir"
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  required
                  data-testid="indukan-tanggal-input"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="indukan-status-select">
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
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700" data-testid="indukan-submit-button">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filter Section */}
      {ayamList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Ayam Indukan</CardTitle>
              <Button onClick={resetFilters} variant="outline" size="sm">
                Reset Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Jenis Kelamin Filter */}
              <div>
                <Label htmlFor="filter-gender" className="text-xs">Jenis Kelamin</Label>
                <Select
                  value={filters.jenis_kelamin}
                  onValueChange={(value) => setFilters({ ...filters, jenis_kelamin: value })}
                >
                  <SelectTrigger id="filter-gender" className="h-9">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Jantan">Jantan</SelectItem>
                    <SelectItem value="Betina">Betina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ras Filter */}
              <div>
                <Label htmlFor="filter-ras" className="text-xs">Ras</Label>
                <Select
                  value={filters.ras}
                  onValueChange={(value) => setFilters({ ...filters, ras: value })}
                >
                  <SelectTrigger id="filter-ras" className="h-9">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Semua Ras</SelectItem>
                    {getUniqueRas().map((ras) => (
                      <SelectItem key={ras} value={ras}>{ras}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Warna Filter */}
              <div>
                <Label htmlFor="filter-warna" className="text-xs">Warna</Label>
                <Select
                  value={filters.warna}
                  onValueChange={(value) => setFilters({ ...filters, warna: value })}
                >
                  <SelectTrigger id="filter-warna" className="h-9">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Semua Warna</SelectItem>
                    {getUniqueWarna().map((warna) => (
                      <SelectItem key={warna} value={warna}>{warna}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="filter-status" className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger id="filter-status" className="h-9">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Sehat">Sehat</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Dijual">Dijual</SelectItem>
                    <SelectItem value="Mati">Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range Filter */}
              <div className="md:col-span-2 lg:col-span-1">
                <Label className="text-xs">Umur</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.ageMin}
                      onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                      className="h-9 flex-1"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.ageMax}
                      onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                      className="h-9 flex-1"
                      min="0"
                    />
                  </div>
                  <Select
                    value={filters.ageUnit}
                    onValueChange={(value) => setFilters({ ...filters, ageUnit: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Bulan</SelectItem>
                      <SelectItem value="years">Tahun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
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
          <p className="text-gray-500">Tidak ada ayam indukan yang sesuai dengan filter</p>
          <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4">
            Reset Filter
          </Button>
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="indukan-list">
          {currentItems.map((ayam) => (
            <Card key={ayam.id} className="hover:shadow-lg transition-shadow" data-testid={`indukan-item-${ayam.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{ayam.kode}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    ayam.status === 'Sehat' ? 'bg-green-100 text-green-700' :
                    ayam.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' :
                    ayam.status === 'Dijual' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ayam.status || 'Sehat'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jenis Kelamin:</span>
                    <span className={`font-medium ${ayam.jenis_kelamin === 'Jantan' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {ayam.jenis_kelamin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ras:</span>
                    <span className="font-medium">{ayam.ras}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warna:</span>
                    <span className="font-medium">{ayam.warna}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal Lahir:</span>
                    <span className="font-medium">{formatDate(ayam.tanggal_lahir)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Umur:</span>
                    <span className="font-medium text-emerald-700">{calculateAge(ayam.tanggal_lahir)}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(ayam)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`edit-indukan-${ayam.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(ayam.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    data-testid={`delete-indukan-${ayam.id}`}
                  >
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
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

export default AyamIndukModuleV1;
