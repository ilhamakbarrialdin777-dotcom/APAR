import React, { useState, useEffect } from 'react';
import { Flame, Save, History, ArrowLeft, CheckCircle2, ClipboardCheck } from 'lucide-react';

type ChecklistItem = {
  id: string;
  label: string;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'kondisi_tabung', label: '1. Kondisi Tabung' },
  { id: 'pressure_gauge', label: '2. Pressure Gauge' },
  { id: 'pin_pengaman', label: '3. Pin Pengaman' },
  { id: 'seal_pengaman', label: '4. Seal Pengaman' },
  { id: 'hose_nozzle', label: '5. Hose / Nozzle' },
  { id: 'handle_tuas', label: '6. Handle / Tuas' },
  { id: 'kondisi_selang', label: '7. Kondisi Selang' },
  { id: 'tidak_bocor', label: '8. Tidak Ada Kebocoran' },
  { id: 'fisik_karat', label: '9. Kondisi Fisik / Karat' },
  { id: 'akses', label: '10. Akses Tidak Terhalang' },
  { id: 'label_terbaca', label: '11. Label / Petunjuk Terbaca' },
  { id: 'posisi_sesuai', label: '12. APAR Terpasang Sesuai Tempat' },
];

const WEEKS = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];

interface InspectionRecord {
  id: string;
  noApar: string;
  tipe: string;
  lokasi: string;
  kapasitas: string;
  week: string;
  date: string;
  checks: Record<string, boolean>;
  status: 'BAIK' | 'PERLU TINDAKAN';
  inspektor: string;
}

