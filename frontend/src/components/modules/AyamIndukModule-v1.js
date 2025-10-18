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
    tanggal_lahir: ''
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
      tanggal_lahir: tanggalLahir
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      kode: '',
      jenis_kelamin: '',
      ras: '',
      warna: '',
      tanggal_lahir: ''
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ayamList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ayamList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ayam Indukan</h2>
          <p className="text-sm text-gray-500">
            {ayamList.length} ayam indukan
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

      {/* List */}
      {loading && ayamList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : ayamList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Belum ada data ayam indukan</p>
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="indukan-list">
          {currentItems.map((ayam) => (
            <Card key={ayam.id} className="hover:shadow-lg transition-shadow" data-testid={`indukan-item-${ayam.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{ayam.kode}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${ayam.jenis_kelamin === 'Jantan' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {ayam.jenis_kelamin}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
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
