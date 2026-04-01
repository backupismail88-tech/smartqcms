import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

// Initial Mock Data
const initialEmployees = [
  { id: 1, name: 'Alice Smith', position: 'Cashier', status: 'Active', idExpiry: '2027-05-10', joinDate: '2023-01-15' },
  { id: 2, name: 'Bob Johnson', position: 'Stock Clerk', status: 'Active', idExpiry: '2024-02-15', joinDate: '2022-11-01' }, // Overdue
  { id: 3, name: 'Charlie Davis', position: 'Manager', status: 'Inactive', idExpiry: '2026-08-20', joinDate: '2021-06-20' },
];

const initialDayBook = [
  { id: 101, txn_date: '2026-03-14', txn_type: 'INCOME', category_id: 101, amount: 4500, description: 'Daily counter sales', reference_no: null },
  { id: 102, txn_date: '2026-03-14', txn_type: 'EXPENSE', category_id: 501, amount: 200, description: 'Electricity bill payment', reference_no: null },
  { id: 103, txn_date: '2026-03-13', txn_type: 'INCOME', category_id: 101, amount: 5200, description: 'High volume day', reference_no: null },
];

const initialLicenses = [
  { id: 'L1', name: 'Trade License', number: 'TL-89432', expiryDate: '2026-12-31', status: 'Valid' },
  { id: 'L2', name: 'Fire Safety Certificate', number: 'FS-1011', expiryDate: '2026-04-10', status: 'Expiring Soon' },
  { id: 'L3', name: 'Food Safety', number: 'FSSAI-5532', expiryDate: '2025-10-01', status: 'Expired' },
];

export function DataProvider({ children }) {
  // State for all our mock tables
  const [employees, setEmployees] = useState(initialEmployees);
  const [dayBook, setDayBook] = useState(initialDayBook);
  const [licenses, setLicenses] = useState(initialLicenses);
  const [bills, setBills] = useState([]); // Array of { id, date, url, description, category }
  const [loading, setLoading] = useState(false);
  const [ledgerSummary, setLedgerSummary] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('csmsToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // --- Actions ---

  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      fetchEmployees();
      fetchDayBook(month, year);
      fetchLedger(month, year);
    }
  }, [user]);

  // Day Book
  const fetchDayBook = async (month, year) => {
    try {
      let url = 'http://localhost:3307/api/daybook';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setDayBook(result.data);
      }
    } catch (error) {
      console.error('Error fetching daybook:', error);
    }
  };

  const addDayBookEntry = async (entry) => {
    try {
      const response = await fetch('http://localhost:3307/api/daybook', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      if (result.success) {
        fetchDayBook(); // Refresh list
        fetchLedger();  // Refresh ledger summary
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error adding daybook entry:', error);
      return { success: false, message: 'Server error' };
    }
  };

  const updateDayBookEntry = async (id, entry) => {
    try {
      const response = await fetch(`http://localhost:3307/api/daybook/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      if (result.success) {
        fetchDayBook();
        fetchLedger();
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error updating daybook entry:', error);
      return { success: false, message: 'Server error' };
    }
  };

  const deleteDayBookEntry = async (id) => {
    try {
      const response = await fetch(`http://localhost:3307/api/daybook/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        fetchDayBook();
        fetchLedger();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const fetchLedger = async (month, year) => {
    try {
      let url = 'http://localhost:3307/api/ledger';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setLedgerSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    }
  };

  // Employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3307/api/employees', {
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const addEmployee = async (emp) => {
    try {
      const response = await fetch('http://localhost:3307/api/employees', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(emp)
      });
      const result = await response.json();
      if (result.success) {
        setEmployees(prev => [...prev, result.data]);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, message: 'Server error' };
    }
  };

  // Bills
  const uploadBill = (bill) => {
    setBills(prev => [{ id: Date.now(), ...bill }, ...prev]);
  };

  // derived state for Dashboard (Metrics)
  const getDashboardMetrics = () => {
    const activeEmployeesCount = employees.filter(e => e.status === 'Active').length;
    const expiredLicensesCount = licenses.filter(l => l.status === 'Expired').length;
    
    return {
      totalIncome: ledgerSummary?.totalIncome || 0,
      totalExpense: ledgerSummary?.totalExpense || 0,
      balance: ledgerSummary?.netBalance || 0,
      activeEmployeesCount,
      expiredLicensesCount
    };
  };

  return (
    <DataContext.Provider value={{
      employees, addEmployee, fetchEmployees,
      dayBook, addDayBookEntry, updateDayBookEntry, deleteDayBookEntry, fetchDayBook,
      licenses,
      bills, uploadBill,
      loading, ledgerSummary, fetchLedger,
      getDashboardMetrics
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
