import React from 'react';
import { Plus, Edit2, Trash2, MapPin, Fuel, Users, Droplets } from 'lucide-react';
import { storage } from '../lib/storage';
import { FuelStation } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

export const ManageStations: React.FC = () => {
  const [stations, setStations] = React.useState<FuelStation[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStation, setEditingStation] = React.useState<FuelStation | null>(null);
  
  // Form state
  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');

  React.useEffect(() => {
    setStations(storage.getStations());
  }, []);

  const handleOpenModal = (station?: FuelStation) => {
    if (station) {
      setEditingStation(station);
      setName(station.name);
      setLocation(station.location);
    } else {
      setEditingStation(null);
      setName('');
      setLocation('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newStation: FuelStation = {
      id: editingStation?.id || crypto.randomUUID(),
      name,
      location,
      assignedUserIds: editingStation?.assignedUserIds || [],
    };
    storage.saveStation(newStation);
    setStations(storage.getStations());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this station? All associated data will be lost.')) {
      storage.deleteStation(id);
      setStations(storage.getStations());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Fuel Stations</h2>
          <p className="text-slate-500">Add, edit or remove fuel stations from the system.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 w-full sm:w-auto py-3 sm:py-2">
          <Plus size={18} />
          Add Station
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stations.map((station) => {
          const stationTanks = storage.getTanks().filter(t => t.stationId === station.id);
          return (
            <div key={station.id} className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Fuel size={24} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(station)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(station.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-900 text-lg truncate">{station.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={14} className="shrink-0" />
                  {station.location}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Droplets size={14} className="text-blue-500" />
                  <span className="font-medium">{stationTanks.length}</span> Tanks
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users size={14} className="text-indigo-500" />
                  <span className="font-medium">{station.assignedUserIds.length}</span> Users
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStation ? 'Edit Station' : 'Add New Station'}
      >
        <div className="space-y-4">
          <Input
            label="Station Name"
            placeholder="e.g. North Highway Station"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="e.g. 123 Main St, City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 py-3" onClick={handleSave} disabled={!name || !location}>
              {editingStation ? 'Update Station' : 'Create Station'}
            </Button>
            <Button variant="outline" className="flex-1 py-3" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
