import React, { useState, useEffect } from "react";
import axios from "axios";

export interface Customer {
  id: string;
  full_name: string;
  phone?: string;
  identity_card_number?: string;
  address?: string;
  status: string;
}

interface CustomerLookupProps {
  value: string;
  onChange: (query: string) => void;
  onSelect: (customer: Customer) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const CustomerLookup: React.FC<CustomerLookupProps> = ({
  value,
  onChange,
  onSelect,
  onClear,
  placeholder = "Nhập tên, số điện thoại hoặc CCCD để tìm kiếm...",
  className = "input input-bordered w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-sm rounded-lg h-10 min-h-[40px]",
  required = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchingCustomers(true);
        const res = await axios.get(`/api/customers?search=${encodeURIComponent(value)}`);
        const activeOnly = res.data.filter((c: Customer) => c.status === "active");
        setSearchResults(activeOnly);
      } catch (err) {
        console.error("Error searching customers:", err);
      } finally {
        setSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          onClear();
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 205)}
        className={className}
        required={required}
      />
      {showSuggestions && value && (
        <div className="absolute z-[999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
          {searchingCustomers ? (
            <div className="p-3 text-center text-xs text-slate-400">
              Đang tìm kiếm...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              Không tìm thấy khách hàng
            </div>
          ) : (
            searchResults.slice(0, 10).map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  setShowSuggestions(false);
                }}
                className="p-2.5 hover:bg-amber-50/50 cursor-pointer transition-colors text-left"
              >
                <div className="font-semibold text-slate-800 text-sm">{c.full_name}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500 font-medium">
                  {c.identity_card_number && <span>CCCD: {c.identity_card_number}</span>}
                  {c.phone && <span>SĐT: {c.phone}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
