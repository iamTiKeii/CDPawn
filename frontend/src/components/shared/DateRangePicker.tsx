import React from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const inputClass =
    "appearance-auto border border-slate-200 bg-white text-slate-800 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500 w-full sm:w-auto cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:[filter:brightness(0)] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100";

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto text-xs">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-slate-500 font-semibold shrink-0">Từ ngày:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className={inputClass}
        />
      </div>

      <div className="hidden sm:block text-slate-400 font-bold">→</div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-slate-500 font-semibold shrink-0">Đến ngày:</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
};
