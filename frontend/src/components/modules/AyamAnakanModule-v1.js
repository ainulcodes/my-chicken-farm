import React, { useState, useEffect } from 'react';
import { apiV1 } from '../../services/api-v1';
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
  const [filterBreeding, setFilterBreeding] = useState('');
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

  const loadData = async () => {
    setLoading(true);
    try {
      const breeding = await api.getBreeding();
      setBreedingList(breeding);
      loadAnakan();
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnakan = async () => {
    try {
      const data = await api.getAyamAnakan(filterBreeding || null);
      setAnakanList(data);
    } catch (error) {
      toast.error('Gagal memuat data anakan');
    }
  };

  const getBreedingInfo = (breedingId) => {
    const breeding = breedingList.find(b => b.id === breedingId);
    return breeding ? `Breeding #${breeding.id?.substring(0, 8)}` : '-';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAnakan) {
        await api.updateAyamAnakan(editingAnakan.id, formData);
        toast.success('Ayam anakan berhasil diupdate');
      } else {
        await api.addAyamAnakan(formData);
        toast.success('Ayam anakan berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadAnakan();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        await api.deleteAyamAnakan(id);
        toast.success('Ayam anakan berhasil dihapus');
        loadAnakan();
      } catch (error) {
        toast.error('Gagal menghapus data');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ayam Anakan</h2>
          <p className="text-sm text-gray-500">Kelola data ayam hasil breeding</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterBreeding} onValueChange={setFilterBreeding}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="filter-breeding-select">
              <SelectValue placeholder="Filter Breeding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Breeding</SelectItem>
              {breedingList.map((breeding) => (
                <SelectItem key={breeding.id} value={breeding.id}>
                  #{breeding.id?.substring(0, 8)}
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
                      {breedingList.map((breeding) => (
                        <SelectItem key={breeding.id} value={breeding.id}>
                          Breeding #{breeding.id?.substring(0, 8)} - {breeding.tanggal_menetas}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="anakan-list">
          {anakanList.map((anakan) => (
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
      )}
    </div>
  );
};

export default AyamAnakanModule;
