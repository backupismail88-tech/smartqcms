import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { UserPlus, Users, AlertCircle, Calendar, Briefcase, Search, Filter, RefreshCw } from 'lucide-react';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EmployeeTable from '../components/employees/EmployeeTable';

export default function Employees() {
  const { employees, addEmployee, uploadBill, fetchEmployees, loading } = useData();
  const { hasAccess } = useAuth();
  
  const canEdit = hasAccess([ROLES.ADMIN, ROLES.OWNER]);
  const currentDate = new Date();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveEmployee = async (formData) => {
    const result = await addEmployee(formData);
    if (result.success) {
      setIsModalOpen(false);
      // DataContext addEmployee should already update the local state
    } else {
      alert('Failed to save: ' + result.message);
    }
  };

  const handleUploadBill = async (employeeId, file) => {
    if (!file) return;
    setUploadingId(employeeId);
    
    const formData = new FormData();
    formData.append('bill', file);
    
    try {
      const response = await fetch('http://localhost:3307/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        if (uploadBill) {
          uploadBill({
            employeeId,
            date: new Date().toISOString().split('T')[0],
            url: result.url,
            filename: result.filename,
            description: `Employee ${employeeId} bill upload`
          });
        }
        alert('Bill uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setUploadingId(null);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const expiringSoonCount = employees.filter(emp => {
    const expiryDate = new Date(emp.idExpiry);
    return expiryDate > currentDate && (expiryDate - currentDate) / (1000 * 60 * 60 * 24) < 30;
  }).length;
  const expiredCount = employees.filter(emp => new Date(emp.idExpiry) < currentDate).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="text-purple-600" size={32} />
            Workforce Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium ml-1">
            Global view of your staff, document status, and employment records.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchEmployees}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-purple-100 dark:hover:border-purple-900"
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          
          {canEdit && (
            <button 
              onClick={handleOpenModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-95"
            >
              <UserPlus size={20} />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<Users size={22} />} 
          title="Total Staff" 
          value={employees.length} 
          color="purple" 
          subtitle="Registered employees" 
        />
        <MetricCard 
          icon={<Briefcase size={22} />} 
          title="Active Role" 
          value={activeCount} 
          color="emerald" 
          subtitle="Currently active" 
        />
        <MetricCard 
          icon={<Calendar size={22} />} 
          title="Expiring Soon" 
          value={expiringSoonCount} 
          color="amber" 
          subtitle="Next 30 days" 
        />
        <MetricCard 
          icon={<AlertCircle size={22} />} 
          title="Critical Expiry" 
          value={expiredCount} 
          color="red" 
          subtitle="Immediate action req." 
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or position..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 glass dark:bg-gray-800/50 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-100 dark:border-gray-800">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Main Table Content */}
      <EmployeeTable 
        employees={filteredEmployees} 
        onUploadBill={handleUploadBill} 
        uploadingId={uploadingId} 
        currentDate={currentDate} 
      />

      {/* Modal */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveEmployee} 
      />
    </div>
  );
}

// Internal component for metrics
function MetricCard({ icon, title, value, color, subtitle }) {
  const colors = {
    purple: 'from-purple-500 to-indigo-600 shadow-purple-200 dark:shadow-purple-900/20 text-purple-600',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-emerald-900/20 text-emerald-600',
    amber: 'from-amber-500 to-orange-600 shadow-amber-200 dark:shadow-amber-900/20 text-amber-600',
    red: 'from-red-500 to-rose-600 shadow-red-200 dark:shadow-red-900/20 text-red-600'
  };

  const bgColors = {
    purple: 'bg-purple-50 dark:bg-purple-900/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10',
    amber: 'bg-amber-50 dark:bg-amber-900/10',
    red: 'bg-red-50 dark:bg-red-900/10'
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl group hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bgColors[color]} ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${colors[color].split(' ').slice(0, 2).join(' ')} opacity-20`}></div>
      </div>
      <div>
        <h4 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</h4>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">{title}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </div>
  );
}

