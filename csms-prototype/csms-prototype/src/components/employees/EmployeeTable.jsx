import React from 'react';
import { CalendarClock, UserPlus, Info, Upload, Loader2, FileText, ChevronRight, User } from 'lucide-react';

export default function EmployeeTable({ employees, onUploadBill, uploadingId, currentDate }) {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl shadow-xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
              <th className="p-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">Employee Profile</th>
              <th className="p-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">Position & Role</th>
              <th className="p-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">Employment Status</th>
              <th className="p-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">ID Expiry Tracking</th>
              <th className="p-5 text-right text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                       <User size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No employees registered yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const expiryDate = new Date(emp.idExpiry);
                const isExpired = expiryDate < currentDate;
                const isExpiringSoon = !isExpired && (expiryDate - currentDate) / (1000 * 60 * 60 * 24) < 30;

                return (
                  <tr key={emp.id} className="group hover:bg-white/60 dark:hover:bg-gray-800/40 transition-all cursor-default">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 shrink-0 shadow-sm border border-white dark:border-gray-700 overflow-hidden">
                            {emp.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{emp.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 font-mono tracking-tighter">ID: {emp.id.toString().slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{emp.position}</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Joined {emp.joinDate}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30' 
                          : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {emp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isExpired ? 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 
                          isExpiringSoon ? 'bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' : 
                          'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                        }`}>
                          <CalendarClock size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${
                            isExpired ? 'text-red-600 dark:text-red-400' : 
                            isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : 
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'VALID'}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">Exp: {emp.idExpiry}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <label 
                          title="Upload Bill/Document"
                          className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                            uploadingId === emp.id 
                              ? 'text-purple-600 bg-purple-50 border-purple-100 animate-pulse' 
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 border-transparent hover:border-purple-100 dark:hover:border-purple-800'
                          }`}
                        >
                          {uploadingId === emp.id ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => onUploadBill(emp.id, e.target.files[0])}
                            accept="image/*,.pdf"
                            disabled={uploadingId === emp.id}
                          />
                        </label>
                        <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all">
                          <Info size={18} />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info */}
      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-500 font-medium">
        <span>Total Workforce: {employees.length}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Expired ID</span>
        </div>
      </div>
    </div>
  );
}
