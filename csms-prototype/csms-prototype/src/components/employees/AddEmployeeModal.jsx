import React, { useState } from 'react';
import { X, Check, Eye, EyeOff } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    idExpiry: '',
    qatarId: '',
    visaExpiry: '',
    nationality: '',
    passportNumber: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      name: '', position: '', status: 'Active', joinDate: new Date().toISOString().split('T')[0], 
      idExpiry: '', qatarId: '', visaExpiry: '', nationality: '', passportNumber: '', password: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              New Employee Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Register a new staff member to the system</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Basic Information</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. Abdullah Ahmed" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Position</label>
                <input 
                  type="text" 
                  name="position" 
                  required 
                  value={formData.position} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. Sales Associate" 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Join Date</label>
                  <input 
                    type="date" 
                    name="joinDate" 
                    required 
                    value={formData.joinDate} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 flex justify-between">
                  <span>Account Password</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/30 px-2 rounded-full">For Staff Portal</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800/50 border-2 border-purple-100 dark:border-purple-900/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all dark:text-white"
                    placeholder="Enter login password" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Identity & Documents</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Qatar ID (QID)</label>
                <input 
                  type="text" 
                  name="qatarId" 
                  value={formData.qatarId} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white font-mono"
                  placeholder="290XXXXXXXX" 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-red-500 dark:text-red-400">ID Expiry</label>
                  <input 
                    type="date" 
                    name="idExpiry" 
                    required 
                    value={formData.idExpiry} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Visa Expiry</label>
                  <input 
                    type="date" 
                    name="visaExpiry" 
                    value={formData.visaExpiry} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nationality</label>
                <input 
                  type="text" 
                  name="nationality" 
                  value={formData.nationality} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. India" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Passport Number</label>
                <input 
                  type="text" 
                  name="passportNumber" 
                  value={formData.passportNumber} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white font-mono uppercase"
                  placeholder="PXXXXXXX" 
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 active:scale-95 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30"
            >
              <Check size={18} />
              <span>Save Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
