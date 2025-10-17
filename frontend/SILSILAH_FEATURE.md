# 🌳 Fitur Silsilah Breeding

Halaman visualisasi hierarki breeding yang menampilkan family tree dari indukan ke keturunan.

## 📍 Lokasi File

- **Component**: `/src/components/modules/BreedingTreePage-v1.js`
- **Dashboard**: `/src/components/Dashboard-v1.js`
- **App**: `/src/App-v1.js`

## ✨ Fitur Utama

### 1. Tree Visualization
- **Expandable/Collapsible Cards**: Setiap breeding bisa di-expand untuk lihat detail atau collapse untuk view ringkas
- **Visual Hierarchy**: Jelas menampilkan Parent → Offspring relationship
- **Color Coding**:
  - 🔵 Biru: Pejantan (Jantan)
  - 🌸 Pink: Betina (Betina)
  - 🟡 Kuning: Anakan (Offspring)

### 2. Search & Filter
- Search by kode ayam (JTN-001, BTN-001, ANK-001)
- Search by ras (Bangkok, Saigon, Burma, dll)
- Search by warna
- Real-time filtering

### 3. Batch Operations
- **Expand All**: Buka semua breeding cards sekaligus
- **Collapse All**: Tutup semua breeding cards
- **Refresh**: Reload data dari API

### 4. Data Display

**Per Breeding Card:**
- Breeding ID
- Tanggal Kawin
- Tanggal Menetas
- Jumlah Anakan
- Detail Pejantan (Kode, Ras, Warna, Tanggal Lahir)
- Detail Betina (Kode, Ras, Warna, Tanggal Lahir)
- List semua Anakan dengan status masing-masing

**Statistics:**
- Total Breeding Records
- Total Indukan (Parent Chickens)
- Total Anakan (Offspring)
- Filtered Results Count

