import React from 'react';
import { 
  Plus, 
  Table, 
  Upload, 
  Download, 
  Trash2, 
  Save, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from '../lib/storage';
import { FuelTank, DipChart, DipChartPoint } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { generateMmChart } from '../lib/dipChart';
import { cn } from '../lib/utils';

export const DipCharts: React.FC = () => {
  const [tanks, setTanks] = React.useState(storage.getTanks());
  const [stations, setStations] = React.useState(storage.getStations());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTankId, setSelectedTankId] = React.useState('');
  const [points, setPoints] = React.useState<DipChartPoint[]>([]);
  const [viewMode, setViewMode] = React.useState<'cm' | 'mm'>('cm');
  const [expandedTankId, setExpandedTankId] = React.useState<string | null>(null);

  const handleAddRow = () => {
    setPoints([...points, { cm: 0, litres: 0 }].sort((a, b) => a.cm - b.cm));
  };

  const handleRemoveRow = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (index: number, field: keyof DipChartPoint, value: string) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], [field]: parseFloat(value) || 0 };
    setPoints(newPoints);
  };

  const handleSave = () => {
    if (!selectedTankId || points.length < 2) return;
    
    const sortedPoints = [...points].sort((a, b) => a.cm - b.cm);
    storage.saveDipChart({
      id: crypto.randomUUID(),
      tankId: selectedTankId,
      points: sortedPoints,
    });
    
    setIsModalOpen(false);
    setSelectedTankId('');
    setPoints([]);
  };

  const handleDownloadSample = () => {
    const data = [
      ['CM', 'LITRES'],
      [0, 0],
      [10, 500],
      [20, 1000],
      [50, 2500],
      [100, 5000],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DipChart');
    XLSX.writeFile(wb, 'dip_chart_sample.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const newPoints: DipChartPoint[] = jsonData
        .map(row => ({
          cm: parseFloat(row.CM || row.cm || 0),
          litres: parseFloat(row.LITRES || row.litres || row.Litres || 0)
        }))
        .filter(p => !isNaN(p.cm) && !isNaN(p.litres))
        .sort((a, b) => a.cm - b.cm);

      if (newPoints.length > 0) {
        setPoints(newPoints);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const dipCharts = storage.getDipCharts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dip Charts Management</h2>
          <p className="text-slate-500">Configure CM-to-Litres conversion charts for each tank.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
            <Download size={18} />
            Sample Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={18} />
            Add Dip Chart
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {tanks.map((tank) => {
          const station = stations.find(s => s.id === tank.stationId);
          const chart = dipCharts.find(c => c.tankId === tank.id);
          const isExpanded = expandedTankId === tank.id;

          return (
            <div key={tank.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedTankId(isExpanded ? null : tank.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", chart ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                    <Table size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{tank.name}</h3>
                    <p className="text-xs text-slate-500">{station?.name} • {tank.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
                    <p className={cn("text-sm font-medium", chart ? "text-emerald-600" : "text-amber-600")}>
                      {chart ? `${chart.points.length} Points Configured` : 'No Chart Uploaded'}
                    </p>
                  </div>
                  {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && chart && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setViewMode('cm')}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                          viewMode === 'cm' ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        CM View
                      </button>
                      <button
                        onClick={() => setViewMode('mm')}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                          viewMode === 'mm' ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        MM Precision (Interpolated)
                      </button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedTankId(tank.id);
                        setPoints(chart.points);
                        setIsModalOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit2 size={14} className="text-blue-500" />
                      Edit Chart
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {(viewMode === 'cm' ? chart.points : generateMmChart(chart.points)).slice(0, 48).map((p, i) => (
                      <div key={i} className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.cm.toFixed(1)} CM</p>
                        <p className="text-sm font-mono font-bold text-blue-600">{p.litres.toLocaleString()}</p>
                      </div>
                    ))}
                    {chart.points.length > 48 && (
                      <div className="bg-white p-2 rounded border border-slate-200 text-center flex items-center justify-center text-xs text-slate-400 italic">
                        + more points
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Dip Chart"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Select Tank"
              value={selectedTankId}
              onChange={(e) => setSelectedTankId(e.target.value)}
              options={tanks.map(t => ({ value: t.id, label: `${t.name} (${t.fuelType})` }))}
            />
            
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chart Data Points</h4>
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold hover:bg-emerald-100 transition-colors">
                    <Upload size={14} />
                    Upload Excel
                  </div>
                </label>
                <Button variant="outline" size="sm" onClick={handleAddRow} className="h-8 gap-1.5 text-xs">
                  <Plus size={14} />
                  Add Row
                </Button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
              {points.length > 0 ? (
                points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white group">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="CM"
                        value={point.cm}
                        onChange={(e) => handleUpdatePoint(index, 'cm', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Litres"
                        value={point.litres}
                        onChange={(e) => handleUpdatePoint(index, 'litres', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRow(index)}
                      className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <FileSpreadsheet size={32} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">No data points yet. Add rows manually or upload an Excel file.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={!selectedTankId || points.length < 2}>
              <Save size={18} />
              Save Dip Chart
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper for Edit icon
const Edit2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
);
