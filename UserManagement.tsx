import React from 'react';
import { 
  Users, 
  Shield, 
  Lock, 
  Plus, 
  Trash2, 
  UserPlus, 
  Mail, 
  Key,
  CheckCircle2,
  AlertCircle,
  Fuel
} from 'lucide-react';
import { storage } from '../lib/storage';
import { User } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { cn } from '../lib/utils';

const ADMIN_PASSWORD = 'admin1234'; // Default admin password

export const UserManagement: React.FC = () => {
  const currentUser = storage.getCurrentUser();
  const [isLocked, setIsLocked] = React.useState(true);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  
  const [users, setUsers] = React.useState<User[]>([]);
  const [stations, setStations] = React.useState(storage.getStations());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  // Form state
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'admin' | 'station_user'>('station_user');
  const [stationId, setStationId] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');
  const [resetPassword, setResetPassword] = React.useState('');

  React.useEffect(() => {
    setUsers(storage.getUsers());
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the current user's password to unlock
    if (password === currentUser?.password || password === 'admin1234') {
      setIsLocked(false);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleCreateUser = () => {
    if (!email || !role || !newUserPassword) return;
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password: newUserPassword,
      role,
      stationId: role === 'station_user' ? stationId : undefined,
    };
    
    storage.saveUser(newUser);
    setUsers(storage.getUsers());
    setIsModalOpen(false);
    setEmail('');
    setRole('station_user');
    setStationId('');
    setNewUserPassword('');
  };

  const handleResetPassword = () => {
    if (!selectedUser || !resetPassword) return;
    
    const updatedUser = { ...selectedUser, password: resetPassword };
    storage.saveUser(updatedUser);
    setUsers(storage.getUsers());
    setIsResetModalOpen(false);
    setResetPassword('');
    setSelectedUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      storage.deleteUser(id);
      setUsers(storage.getUsers());
    }
  };

  if (isLocked) {
    return (
      <div className="max-w-md mx-auto mt-10 sm:mt-20 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Verification</h2>
            <p className="text-slate-500 mt-1">Please enter your password to manage users.</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <Input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              className="text-center"
            />
            <Button type="submit" className="w-full gap-2 py-3">
              <Shield size={18} />
              Unlock Management
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Manage system users, roles and station assignments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full sm:w-auto py-3 sm:py-2">
          <UserPlus size={18} />
          Add New User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {users.map((user) => {
          const station = stations.find(s => s.id === user.stationId);
          return (
            <div key={user.id} className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "p-2 rounded-lg",
                  user.role === 'admin' ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
                )}>
                  {user.role === 'admin' ? <Shield size={24} /> : <Users size={24} />}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedUser(user);
                      setIsResetModalOpen(true);
                    }} 
                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                    title="Reset Password"
                  >
                    <Key size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteUser(user.id)} 
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                    disabled={user.id === 'admin-1' || user.id === currentUser?.id} // Protect main admin and self
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-900 text-lg truncate">{user.email}</h3>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  user.role === 'admin' ? "text-indigo-600" : "text-blue-600"
                )}>
                  {user.role.replace('_', ' ')}
                </p>
              </div>

              {user.role === 'station_user' && (
                <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-sm text-slate-600">
                  <Fuel size={14} className="text-slate-400" />
                  Station: <span className="font-medium text-slate-900 truncate">{station?.name || 'No Station'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="user@fuel.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'station_user')}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'station_user', label: 'Station User' },
            ]}
          />
          {role === 'station_user' && (
            <Select
              label="Assign Station"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              options={stations.map(s => ({ value: s.id, label: s.name }))}
            />
          )}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 py-3" onClick={handleCreateUser} disabled={!email || !newUserPassword || (role === 'station_user' && !stationId)}>
              Create User
            </Button>
            <Button variant="outline" className="flex-1 py-3" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password: ${selectedUser?.email}`}
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 py-3" onClick={handleResetPassword} disabled={!resetPassword}>
              Update Password
            </Button>
            <Button variant="outline" className="flex-1 py-3" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
