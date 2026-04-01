import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { Plus, Trash2, Pencil, Image as ImageIcon, CheckCircle2, Loader2, Upload, TrendingUp, TrendingDown, Wallet, RotateCcw } from 'lucide-react';

export default function DayBook() {
  const { dayBook, addDayBookEntry, updateDayBookEntry, deleteDayBookEntry, ledgerSummary, fetchDayBook, fetchLedger } = useData();
  const { hasAccess, user } = useAuth();
  
  const [filterMonth, setFilterMonth] = React.useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    fetchDayBook(filterMonth, filterYear);
    fetchLedger(filterMonth, filterYear);
  }, [filterMonth, filterYear]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Income',
    category: '',
    amount: '',
    description: '',
  });
  const [uploadState, setUploadState] = useState({ text: 'Upload Photo/Bill', url: null, isUploading: false });

  const canEdit = hasAccess([ROLES.ADMIN, ROLES.OWNER, ROLES.ACCOUNTANT]);
  // Staff can ADD, but maybe they shouldn't delete existing records or view full history without restriction,
  // but for this prototype, we'll let them add and see today's entries.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    if (editingId) {
      const result = await updateDayBookEntry(editingId, {
        shop_id: 1,
        txn_date: formData.date,
        txn_type: formData.type.toUpperCase(),
        category_id: 1, // Default category
        amount: parseFloat(formData.amount),
        payment_mode: 'CASH',
        reference_no: uploadState.text !== 'Upload Photo/Bill' ? uploadState.text : '',
        description: formData.description,
        created_by: user?.id || 1
      });
      if (result.success) {
        setShowModal(false);
        resetForm();
      } else {
        alert('Failed to update entry: ' + result.message);
      }
    } else {
      const result = await addDayBookEntry({
        shop_id: 1,
        txn_date: formData.date,
        txn_type: formData.type.toUpperCase(),
        category_id: 1, // Default category
        amount: parseFloat(formData.amount),
        payment_mode: 'CASH',
        reference_no: uploadState.text !== 'Upload Photo/Bill' ? uploadState.text : '',
        description: formData.description,
        created_by: user?.id || 1
      });
      
      if (result.success) {
        setShowModal(false);
        resetForm();
      } else {
        alert('Failed to save entry: ' + result.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: '',
      amount: '',
      description: '',
    });
    setUploadState({ text: 'Upload Photo/Bill', url: null, isUploading: false });
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      date: entry.txn_date,
      type: entry.txn_type.charAt(0).toUpperCase() + entry.txn_type.slice(1).toLowerCase(),
      category: `Category ${entry.category_id}`,
      amount: entry.amount,
      description: entry.description || '',
    });
    setUploadState({ text: entry.reference_no || 'Upload Photo/Bill', url: entry.reference_no ? `http://localhost:3307/uploads/${entry.reference_no}` : null, isUploading: false });
    setShowModal(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadState({ ...uploadState, text: 'Uploading...', isUploading: true });
    
    const uploadFormData = new FormData();
    uploadFormData.append('bill', file);
    
    try {
      const token = localStorage.getItem('csmsToken');
      const response = await fetch('http://localhost:3307/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData,
      });
      const result = await response.json();
      
      if (result.success) {
        setUploadState({ 
          text: result.filename, 
          url: result.url, 
          isUploading: false 
        });
      } else {
        alert('Upload failed: ' + result.message);
        setUploadState({ text: 'Upload Failed', url: null, isUploading: false });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
      setUploadState({ text: 'Upload Error', url: null, isUploading: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Day Book</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage daily income and expenses.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Monthly Filter Section */}
      <div className="flex flex-wrap gap-4 items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Month</label>
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Years</option>
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => { setFilterMonth(''); setFilterYear(''); }}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30"
          title="Reset Filters"
        >
          <RotateCcw size={18} />
          <span className="sr-only">Reset</span>
        </button>
        <div className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-900/40 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30">
          Viewing: {filterMonth ? new Date(0, filterMonth - 1).toLocaleString('en-US', { month: 'short' }) : 'All'} {filterYear || 'Years'}
        </div>
      </div>

      {/* Ledger Summary */}
      {ledgerSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl flex items-center justify-between border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">₹{ledgerSummary.totalIncome || 0}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-xl">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl flex items-center justify-between border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">₹{ledgerSummary.totalExpense || 0}</h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-xl">
              <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{ledgerSummary.netBalance || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
              <Wallet size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Receipt</th>
                {canEdit && <th className="p-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {dayBook.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-gray-900 dark:text-gray-200">{entry.txn_date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      entry.txn_type === 'INCOME' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/30' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                    }`}>
                      {entry.txn_type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">Category {entry.category_id}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm max-w-[200px] truncate">{entry.description || '-'}</td>
                  <td className={`p-4 font-semibold ${entry.txn_type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {entry.txn_type === 'INCOME' ? '+' : '-'}₹{entry.amount}
                  </td>
                  <td className="p-4">
                    {entry.reference_no ? (
                      <a 
                        href={`http://localhost:3307/uploads/${entry.reference_no}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/30 w-fit hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <ImageIcon size={12} /> View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this entry?')) {
                              deleteDayBookEntry(entry.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {dayBook.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="p-8 text-center text-gray-500">
                    No entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal for New Entry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 transform p-6 transition-all">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Entry' : 'Add Day Book Entry'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="Income" checked={formData.type === 'Income'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="peer sr-only" />
                  <div className="p-3 rounded-lg border text-center peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 dark:peer-checked:bg-green-900/20 dark:peer-checked:border-green-500 dark:peer-checked:text-green-400 border-gray-200 dark:border-gray-700 dark:text-gray-400 transition-colors">
                    Income
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="Expense" checked={formData.type === 'Expense'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="peer sr-only" />
                  <div className="p-3 rounded-lg border text-center peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 dark:peer-checked:bg-red-900/20 dark:peer-checked:border-red-500 dark:peer-checked:text-red-400 border-gray-200 dark:border-gray-700 dark:text-gray-400 transition-colors">
                    Expense
                  </div>
                </label>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input 
                  type="text" required
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                  placeholder="e.g. Sales, Utilities, Stock"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <input 
                  type="text" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              <div className="mt-2">
                <label className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col items-center justify-center gap-2 ${
                  uploadState.url ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-700'
                }`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    accept="image/*,.pdf"
                  />
                  {uploadState.isUploading ? (
                    <Loader2 className="text-blue-500 animate-spin" size={24} />
                  ) : uploadState.url ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <Upload className="text-gray-400" size={24} />
                  )}
                  <span className={`text-sm font-medium ${
                    uploadState.url ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {uploadState.text}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
