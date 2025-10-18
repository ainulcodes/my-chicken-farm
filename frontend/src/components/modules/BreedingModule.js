import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const BreedingModule = () => {
  const [breedingList, setBreedingList] = useState([]);
  const [ayamIndukList, setAyamIndukList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBreeding, setEditingBreeding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pejantan_id: '',
    betina_id: '',
    tanggal_kawin: '',
    tanggal_menetas: '',
    jumlah_anakan: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [breeding, indukan] = await Promise.all([
        api.getBreeding(),
        api.getAyamInduk()
      ]);
      setBreedingList(breeding);
      setAyamIndukList(indukan);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getAyamName = (id, gender) => {
    const ayam = ayamIndukList.find(a => a.id === id);
    return ayam ? `${ayam.kode} (${ayam.ras})` : '-';
  };

  const formatBreedingNumber = (breeding, index) => {
    const number = String(index + 1).padStart(3, '0');
    const date = breeding.tanggal_menetas ? new Date(breeding.tanggal_menetas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    return `Breeding #${number} - ${date}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi pejantan dan betina
    const pejantan = ayamIndukList.find(a => a.id === formData.pejantan_id);
    const betina = ayamIndukList.find(a => a.id === formData.betina_id);
    
    if (!pejantan || pejantan.jenis_kelamin !== 'Jantan') {
      toast.error('Pilih ayam jantan untuk pejantan');
      return;
    }
    
    if (!betina || betina.jenis_kelamin !== 'Betina') {
      toast.error('Pilih ayam betina untuk indukan betina');
      return;
    }
    
    setLoading(true);
    try {
      if (editingBreeding) {
        await api.updateBreeding(editingBreeding.id, formData);
        toast.success('Data breeding berhasil diupdate');
      } else {
        await api.addBreeding(formData);
        toast.success('Data breeding berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        await api.deleteBreeding(id);
        toast.success('Data breeding berhasil dihapus');
        loadData();
      } catch (error) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const handleEdit = (breeding) => {
    setEditingBreeding(breeding);
    setFormData({
      pejantan_id: breeding.pejantan_id,
      betina_id: breeding.betina_id,
      tanggal_kawin: breeding.tanggal_kawin,
      tanggal_menetas: breeding.tanggal_menetas,
      jumlah_anakan: breeding.jumlah_anakan
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      pejantan_id: '',
      betina_id: '',
      tanggal_kawin: '',
      tanggal_menetas: '',
      jumlah_anakan: 0
    });
    setEditingBreeding(null);
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const pejantanList = ayamIndukList.filter(a => a.jenis_kelamin === 'Jantan');
  const betinaList = ayamIndukList.filter(a => a.jenis_kelamin === 'Betina');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Data Breeding</h2>
          <p className="text-sm text-gray-500">Kelola data perkawinan ayam</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl shadow-md" data-testid="add-breeding-button">
              + Tambah Breeding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" data-testid="breeding-dialog">
            <DialogHeader>
              <DialogTitle>{editingBreeding ? 'Edit Data Breeding' : 'Tambah Data Breeding'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pejantan">Pejantan (Jantan)</Label>
                <Select
                  value={formData.pejantan_id}
                  onValueChange={(value) => setFormData({ ...formData, pejantan_id: value })}
                  required
                >
                  <SelectTrigger data-testid="breeding-pejantan-select">
                    <SelectValue placeholder="Pilih pejantan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pejantanList.map((ayam) => (
                      <SelectItem key={ayam.id} value={ayam.id}>
                        {ayam.kode} - {ayam.ras}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="betina">Indukan Betina</Label>
                <Select
                  value={formData.betina_id}
                  onValueChange={(value) => setFormData({ ...formData, betina_id: value })}
                  required
                >
                  <SelectTrigger data-testid="breeding-betina-select">
                    <SelectValue placeholder="Pilih indukan betina" />
                  </SelectTrigger>
                  <SelectContent>
                    {betinaList.map((ayam) => (
                      <SelectItem key={ayam.id} value={ayam.id}>
                        {ayam.kode} - {ayam.ras}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tanggal_kawin">Tanggal Kawin</Label>
                <Input
                  id="tanggal_kawin"
                  type="date"
                  value={formData.tanggal_kawin}
                  onChange={(e) => setFormData({ ...formData, tanggal_kawin: e.target.value })}
                  required
                  data-testid="breeding-tanggal-kawin-input"
                />
              </div>
              <div>
                <Label htmlFor="tanggal_menetas">Tanggal Menetas</Label>
                <Input
                  id="tanggal_menetas"
                  type="date"
                  value={formData.tanggal_menetas}
                  onChange={(e) => setFormData({ ...formData, tanggal_menetas: e.target.value })}
                  required
                  data-testid="breeding-tanggal-menetas-input"
                />
              </div>
              <div>
                <Label htmlFor="jumlah_anakan">Jumlah Anakan</Label>
                <Input
                  id="jumlah_anakan"
                  type="number"
                  min="0"
                  value={formData.jumlah_anakan}
                  onChange={(e) => setFormData({ ...formData, jumlah_anakan: parseInt(e.target.value) || 0 })}
                  data-testid="breeding-jumlah-input"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700" data-testid="breeding-submit-button">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {loading && breedingList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : breedingList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Belum ada data breeding</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="breeding-list">
          {breedingList.map((breeding, index) => (
            <Card key={breeding.id} className="hover:shadow-lg transition-shadow" data-testid={`breeding-item-${breeding.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {formatBreedingNumber(breeding, index)}
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {breeding.jumlah_anakan} Anakan
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Pejantan</p>
                    <p className="font-medium text-blue-900">{getAyamName(breeding.pejantan_id)}</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Indukan Betina</p>
                    <p className="font-medium text-pink-900">{getAyamName(breeding.betina_id)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Kawin</p>
                      <p className="font-medium">{formatDate(breeding.tanggal_kawin)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Menetas</p>
                      <p className="font-medium">{formatDate(breeding.tanggal_menetas)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(breeding)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`edit-breeding-${breeding.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(breeding.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    data-testid={`delete-breeding-${breeding.id}`}
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

export default BreedingModule;
