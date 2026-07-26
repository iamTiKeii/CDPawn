import React from "react";

interface ContractAuditInfoProps {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const ContractAuditInfo: React.FC<ContractAuditInfoProps> = ({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
}) => {
  if (!createdBy && !createdAt && !updatedBy && !updatedAt) return null;

  return (
    <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-[10px] text-slate-500 space-y-1 mt-4">
      {createdBy && (
        <div>
          <span>Người lập: </span>
          <span className="font-semibold text-slate-700">{createdBy}</span>
          {createdAt && <span> ({new Date(createdAt).toLocaleString("vi-VN")})</span>}
        </div>
      )}
      {updatedBy && (
        <div>
          <span>Cập nhật cuối: </span>
          <span className="font-semibold text-slate-700">{updatedBy}</span>
          {updatedAt && <span> ({new Date(updatedAt).toLocaleString("vi-VN")})</span>}
        </div>
      )}
    </div>
  );
};
