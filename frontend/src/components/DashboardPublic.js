import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { cachedAPI } from '../services/cachedApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

const DashboardPublic = () => {
    const navigate = useNavigate(); // Initialize hook
    const [indukanList, setIndukanList] = useState([]);
    const [anakanList, setAnakanList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('all'); // all, indukan, anakan

    useEffect(() => {
        loadPublicData();
    }, []);

    const loadPublicData = async () => {
        setLoading(true);
        try {
            const [indukanRes, anakanRes] = await Promise.all([
                cachedAPI.getAyamInduk(),
                cachedAPI.getAyamAnakan()
            ]);
            setIndukanList(indukanRes.data || []);
            setAnakanList(anakanRes.data || []);
        } catch (error) {
            console.error("Error loading public data", error);
            toast.error("Gagal memuat data katalog.");
        } finally {
            setLoading(false);
        }
    };

    // Combine and Filter Data
    const filteredData = useMemo(() => {
        let data = [];

        // Normalize data structure for unified display
        const normalizedIndukan = indukanList.map(item => ({
            ...item,
            type: 'Indukan',
            title: `Indukan ${item.kode}`,
            subtitle: `${item.ras} • ${item.warna}`,
            date: item.tanggal_lahir,
            imagePlaceholder: '🐔'
        }));

        const normalizedAnakan = anakanList.map(item => ({
            ...item,
            type: 'Anakan',
            title: `Anakan ${item.kode}`,
            subtitle: `${item.warna} • Est. ${item.jenis_kelamin || 'Unknown'}`,
            date: item.tanggal_menetas, // Use breeding date/hatch date logic if available
            imagePlaceholder: '🐣'
        }));

        // Filter by Tab
        if (activeTab === 'indukan') data = normalizedIndukan;
        else if (activeTab === 'anakan') data = normalizedAnakan;
        else data = [...normalizedIndukan, ...normalizedAnakan];

        // Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.kode.toLowerCase().includes(lowerTerm) ||
                item.ras?.toLowerCase().includes(lowerTerm) ||
                item.warna?.toLowerCase().includes(lowerTerm)
            );
        }

        // Filter by Status
        if (filterStatus !== 'all') {
            data = data.filter(item => item.status === filterStatus);
        }

        return data;
    }, [indukanList, anakanList, activeTab, searchTerm, filterStatus]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sehat': return 'bg-emerald-100 text-emerald-800';
            case 'Sakit': return 'bg-red-100 text-red-800';
            case 'Dijual': return 'bg-blue-100 text-blue-800';
            case 'Mati': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16 px-4 mb-8 shadow-lg">
                <div className="container mx-auto max-w-6xl text-center">
                    <div className="flex justify-end absolute top-4 right-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => navigate('/login')}
                        >
                            🔒 Login Admin
                        </Button>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Galeri Peternakan
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Katalog lengkap ayam indukan unggulan dan anakan berkualitas siap adopsi.
                    </p>
                </div>
            </div>

            {/* Search & Filter Section */}
            <div className="container mx-auto max-w-6xl px-4 -mt-16 relative z-10">
                <Card className="shadow-xl border-0">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            {/* Tabs */}
                            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full md:w-auto">
                                <TabsList className="grid w-full md:w-[300px] grid-cols-3">
                                    <TabsTrigger value="all">Semua</TabsTrigger>
                                    <TabsTrigger value="indukan">Indukan</TabsTrigger>
                                    <TabsTrigger value="anakan">Anakan</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Search & Status Filter */}
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-[300px]">
                                    <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                                    <Input
                                        placeholder="Cari kode, ras, atau warna..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="Sehat">🟢 Sehat</SelectItem>
                                        <SelectItem value="Dijual">🔵 Dijual</SelectItem>
                                        <SelectItem value="Sakit">🔴 Sakit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gallery Grid */}
            <div className="container mx-auto max-w-6xl px-4 mt-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat katalog...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                        <p className="text-5xl mb-4">🐔</p>
                        <h3 className="text-xl font-medium text-gray-700">Tidak ada data ditemukan</h3>
                        <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter anda.</p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); setActiveTab('all'); }}
                        >
                            Reset Filter
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map((item) => (
                            <Card key={`${item.type}-${item.id}`} className="hover:shadow-lg transition-all duration-300 overflow-hidden group border-emerald-100/50">
                                <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                    {/* Placeholder pattern or generic image */}
                                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500 ease-in-out">
                                        {item.imagePlaceholder}
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <Badge className={`${getStatusColor(item.status)} shadow-sm`}>
                                            {item.status || 'Unknown'}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 shadow-sm text-xs font-semibold">
                                            {item.type}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl text-emerald-950">{item.title}</CardTitle>
                                            <p className="text-emerald-600 font-medium text-sm mt-1">{item.subtitle}</p>
                                        </div>
                                        {item.jenis_kelamin && (
                                            <Badge variant="secondary" className="text-xs">
                                                {item.jenis_kelamin}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mt-2 pt-4 border-t border-gray-100">
                                        <div>
                                            <span className="block text-xs text-gray-400">Kode</span>
                                            <span className="font-mono">{item.kode}</span>
                                        </div>
                                        {item.date && (
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-400">
                                                    {item.type === 'Indukan' ? 'Lahir' : 'Menetas'}
                                                </span>
                                                <span>{new Date(item.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                        {item.ras && (
                                            <div className="col-span-2">
                                                <span className="block text-xs text-gray-400">Ras</span>
                                                <span>{item.ras}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-20 py-8 bg-white border-t text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Galeri Peternakan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardPublic;