export default function App() {
  const [view, setView] = useState<'form' | 'history'>('form');
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [noApar, setNoApar] = useState('');
  const [tipe, setTipe] = useState('Dry Chemical Powder');
  const [lokasi, setLokasi] = useState('');
  const [kapasitas, setKapasitas] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(WEEKS[0]);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspektor, setInspektor] = useState('ILHAM AKBAR RIALDIN (HSE)');
  
  // Default all checks to true for efficiency, user only taps what is broken
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach(item => { initial[item.id] = true; });
    return initial;
  });

  useEffect(() => {
    const saved = localStorage.getItem('apar_inspections');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history');
      }
    }
  }, []);

  const handleCheck = (id: string, value: boolean) => {
    setChecks(prev => ({ ...prev, [id]: value }));
  };

  // Bulk action for efficiency
  const setAllChecks = (status: boolean) => {
    const updated: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach(item => { updated[item.id] = status; });
    setChecks(updated);
  };

  const isAllGood = Object.values(checks).every(v => v === true);
  const currentStatus = isAllGood ? 'BAIK' : 'PERLU TINDAKAN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      noApar,
      tipe,
      lokasi,
      kapasitas,
      week: selectedWeek,
      date: inspectionDate,
      checks,
      status: currentStatus,
      inspektor,
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    localStorage.setItem('apar_inspections', JSON.stringify(newHistory));
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form but keep general static data for next entry efficiency
      setChecks(() => {
        const reset: Record<string, boolean> = {};
        CHECKLIST_ITEMS.forEach(item => { reset[item.id] = true; });
        return reset;
      });
      setNoApar(''); // Usually different per physical extinguisher
    }, 2000); 
  };

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 font-sans">
        <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button onClick={() => setView('form')} className="p-2 hover:bg-red-700 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">RIWAYAT INSPEKSI</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 mt-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg">Belum ada data inspeksi.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`px-4 py-2 text-white text-sm font-bold flex justify-between items-center ${record.status === 'BAIK' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <span>{record.status}</span>
                    <span>{record.week}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">No. APAR</span>
                      <span className="font-bold text-gray-800">{record.noApar || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Lokasi</span>
                      <span className="font-medium text-gray-800">{record.lokasi || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Tanggal</span>
                      <span className="font-medium text-gray-800">{new Date(record.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-500 text-sm">Inspektor</span>
                      <span className="font-medium text-gray-800">{record.inspektor || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-24 font-sans text-gray-800">
      
      {/* Header matching the red aesthetic */}
      <header className="bg-[#E60000] text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white px-2 py-1 rounded-md h-10 flex items-center justify-center">
              <img 
                src="https://generativelanguage.googleapis.com/v1beta/files/f150s3j01j0" 
                alt="WPA Logo" 
                className="h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-wide">CHECKLIST INSPEKSI APAR</h1>
          </div>
          <button 
            onClick={() => setView('history')}
            className="flex items-center gap-1.5 text-sm font-bold bg-white text-[#E60000] px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
          >
            <History size={16} /> Data
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-2">
        {showSuccess && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-800 px-4 py-3 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            <p className="font-bold">Data inspeksi berhasil disimpan!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-lg overflow-hidden border-2 border-[#E60000]">
          
          {/* Header Card Area */}
          <div className="bg-[#E60000] text-white p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider">CHECKLIST INSPEKSI</h2>
            <h2 className="text-xl md:text-2xl font-bold tracking-wider mt-1">APAR MINGGUAN</h2>
          </div>

          {/* Identity Section */}
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b-4 border-[#E60000]">
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="font-bold w-28 shrink-0">NO. APAR</label>
                <span className="mr-2 font-bold">:</span>
                <input 
                  type="text" required
                  value={noApar} onChange={(e) => setNoApar(e.target.value)}
                  className="flex-1 border-b-2 border-gray-400 focus:border-[#E60000] outline-none px-1 py-1 font-mono uppercase bg-gray-50 focus:bg-white transition-colors"
                  placeholder="APAR-01"
                />
              </div>
              <div className="flex items-center">
                <label className="font-bold w-28 shrink-0">LOKASI</label>
                <span className="mr-2 font-bold">:</span>
                <input 
                  type="text" required
                  value={lokasi} onChange={(e) => setLokasi(e.target.value)}
                  className="flex-1 border-b-2 border-gray-400 focus:border-[#E60000] outline-none px-1 py-1 uppercase bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Lantai 1"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="font-bold w-28 shrink-0">TIPE</label>
                <span className="mr-2 font-bold">:</span>
                <select 
                  value={tipe} onChange={(e) => setTipe(e.target.value)}
                  className="flex-1 border-b-2 border-gray-400 focus:border-[#E60000] outline-none px-1 py-1 bg-gray-50 focus:bg-white font-medium"
                >
                  <option value="Dry Chemical Powder">Dry Chemical Powder</option>
                  <option value="CO2">CO2</option>
                  <option value="Foam AFFF">Foam AFFF</option>
                  <option value="Water">Water</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="font-bold w-28 shrink-0">KAPASITAS</label>
                <span className="mr-2 font-bold">:</span>
                <div className="flex-1 flex items-end">
                   <input 
                    type="number" required step="0.5"
                    value={kapasitas} onChange={(e) => setKapasitas(e.target.value)}
                    className="w-full border-b-2 border-gray-400 focus:border-[#E60000] outline-none px-1 py-1 text-center font-mono bg-gray-50 focus:bg-white transition-colors"
                    placeholder="3"
                  />
                  <span className="ml-2 font-bold text-gray-600">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Digital Enhancement for Efficiency) */}
          <div className="bg-gray-100 p-3 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E60000]">
            <div className="flex items-center gap-3 w-full md:w-auto">
               <select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-white border-2 border-[#E60000] text-[#E60000] font-bold py-1.5 px-3 outline-none w-full md:w-auto text-center"
                >
                  {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <input 
                  type="date" required
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="bg-white border-2 border-[#E60000] text-gray-800 font-bold py-1.5 px-3 outline-none w-full md:w-auto text-center"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="button" onClick={() => setAllChecks(true)} className="flex-1 text-xs font-bold bg-green-100 text-green-700 border border-green-300 px-3 py-1.5 rounded hover:bg-green-200">
                Pilih Semua Baik (✓)
              </button>
              <button type="button" onClick={() => setAllChecks(false)} className="flex-1 text-xs font-bold bg-red-100 text-red-700 border border-red-300 px-3 py-1.5 rounded hover:bg-red-200">
                Reset Semua (X)
              </button>
            </div>
          </div>

          {/* Checklist Table - Digital Optimized */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E60000] text-white">
                  <th className="py-3 px-4 font-bold border-r border-white/20 w-3/5 md:w-auto">ITEM PEMERIKSAAN</th>
                  <th className="py-3 px-2 font-bold text-center text-sm">KONDISI (✓ / X)</th>
                </tr>
              </thead>
              <tbody>
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-red-50'} border-b border-[#E60000]/20`}>
                    <td className="py-3 px-4 font-medium text-gray-800 border-r border-[#E60000]/20">{item.label}</td>
                    <td className="py-2 px-2 text-center">
                      {/* Toggle Button for Efficiency */}
                      <button
                        type="button"
                        onClick={() => handleCheck(item.id, !checks[item.id])}
                        className={`w-16 h-8 flex items-center justify-center rounded-md font-bold text-lg mx-auto transition-all shadow-sm ${
                          checks[item.id] 
                            ? 'bg-green-500 text-white border-b-2 border-green-700' 
                            : 'bg-red-500 text-white border-b-2 border-red-700'
                        }`}
                      >
                        {checks[item.id] ? '✓' : 'X'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Validation Area */}
          <div className="p-4 md:p-6 bg-white space-y-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="font-bold text-gray-700 w-32 shrink-0">STATUS AKHIR :</label>
              <div className="flex gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 font-bold transition-colors ${currentStatus === 'BAIK' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center ${currentStatus === 'BAIK' ? 'border-green-500' : 'border-gray-300'}`}>
                    {currentStatus === 'BAIK' && <span className="text-green-500 leading-none mb-1">✓</span>}
                  </div>
                  BAIK
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 font-bold transition-colors ${currentStatus === 'PERLU TINDAKAN' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center ${currentStatus === 'PERLU TINDAKAN' ? 'border-red-500' : 'border-gray-300'}`}>
                     {currentStatus === 'PERLU TINDAKAN' && <span className="text-red-500 leading-none mb-1 mt-0.5">X</span>}
                  </div>
                  PERLU TINDAKAN
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-end">
                <label className="font-bold text-gray-700 mb-1">INSPEKTOR :</label>
                <input 
                  type="text" required
                  value={inspektor} onChange={(e) => setInspektor(e.target.value)}
                  className="w-full border-b-2 border-gray-400 focus:border-[#E60000] outline-none py-1 font-medium bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Nama Terang"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#E60000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Save size={20} />
                  SIMPAN INSPEKSI
                </button>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
