import React from 'react';
import { 
  Droplets, 
  Fuel, 
  Calculator, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { storage } from '../lib/storage';
import { FuelStation, FuelTank, DipChart } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { interpolateVolume } from '../lib/dipChart';
import { cn } from '../lib/utils';

export const DipstickReading: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = React.useState('');
  const [selectedTankId, setSelectedTankId] = React.useState('');
  const [readingCm, setReadingCm] = React.useState('');
  const [result, setResult] = React.useState<number | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const stations = storage.getStations();
  const tanks = storage.getTanks().filter(t => t.stationId === selectedStationId);
  const selectedTank = tanks.find(t => t.id === selectedTankId);
  const dipCharts = storage.getDipCharts();

  const handleCalculate = () => {
    if (!selectedTankId || !readingCm) return;
    
    const chart = dipCharts.find(c => c.tankId === selectedTankId);
    if (!chart) {
      alert('No dip chart found for this tank. Please contact admin.');
      return;
    }

    const cm = parseFloat(readingCm);
    const volume = interpolateVolume(cm, chart.points);
    setResult(volume);
  };

  const handleSave = () => {
    if (!selectedStationId || !selectedTankId || !readingCm || result === null) return;

    setIsSaving(true);
    const currentUser = storage.getCurrentUser();

    storage.saveDipstickReading({
      id: crypto.randomUUID(),
      stationId: selectedStationId,
      tankId: selectedTankId,
      fuelType: selectedTank?.fuelType || 'Petrol',
      readingCm: parseFloat(readingCm),
      volumeLitres: result,
      timestamp: Date.now(),
      userId: currentUser?.id || 'unknown',
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setReadingCm('');
      setResult(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Droplets size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">New Dipstick Reading</h2>
            <p className="text-sm sm:text-base text-slate-500">Enter the current dip reading to calculate fuel volume.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Select
            label="Fuel Station"
            value={selectedStationId}
            onChange={(e) => {
              setSelectedStationId(e.target.value);
              setSelectedTankId('');
              setResult(null);
            }}
            options={stations.map(s => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Fuel Tank"
            value={selectedTankId}
            onChange={(e) => {
              setSelectedTankId(e.target.value);
              setResult(null);
            }}
            disabled={!selectedStationId}
            options={tanks.map(t => ({ value: t.id, label: `${t.name} (${t.fuelType})` }))}
          />

          <div className="md:col-span-2">
            <Input
              label="Dipstick Reading (CM)"
              type="number"
              step="0.1"
              placeholder="e.g. 125.4"
              value={readingCm}
              onChange={(e) => {
                setReadingCm(e.target.value);
                setResult(null);
              }}
              disabled={!selectedTankId}
            />
            {selectedTank && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Info size={12} />
                Max dip for this tank: {selectedTank.maxDip} CM
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            className="flex-1 gap-2 py-3 sm:py-2" 
            onClick={handleCalculate}
            disabled={!selectedTankId || !readingCm}
          >
            <Calculator size={18} />
            Calculate Volume
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1 gap-2 py-3 sm:py-2"
            onClick={() => {
              setSelectedStationId('');
              setSelectedTankId('');
              setReadingCm('');
              setResult(null);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Result Card */}
      {result !== null && (
        <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-blue-100 font-medium uppercase tracking-wider text-xs sm:text-sm">Calculated Volume</p>
              <h3 className="text-4xl sm:text-5xl font-bold font-mono">
                {result.toLocaleString()} <span className="text-xl sm:text-2xl font-normal">Litres</span>
              </h3>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-blue-100 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Fuel size={16} />
                  {selectedTank?.fuelType}
                </div>
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Droplets size={16} />
                  {readingCm} CM
                </div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full md:w-auto gap-2 bg-white text-blue-600 hover:bg-blue-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="text-emerald-500" />
          <p className="font-medium">Reading saved successfully to history.</p>
        </div>
      )}

      {!selectedTankId && (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 p-6 rounded-xl flex items-start gap-4">
          <AlertTriangle className="text-slate-400 shrink-0 mt-1" />
          <div>
            <p className="font-medium text-slate-800">No Tank Selected</p>
            <p className="text-sm">Please select a fuel station and then a specific tank to begin calculation. Ensure the admin has uploaded a dip chart for the selected tank.</p>
          </div>
        </div>
      )}
    </div>
  );
};
