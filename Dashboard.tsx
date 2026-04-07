import React from 'react';
import { 
  Fuel, 
  Droplets, 
  Thermometer, 
  History, 
  TrendingUp, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { cn, formatDate } from '../lib/utils';
import { Button } from '../components/Button';

export const Dashboard: React.FC = () => {
  const stations = storage.getStations();
  const tanks = storage.getTanks();
  const dipReadings = storage.getDipstickReadings();
  const densityReadings = storage.getDensityReadings();

  const stats = [
    { label: 'Total Stations', value: stations.length, icon: Fuel, color: 'bg-blue-500' },
    { label: 'Total Tanks', value: tanks.length, icon: Droplets, color: 'bg-indigo-500' },
    { label: 'Dip Readings', value: dipReadings.length, icon: History, color: 'bg-emerald-500' },
    { label: 'Density Logs', value: densityReadings.length, icon: Thermometer, color: 'bg-amber-500' },
  ];

  const recentReadings = [...dipReadings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={cn("p-3 rounded-lg text-white", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Readings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Recent Dipstick Readings
            </h3>
            <Link to="/history">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View All
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Station</th>
                  <th className="px-6 py-3">Tank</th>
                  <th className="px-6 py-3">Reading (CM)</th>
                  <th className="px-6 py-3">Volume (L)</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReadings.length > 0 ? (
                  recentReadings.map((reading) => {
                    const station = stations.find(s => s.id === reading.stationId);
                    const tank = tanks.find(t => t.id === reading.tankId);
                    return (
                      <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{station?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{tank?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{reading.readingCm.toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600 font-mono">
                          {reading.volumeLitres.toLocaleString()} L
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">{formatDate(reading.timestamp)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={32} className="text-slate-200" />
                        <p>No readings recorded yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View for Readings */}
          <div className="sm:hidden divide-y divide-slate-100">
            {recentReadings.length > 0 ? (
              recentReadings.map((reading) => {
                const station = stations.find(s => s.id === reading.stationId);
                const tank = tanks.find(t => t.id === reading.tankId);
                return (
                  <div key={reading.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{station?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{tank?.name || 'Unknown'}</p>
                      </div>
                      <p className="text-xs text-slate-400">{formatDate(reading.timestamp)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reading</p>
                        <p className="text-sm font-mono font-medium text-slate-700">{reading.readingCm.toFixed(1)} CM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Volume</p>
                        <p className="text-lg font-mono font-bold text-blue-600">{reading.volumeLitres.toLocaleString()} L</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={32} className="text-slate-200 mx-auto mb-2" />
                <p>No readings recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/dipstick" className="block">
                <Button className="w-full justify-between group">
                  New Dipstick Reading
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/density" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  Calculate Density
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">System Status</h3>
              <p className="text-blue-100 text-sm mb-4">All stations are currently reporting data normally.</p>
              <div className="flex items-center gap-2 text-xs font-medium bg-blue-500/50 w-fit px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Operational
              </div>
            </div>
            <Fuel className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
