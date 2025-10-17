import React, { useState, useEffect } from 'react';
import { apiV1 } from '../../services/api-v1';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const AyamIndukModuleV1 = () => {
  const [ayamList, setAyamList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAyam, setEditingAyam] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const loadAyamInduk = async () => {
    setLoading(true);
    try {
      const data = await apiV1.getAyamInduk();
      setAyamList(data);
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
        await apiV1.updateAyamInduk(editingAyam.id, formData);
        toast.success('Ayam indukan berhasil diupdate');
      } else {
        await apiV1.addAyamInduk(formData);
        toast.success('Ayam indukan berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadAyamInduk();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        await apiV1.deleteAyamInduk(id);
        toast.success('Ayam indukan berhasil dihapus');
        loadAyamInduk();
      } catch (error) {
        toast.error('Gagal menghapus data');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ayam Indukan</h2>
          <p className="text-sm text-gray-500">Kelola data ayam indukan Anda</p>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="indukan-list">
          {ayamList.map((ayam) => (
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
                    <span className="font-medium">
                      {ayam.tanggal_lahir ? new Date(ayam.tanggal_lahir).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
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
      )}
    </div>
  );
};

export default AyamIndukModuleV1;