## 🎨 UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ 🌳 Silsilah Breeding                                    │
│ Visualisasi hierarki breeding - dari indukan ke        │
│ keturunan                                               │
├─────────────────────────────────────────────────────────┤
│ [Search.....................] [↓ Expand] [→ Collapse]  │
│ [🔄 Refresh]                                            │
│                                                         │
│ 📊 50 Breeding | 100 Indukan | 150 Anakan              │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐   │
│ │ ❤️ Breeding #1                            [▼]    │   │
│ │ 📅 Kawin: 2024-01-15  📅 Menetas: 2024-02-05     │   │
│ │ 👶 3 Anakan                                       │   │
│ ├───────────────────────────────────────────────────┤   │
│ │ ❤️ INDUKAN (Parents)                             │   │
│ │                                                   │   │
│ │ ┌─────────────────┐   ❤️   ┌─────────────────┐  │   │
│ │ │ ♂ Jantan        │         │ ♀ Betina        │  │   │
│ │ │ JTN-001         │         │ BTN-001         │  │   │
│ │ │ Bangkok         │         │ Saigon          │  │   │
│ │ │ Warna: Merah    │         │ Warna: Putih    │  │   │
│ │ │ Lahir: 2022-05  │         │ Lahir: 2022-06  │  │   │
│ │ └─────────────────┘         └─────────────────┘  │   │
│ │                                                   │   │
│ │ 👶 KETURUNAN (3 Anakan)                          │   │
│ │                     │                             │   │
│ │                     ●                             │   │
│ │ ┌──────────┬──────────┬──────────┐              │   │
│ │ │🐣 Anakan │🐣 Anakan │🐣 Anakan │              │   │
│ │ │ ANK-001  │ ANK-002  │ ANK-003  │              │   │
│ │ │ Merah    │ Putih    │ Blorok   │              │   │
│ │ │✅ Sehat  │✅ Sehat  │❌ Sakit  │              │   │
│ │ └──────────┴──────────┴──────────┘              │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ [More breeding cards...]                                │
└─────────────────────────────────────────────────────────┘
```

### Visual Elements
- **Heart Icon (❤️)**: Menunjukkan breeding/mating
- **Connector Lines**: Visual flow dari parent ke offspring
- **Badges**: Status indicators (Sehat, Sakit, Dijual, Mati)
- **Hover Effects**: Cards elevate on hover
- **Smooth Transitions**: Expand/collapse animations

## 🔧 Technical Details

### API Integration
- Menggunakan `api-v1.js` dengan caching
- Three parallel API calls untuk efisiensi:
  ```javascript
  - api.getAllBreeding()
  - api.getAllAyamInduk()
  - api.getAllAyamAnakan()
  ```
- IndexedDB caching untuk performa optimal
- Auto-refresh support

### State Management
```javascript
const [breedingData, setBreedingData] = useState([]);
const [indukanData, setIndukanData] = useState([]);
const [anakanData, setAnakanData] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [expandedNodes, setExpandedNodes] = useState(new Set());
```

### Helper Functions
- `getIndukanById(id)`: Cari indukan by ID
- `getAnakanByBreedingId(breedingId)`: Ambil semua anakan dari breeding tertentu
- `toggleNode(nodeId)`: Expand/collapse individual node
- `expandAll()`: Expand semua nodes
- `collapseAll()`: Collapse semua nodes
- `filteredBreeding`: Filter breeding berdasarkan search term

### Performance
- Lazy rendering: Hanya render detail breeding yang di-expand
- Efficient search: Client-side filtering dengan toLowerCase
- Cached API calls: Reduce redundant network requests
- Optimized re-renders dengan proper key props

## 📱 Responsive Design

- **Mobile**: Single column layout untuk breeding cards
- **Tablet**: 2 columns untuk anakan, side-by-side parents
- **Desktop**: 3 columns untuk anakan, optimal spacing

## 🎯 Use Cases

1. **Tracking Lineage**: Lihat keturunan dari pasangan indukan tertentu
2. **Breeding Planning**: Identifikasi indukan yang produktif
3. **Health Monitoring**: Monitor status kesehatan anakan per breeding
4. **Quality Analysis**: Analisa kualitas keturunan berdasarkan parent
5. **Record Keeping**: Dokumentasi breeding history

## 🚀 Cara Menggunakan

### Akses Halaman
1. Jalankan app dengan App-v1.js:
   ```bash
   # Update index.js untuk use App-v1
   npm start
   ```

2. Di Dashboard, klik card **"🌳 Silsilah"**

### Navigasi
- **Klik Breeding Card**: Expand/collapse untuk lihat detail
- **Search Box**: Ketik kode/ras/warna untuk filter
- **Expand All**: Buka semua breeding sekaligus
- **Collapse All**: Tutup semua untuk overview
- **Refresh**: Reload data terbaru

### Tips
- Gunakan search untuk cari breeding spesifik
- Expand All untuk export/screenshot full tree
- Monitor badge status untuk health tracking
- Klik refresh setelah add/edit breeding

## 🧪 Testing Checklist

- [ ] Load data dengan dummy data (100+ breeding)
- [ ] Search functionality works
- [ ] Expand/collapse individual nodes
- [ ] Expand All / Collapse All
- [ ] Responsive di mobile/tablet/desktop
- [ ] Cache notification (tidak show saat load dari cache)
- [ ] Refresh button works
- [ ] Empty state (no breeding data)
- [ ] Filtered empty state (no search results)
- [ ] Parent data displays correctly
- [ ] Offspring data displays correctly
- [ ] Status badges show correct variant
- [ ] Performance dengan large dataset (300+ items)

## 🔮 Future Enhancements

Potential features untuk v2:

1. **Multi-Generation Tree**: Show grandparents & great-grandparents
2. **Export to PDF/Image**: Download silsilah as document
3. **Print View**: Optimized layout untuk print
4. **Interactive Diagram**: Drag-and-drop tree builder
5. **Genetic Traits Tracking**: Color/ras inheritance visualization
6. **Performance Metrics**: Win rate by lineage
7. **Breeding Recommendations**: AI-suggested pairings
8. **Timeline View**: Chronological breeding history
9. **Comparison Mode**: Compare multiple breeding lines
10. **Share Tree**: Generate shareable link

## 📚 Related Files

- `AyamIndukModule-v1.js`: Manage parent chickens
- `BreedingModule-v1.js`: Create breeding pairs
- `AyamAnakanModule-v1.js`: Manage offspring
- `api-v1.js`: API service with caching
- `Dashboard-v1.js`: Main navigation
- `App-v1.js`: Application entry point

---

💡 **Pro Tip**: Generate dummy data dulu untuk testing full dengan:
```bash
node generate-dummy-node.js
```

Akan create 100 indukan, 50 breeding, 150 anakan - perfect untuk test pagination & tree visualization!
