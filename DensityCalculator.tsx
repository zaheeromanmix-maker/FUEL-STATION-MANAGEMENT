import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Calculator, 
  Save, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { storage } from '../lib/storage';
import { FuelType } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

export const DensityCalculator: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = React.useState('');
  const [fuelType, setFuelType] = React.useState<FuelType | ''>('');
  const [temperature, setTemperature] = React.useState('');
  const [result, setResult] = React.useState<number | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const stations = storage.getStations();

  const handleCalculate = () => {
    if (!fuelType || !temperature) return;
    
    const temp = parseFloat(temperature);
    
    // Simple density calculation logic (mock)
    // Base density at 15°C: Petrol ~0.74, Diesel ~0.84
    let baseDensity = fuelType === 'Petrol' ? 0.74 : 0.84;
    if (fuelType === 'High Octane') baseDensity = 0.76;
    if (fuelType === 'Kerosene') baseDensity = 0.81;

    // Density decreases as temperature increases
    const tempDiff = temp - 15;
    const density = baseDensity - (tempDiff * 0.0007);
    
    setResult(Math.round(density * 10000) / 10000);
  };

  const handleSave = () => {
    if (!selectedStationId || !fuelType || !temperature || result === null) return;

    setIsSaving(true);
    const currentUser = storage.getCurrentUser();

    storage.saveDensityReading({
      id: crypto.randomUUID(),
      stationId: selectedStationId,
      fuelType: fuelType as FuelType,
      temperature: parseFloat(temperature),
      density: result,
      timestamp: Date.now(),
      userId: currentUser?.id || 'unknown',
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTemperature('');
      setResult(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Thermometer size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Fuel Density Calculator</h2>
            <p className="text-sm sm:text-base text-slate-500">Calculate fuel density based on type and temperature.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Select
            label="Fuel Station"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            options={stations.map(s => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Fuel Type"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
            options={[
              { value: 'Petrol', label: 'Petrol' },
              { value: 'Diesel', label: 'Diesel' },
              { value: 'High Octane', label: 'High Octane' },
              { value: 'Kerosene', label: 'Kerosene' },
            ]}
          />

          <div className="md:col-span-2">
            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              placeholder="e.g. 25.5"
              value={temperature}
              onChange={(e) => {
                setTemperature(e.target.value);
                setResult(null);
              }}
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info size={12} />
              Density is calculated relative to 15°C standard.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            className="flex-1 gap-2 py-3 sm:py-2 bg-amber-600 hover:bg-amber-700" 
            onClick={handleCalculate}
            disabled={!fuelType || !temperature}
          >
            <Calculator size={18} />
            Calculate Density
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1 gap-2 py-3 sm:py-2"
            onClick={() => {
              setFuelType('');
              setTemperature('');
              setResult(null);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Result Card */}
      {result !== null && (
        <div className="bg-amber-600 text-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-amber-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-amber-100 font-medium uppercase tracking-wider text-xs sm:text-sm">Calculated Density</p>
              <h3 className="text-4xl sm:text-5xl font-bold font-mono">
                {result.toFixed(4)} <span className="text-xl sm:text-2xl font-normal">kg/L</span>
              </h3>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-amber-100 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Droplets size={16} />
                  {fuelType}
                </div>
                <div className="w-1 h-1 bg-amber-400 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Thermometer size={16} />
                  {temperature} °C
                </div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full md:w-auto gap-2 bg-white text-amber-600 hover:bg-amber-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
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
          <p className="font-medium">Density record saved successfully.</p>
        </div>
      )}
    </div>
  );
};
