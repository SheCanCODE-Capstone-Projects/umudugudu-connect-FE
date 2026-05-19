'use client';

import { useState } from 'react';
import type { UserSearchParams } from '@/types';

interface UserSearchBarProps {
  onSearch: (params: UserSearchParams) => void;
  loading?: boolean;
}

export const UserSearchBar = ({ onSearch, loading }: UserSearchBarProps) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const handleSearch = () => {
    onSearch({ phone: phone.trim(), name: name.trim() });
  };

  const handleClear = () => {
    setPhone('');
    setName('');
    onSearch({});
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search by phone number..."
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Search by name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      <button
        onClick={handleClear}
        className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
      >
        Clear
      </button>
    </div>
  );
};