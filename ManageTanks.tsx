import React from 'react';
import { Plus, Edit2, Trash2, Fuel, Droplets, Info } from 'lucide-react';
import { storage } from '../lib/storage';
import { FuelTank, FuelType } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';

export const ManageTanks: React.FC = () => {
  const [tanks, setTanks] = React.useState<FuelTank[]>([]);
  const [stations, setStations] = React.useState(storage.getStations());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTank, setEditingTank] = React.useState<FuelTank | null>(null);
  
  // Form state
  const [stationId, setStationId] = React.useState('');
  const [name, setName] = React.useState('');
  const [fuelType, setFuelType] = React.useState<FuelType | ''>('');
  const [capacity, setCapacity] = React.useState('');
  const [maxDip, setMaxDip] = React.useState('');

  React.useEffect(() => {
    setTanks(storage.getTanks());
  }, []);

  const handleOpenModal = (tank?: FuelTank) => {
    if (tank) {
      setEditingTank(tank);
      setStationId(tank.stationId);
      setName(tank.name);
      setFuelType(tank.fuelType);
      setCapacity(tank.capacity.toString());
      setMaxDip(tank.maxDip.toString());
    } else {
      setEditingTank(null);
      setStationId('');
      setName('');
      setFuelType('');
      setCapacity('');
      setMaxDip('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newTank: FuelTank = {
      id: editingTank?.id || crypto.randomUUID(),
      stationId,
      name,
      fuelType: fuelType as FuelType,
      capacity: parseFloat(capacity),
      maxDip: parseFloat(maxDip),
    };
    storage.saveTank(newTank);
    setTanks(storage.getTanks());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tank? All associated dip charts and readings will be lost.')) {
      storage.deleteTank(id);
      setTanks(storage.getTanks());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Fuel Tanks</h2>
          <p className="text-slate-500">Add and configure tanks for each fuel station.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={18} />
          Add Tank
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tank Name</th>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Fuel Type</th>
                <th className="px-6 py-4 text-center">Capacity (L)</th>
                <th className="px-6 py-4 text-center">Max Dip (CM)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tanks.map((tank) => {
                const station = stations.find(s => s.id === tank.stationId);
                return (
                  <tr key={tank.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Fuel size={18} />
                        </div>
                        <span className="font-medium text-slate-900">{tank.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{station?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tank.fuelType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-mono text-slate-600">{tank.capacity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-center font-mono text-slate-600">{tank.maxDip}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(tank)} className="h-8 w-8 p-0">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tank.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTank ? 'Edit Tank' : 'Add New Tank'}
      >
        <div className="space-y-4">
          <Select
            label="Station"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            options={stations.map(s => ({ value: s.id, label: s.name }))}
          />
          <Input
            label="Tank Name"
            placeholder="e.g. Tank A"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity (Litres)"
              type="number"
              placeholder="e.g. 10000"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            <Input
              label="Max Dip (CM)"
              type="number"
              placeholder="e.g. 200"
              value={maxDip}
              onChange={(e) => setMaxDip(e.target.value)}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button className="flex-1" onClick={handleSave} disabled={!stationId || !name || !fuelType || !capacity || !maxDip}>
              {editingTank ? 'Update Tank' : 'Create Tank'}
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
