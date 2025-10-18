import React, { useState, useEffect } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const AyamAnakanModule = () => {
  const [anakanList, setAnakanList] = useState([]);
  const [breedingList, setBreedingList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnakan, setEditingAnakan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [filterBreeding, setFilterBreeding] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3 kolom x 3 baris
  const [formData, setFormData] = useState({
    breeding_id: '',
    kode: '',
    jenis_kelamin: '',
    warna: '',
    status: 'Sehat'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnakan();
  }, [filterBreeding]);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [anakanResponse, breedingResponse] = await Promise.all([
        cachedAPI.getAyamAnakan(null, forceRefresh),
        cachedAPI.getBreeding(forceRefresh)
      ]);
      setAnakanList(anakanResponse.data);
      setBreedingList(breedingResponse.data);
      setIsFromCache(anakanResponse.fromCache && breedingResponse.fromCache);

      // Hanya tampilkan notifikasi saat fetch dari API
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

  const loadAnakan = async () => {
    try {
      const breedingId = (filterBreeding === 'all' || !filterBreeding) ? null : filterBreeding;
      const response = await cachedAPI.getAyamAnakan(breedingId, false);
      setAnakanList(response.data);
    } catch (error) {
      toast.error('Gagal memuat data anakan');
    }
  };

  const getBreedingInfo = (breedingId) => {
    const breeding = breedingList.find(b => b.id === breedingId);
    if (!breeding) return '-';

    const index = breedingList.findIndex(b => b.id === breedingId);
    const number = String(index + 1).padStart(3, '0');
    const date = breeding.tanggal_menetas ? new Date(breeding.tanggal_menetas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    return `#${number} - ${date}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAnakan) {
        const response = await cachedAPI.updateAyamAnakan(editingAnakan.id, formData);
        if (response.success) {
          // Optimistic update
          setAnakanList(anakanList.map(a =>
            a.id === editingAnakan.id ? { ...a, ...formData } : a
          ));
          toast.success('Ayam anakan berhasil diupdate');
        }
      } else {
        const response = await cachedAPI.addAyamAnakan(formData);
        if (response.success && response.data) {
          // Optimistic update
          setAnakanList([...anakanList, response.data]);
          toast.success('Ayam anakan berhasil ditambahkan');
        }
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
      loadAnakan(); // Refetch on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await cachedAPI.deleteAyamAnakan(id);
        if (response.success) {
          // Optimistic update
          setAnakanList(anakanList.filter(a => a.id !== id));
          toast.success('Ayam anakan berhasil dihapus');
        }
      } catch (error) {
        toast.error('Gagal menghapus data');
        loadAnakan(); // Refetch on error
      }
    }
  };

  const handleEdit = (anakan) => {
    setEditingAnakan(anakan);
    setFormData({
      breeding_id: anakan.breeding_id,
      kode: anakan.kode,
      jenis_kelamin: anakan.jenis_kelamin,
      warna: anakan.warna,
      status: anakan.status
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      breeding_id: '',
      kode: '',
      jenis_kelamin: '',
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = anakanList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(anakanList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterBreeding]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ayam Anakan</h2>
          <p className="text-sm text-gray-500">
            {anakanList.length} ayam anakan
            {isFromCache && <span className="ml-2 text-xs text-blue-600">⚡ Loaded from cache</span>}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => loadData(true)}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-gray-600"
          >
            {loading ? 'Syncing...' : '🔄 Refresh'}
          </Button>
          <Select value={filterBreeding} onValueChange={setFilterBreeding}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="filter-breeding-select">
              <SelectValue placeholder="Filter Breeding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Breeding</SelectItem>
              {breedingList.map((breeding, index) => (
                <SelectItem key={breeding.id} value={breeding.id}>
                  {getBreedingInfo(breeding.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-md" data-testid="add-anakan-button">
                + Tambah Anakan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="anakan-dialog">
              <DialogHeader>
                <DialogTitle>{editingAnakan ? 'Edit Ayam Anakan' : 'Tambah Ayam Anakan'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="breeding_id">Breeding</Label>
                  <Select
                    value={formData.breeding_id}
                    onValueChange={(value) => setFormData({ ...formData, breeding_id: value })}
                    required
                  >
                    <SelectTrigger data-testid="anakan-breeding-select">
                      <SelectValue placeholder="Pilih breeding" />
                    </SelectTrigger>
                    <SelectContent>
                      {breedingList.map((breeding, index) => {
                        const number = String(index + 1).padStart(3, '0');
                        const date = breeding.tanggal_menetas ? new Date(breeding.tanggal_menetas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                        return (
                          <SelectItem key={breeding.id} value={breeding.id}>
                            Breeding #{number} - {date}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kode">Kode Ayam</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    placeholder="Contoh: ANK-001"
                    required
                    data-testid="anakan-kode-input"
                  />
                </div>
                <div>
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}
                    required
                  >
                    <SelectTrigger data-testid="anakan-gender-select">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jantan">Jantan</SelectItem>
                      <SelectItem value="Betina">Betina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="warna">Warna</Label>
                  <Input
                    id="warna"
                    value={formData.warna}
                    onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                    placeholder="Contoh: Hitam, Merah"
                    required
                    data-testid="anakan-warna-input"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger data-testid="anakan-status-select">
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
                  <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700" data-testid="anakan-submit-button">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* List */}
      {loading && anakanList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : anakanList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Belum ada data ayam anakan</p>
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="anakan-list">
          {currentItems.map((anakan) => (
            <Card key={anakan.id} className="hover:shadow-lg transition-shadow" data-testid={`anakan-item-${anakan.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{anakan.kode}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    anakan.status === 'Sehat' ? 'bg-green-100 text-green-700' :
                    anakan.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' :
                    anakan.status === 'Dijual' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {anakan.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Breeding:</span>
                    <span className="font-medium text-xs">{getBreedingInfo(anakan.breeding_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jenis Kelamin:</span>
                    <span className={`font-medium ${anakan.jenis_kelamin === 'Jantan' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {anakan.jenis_kelamin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warna:</span>
                    <span className="font-medium">{anakan.warna}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(anakan)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`edit-anakan-${anakan.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(anakan.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    data-testid={`delete-anakan-${anakan.id}`}
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
                // Show first, last, current, and adjacent pages
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
                      className={`px-3 ${currentPage === pageNumber ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
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

export default AyamAnakanModule;
