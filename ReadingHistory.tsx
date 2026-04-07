import React from 'react';
import { 
  History, 
  Droplets, 
  Thermometer, 
  Search, 
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { cn, formatDate } from '../lib/utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

export const ReadingHistory: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dipstick' | 'density'>('dipstick');
  const [filterStationId, setFilterStationId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const stations = storage.getStations();
  const tanks = storage.getTanks();
  const dipReadings = storage.getDipstickReadings();
  const densityReadings = storage.getDensityReadings();

  const filteredDipReadings = dipReadings
    .filter(r => !filterStationId || r.stationId === filterStationId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const filteredDensityReadings = densityReadings
    .filter(r => !filterStationId || r.stationId === filterStationId)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('dipstick')}
            className={cn(
              "flex-1 lg:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'dipstick' 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Droplets size={16} />
            Dipstick
          </button>
          <button
            onClick={() => setActiveTab('density')}
            className={cn(
              "flex-1 lg:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'density' 
                ? "bg-amber-600 text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Thermometer size={16} />
            Density
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Select
            className="h-10 w-full sm:w-48"
            value={filterStationId}
            onChange={(e) => setFilterStationId(e.target.value)}
            options={stations.map(s => ({ value: s.id, label: s.name }))}
          />
          <Button variant="outline" className="gap-2 w-full sm:w-auto py-2">
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          {activeTab === 'dipstick' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Tank</th>
                  <th className="px-6 py-4 text-center">Reading (CM)</th>
                  <th className="px-6 py-4 text-right">Volume (Litres)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDipReadings.length > 0 ? (
                  filteredDipReadings.map((reading) => {
                    const station = stations.find(s => s.id === reading.stationId);
                    const tank = tanks.find(t => t.id === reading.tankId);
                    return (
                      <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reading.timestamp)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{station?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {reading.fuelType}
                          </span>
                          {tank?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-mono text-slate-600">{reading.readingCm.toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-blue-600 font-mono">
                          {reading.volumeLitres.toLocaleString()} L
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={32} className="text-slate-200" />
                        <p>No dipstick readings found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Fuel Type</th>
                  <th className="px-6 py-4 text-center">Temperature (°C)</th>
                  <th className="px-6 py-4 text-right">Density (kg/L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDensityReadings.length > 0 ? (
                  filteredDensityReadings.map((reading) => {
                    const station = stations.find(s => s.id === reading.stationId);
                    return (
                      <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reading.timestamp)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{station?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            reading.fuelType === 'Petrol' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                          )}>
                            {reading.fuelType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-mono text-slate-600">{reading.temperature.toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-amber-600 font-mono">
                          {reading.density.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={32} className="text-slate-200" />
                        <p>No density logs found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {activeTab === 'dipstick' ? (
            filteredDipReadings.length > 0 ? (
              filteredDipReadings.map((reading) => {
                const station = stations.find(s => s.id === reading.stationId);
                const tank = tanks.find(t => t.id === reading.tankId);
                return (
                  <div key={reading.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{station?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{tank?.name || 'Unknown'}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{formatDate(reading.timestamp)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {reading.fuelType}
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Volume</p>
                        <p className="text-lg font-mono font-bold text-blue-600">{reading.volumeLitres.toLocaleString()} L</p>
                        <p className="text-[10px] font-mono text-slate-400">{reading.readingCm.toFixed(1)} CM</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={32} className="text-slate-200 mx-auto mb-2" />
                <p>No readings found</p>
              </div>
            )
          ) : (
            filteredDensityReadings.length > 0 ? (
              filteredDensityReadings.map((reading) => {
                const station = stations.find(s => s.id === reading.stationId);
                return (
                  <div key={reading.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900">{station?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{formatDate(reading.timestamp)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        reading.fuelType === 'Petrol' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                      )}>
                        {reading.fuelType}
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Density</p>
                        <p className="text-lg font-mono font-bold text-amber-600">{reading.density.toFixed(4)}</p>
                        <p className="text-[10px] font-mono text-slate-400">{reading.temperature.toFixed(1)} °C</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={32} className="text-slate-200 mx-auto mb-2" />
                <p>No logs found</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
