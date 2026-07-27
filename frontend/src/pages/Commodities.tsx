import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Plus, 
  Edit2,
  Trash2,
  ChevronsUpDown,
  Package,
  Layers,
  RotateCcw,
  CheckCircle2,
  Tag,
  Search,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { toast } from "../lib/toast";
import { MoneyInput } from "../components/shared/MoneyInput";
import { normalizeNumericInput, formatInterestRateText } from "../utils/interestFormatter";
import { convertDurationToDays, convertDaysToDisplayUnit } from "../utils/durationUtils";
import { LoadingOverlay } from "../components/shared/LoadingOverlay";
import { useConfirm } from "../context/ConfirmContext";

interface InterestType {
  id: string;
  code: string;
  name: string;
  calculation_method: string;
  is_principal_included: boolean;
  notes?: string;
}

interface Commodity {
  id: string;
  category: string; // 'pawn' or 'unsecured'
  code: string;
  name: string;
  status: string;
  interest_type_id: string;
  interest_type: InterestType;
  is_upfront_interest: boolean;
  default_amount: number;
  default_interest_rate: number;
  default_period_value: number;
  default_loan_days: number;
  liquidation_after_days: number;
  created_at: string;
}

export const Commodities: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [interestTypes, setInterestTypes] = useState<InterestType[]>([]);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<"name" | "code" | "liquidation_after_days">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  // Form mode & selection state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  // Form inputs
  const [category, setCategory] = useState("pawn");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const [interestTypeId, setInterestTypeId] = useState("");
  const [isUpfrontInterest, setIsUpfrontInterest] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState<number>(0);
  const [defaultInterestRate, setDefaultInterestRate] = useState("0");
  const [defaultPeriodValue, setDefaultPeriodValue] = useState("10");
  const [defaultLoanDays, setDefaultLoanDays] = useState("30");
  const [liquidationAfterDays, setLiquidationAfterDays] = useState("5");
  const [isPending, setIsPending] = useState(false);

  // Attribute inputs
  const [attributes, setAttributes] = useState<string[]>([]);

  const getInterestPeriodType = (interestTypeCode?: string) => {
    if (!interestTypeCode) return "daily";
    const lower = interestTypeCode.toLowerCase();
    if (lower.includes("daily") || lower.includes("day") || lower.includes("million")) {
      return "daily";
    }
    if (lower.includes("weekly") || lower.includes("week")) {
      return "weekly";
    }
    if (lower.includes("monthly") || lower.includes("month") || lower.includes("flat_rate") || lower.includes("reducing_balance")) {
      return "monthly";
    }
    return "daily";
  };

  const selectedInterestType = interestTypes.find(it => it.id === interestTypeId);
  const selectedInterestTypeCode = selectedInterestType?.code;
  const periodType = getInterestPeriodType(selectedInterestTypeCode);

  let loanDaysLabel = "Số ngày vay";
  let loanDaysSuffix = "ngày";
  let loanDaysPlaceholder = "Ví dụ: 30";

  let periodValueLabel = "Kỳ lãi";
  let periodValueSuffix = "ngày";
  let periodValueHelper = "(VD : 10 ngày đóng lãi 1 lần thì điền số 10)";
  let periodValuePlaceholder = "10";

  if (periodType === "monthly") {
    loanDaysLabel = "Số tháng vay";
    loanDaysSuffix = "tháng";
    loanDaysPlaceholder = "Ví dụ: 3";
    
    periodValueLabel = "Kỳ lãi (tháng)";
    periodValueSuffix = "tháng";
    periodValueHelper = "(VD : 1 tháng đóng lãi 1 lần thì điền số 1)";
    periodValuePlaceholder = "1";
  } else if (periodType === "weekly") {
    loanDaysLabel = "Số tuần vay";
    loanDaysSuffix = "tuần";
    loanDaysPlaceholder = "Ví dụ: 4";
    
    periodValueLabel = "Kỳ lãi (tuần)";
    periodValueSuffix = "tuần";
    periodValueHelper = "(VD : 1 tuần đóng lãi 1 lần thì điền số 1)";
    periodValuePlaceholder = "1";
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [commRes, interestRes] = await Promise.all([
        axios.get("/api/commodities"),
        axios.get("/api/interest-types")
      ]);

      setCommodities(commRes.data);
      setInterestTypes(interestRes.data);

      if (interestRes.data.length > 0 && !interestTypeId) {
        setInterestTypeId(interestRes.data[0].id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể tải danh sách cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId("");
    setCategory("pawn");
    setCode("");
    setName("");
    setStatus("active");
    
    if (interestTypes.length > 0) {
      setInterestTypeId(interestTypes[0].id);
    }
    setIsUpfrontInterest(false);
    setDefaultAmount(0);
    setDefaultInterestRate("0");
    setDefaultPeriodValue("10");
    setDefaultLoanDays("30");
    setLiquidationAfterDays("5");
    setAttributes([]);
  };

  const handleOpenEdit = (comm: Commodity) => {
    setIsEditMode(true);
    setSelectedId(comm.id);
    setCategory(comm.category);
    setCode(comm.code);
    setStatus(comm.status);

    const parts = comm.name.split("|");
    setName(parts[0]);
    setAttributes(parts[1] ? parts[1].split(",") : []);

    setInterestTypeId(comm.interest_type_id);
    setIsUpfrontInterest(comm.is_upfront_interest);
    setDefaultAmount(comm.default_amount);
    setDefaultInterestRate(String(comm.default_interest_rate));

    const itCode = comm.interest_type?.code || "";
    const displayPeriod = convertDaysToDisplayUnit(comm.default_period_value, itCode);
    const displayDuration = convertDaysToDisplayUnit(comm.default_loan_days, itCode);

    setDefaultPeriodValue(String(displayPeriod));
    setDefaultLoanDays(String(displayDuration));
    setLiquidationAfterDays(String(comm.liquidation_after_days));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !interestTypeId) {
      toast.warning("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setIsPending(true);

      const cleanAttrs = attributes.filter(a => a.trim() !== "");
      const finalName = cleanAttrs.length > 0 
        ? `${name.trim()}|${cleanAttrs.join(",")}`
        : name.trim();

      const periodInDays = convertDurationToDays(defaultPeriodValue, selectedInterestTypeCode);
      const loanDaysInDays = convertDurationToDays(defaultLoanDays, selectedInterestTypeCode);

      const payload = {
        category,
        code: code.toUpperCase().trim(),
        name: finalName,
        status,
        interest_type_id: interestTypeId,
        is_upfront_interest: isUpfrontInterest,
        default_amount: defaultAmount,
        default_interest_rate: normalizeNumericInput(defaultInterestRate),
        default_period_value: periodInDays || 10,
        default_loan_days: loanDaysInDays || 30,
        liquidation_after_days: Number(liquidationAfterDays) || 5,
      };

      if (isEditMode) {
        await axios.put(`/api/commodities/${selectedId}`, payload);
        toast.success("Cập nhật cấu hình hàng hóa thành công!");
      } else {
        await axios.post("/api/commodities", payload);
        toast.success("Tạo cấu hình hàng hóa thành công!");
        handleOpenCreate();
      }

      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể lưu cấu hình.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = (comm: Commodity, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanName = comm.name.split("|")[0];
    confirm({
      title: "Xóa cấu hình hàng hóa",
      message: `Bạn có chắc chắn muốn xóa cấu hình hàng hóa "${cleanName}"?`,
      type: "danger",
      event: e,
      onConfirm: async () => {
        try {
          setIsPending(true);
          await axios.delete(`/api/commodities/${comm.id}`);
          if (selectedId === comm.id) {
            handleOpenCreate();
          }
          fetchData();
        } catch (err: any) {
          toast.error(err.response?.data?.error || "Không thể xóa hàng hóa.");
        } finally {
          setIsPending(false);
        }
      },
      successMessage: `Đã xóa cấu hình hàng hóa ${cleanName} thành công!`,
    });
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, ""]);
  };

  const handleAttrChange = (index: number, val: string) => {
    const copy = [...attributes];
    copy[index] = val;
    setAttributes(copy);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const getInterestConfig = () => {
    const selected = interestTypes.find((it) => it.id === interestTypeId);
    if (!selected) {
      return { label: "Lãi suất", suffix: "%", placeholder: "0" };
    }
    const code = selected.code;
    switch (code) {
      case "daily_k_million":
        return { label: "Lãi phí (k/triệu/ngày)", suffix: "k / 1 triệu / ngày", placeholder: "VD: 3" };
      case "daily_k_day":
        return { label: "Lãi phí (k/ngày)", suffix: "k / ngày", placeholder: "VD: 5" };
      case "monthly_percent_30":
        return { label: "Lãi suất (%/tháng)", suffix: "% / tháng", placeholder: "1" };
      case "monthly_percent_periodic":
        return { label: "Lãi suất (%/tháng)", suffix: "% / tháng", placeholder: "1" };
      case "monthly_amount_periodic":
        return { label: "Lãi phí (k/tháng)", suffix: "k / tháng", placeholder: "VD: 500" };
      case "weekly_percent":
        return { label: "Lãi suất (%/tuần)", suffix: "% / tuần", placeholder: "1" };
      case "weekly_amount":
        return { label: "Lãi phí (k/tuần)", suffix: "k / tuần", placeholder: "VD: 50" };
      case "flat_rate_monthly":
        return { label: "Lãi suất (%/tháng)", suffix: "% / tháng", placeholder: "1" };
      case "flat_rate_daily":
        return { label: "Lãi suất (%/ngày)", suffix: "% / ngày", placeholder: "1" };
      case "reducing_balance_fixed_installment":
      case "reducing_balance_fixed_principal":
        return { label: "Lãi suất (%/tháng)", suffix: "% / tháng", placeholder: "1" };
      default:
        return { label: "Lãi suất", suffix: "%", placeholder: "1" };
    }
  };

  const getInterestTypeLabel = (comm: Commodity) => {
    if (!comm.interest_type) return "---";
    const rate = Number(comm.default_interest_rate);
    return formatInterestRateText(rate, comm.interest_type.code);
  };

  const formatNumber = (val: number) => {
    return val === 0 ? "0" : Number(val || 0).toLocaleString("vi-VN");
  };

  const getCleanName = (fullName: string) => {
    return fullName.split("|")[0];
  };

  const handleSort = (field: "name" | "code" | "liquidation_after_days") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filters logic
  const filtered = commodities.filter((c) => {
    const cleanName = getCleanName(c.name).toLowerCase();
    const matchesSearch = 
      cleanName.includes(searchQuery.toLowerCase()) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string || "").toLowerCase();
    } else {
      aVal = Number(aVal || 0);
      bVal = Number(bVal || 0);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalRecords = sorted.length;
  const indexOfLastRecord = page * limit;
  const indexOfFirstRecord = indexOfLastRecord - limit;
  const currentRecords = sorted.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in w-full px-2 sm:px-4 font-sans pb-10">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" />
            <span>CẤU HÌNH HÀNG HOÁ & TÀI SẢN</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý định mức vay, lãi suất mặc định và các thuộc tính động cho từng loại hàng hóa.
          </p>
        </div>
      </div>

      {/* Main 2-Column Master-Detail Layout (7 / 5 split for spacious list view) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN: DANH SÁCH HÀNG HÓA (lg:col-span-7) ── */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-slate-800 uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Danh sách Hàng hóa ({totalRecords})</span>
              </h2>
              <button
                onClick={handleOpenCreate}
                className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-none text-white btn-sm rounded-xl font-extrabold px-4 text-xs shadow-sm flex items-center gap-1.5"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm mới</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã hàng hoá..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="input input-bordered input-sm pl-9 bg-white border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-xs sm:text-sm rounded-xl w-full h-10"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="select select-bordered select-sm bg-white border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-xs sm:text-sm rounded-xl w-full h-10 font-semibold"
                >
                  <option value="">Tất cả loại hình</option>
                  <option value="pawn">Cầm đồ</option>
                  <option value="unsecured">Tín chấp</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="select select-bordered select-sm bg-white border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-xs sm:text-sm rounded-xl w-full h-10 font-semibold"
                >
                  <option value="">Trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã tạm dừng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto min-h-[420px] max-h-[680px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-16">
                <span className="loading loading-spinner loading-lg text-emerald-500"></span>
              </div>
            ) : currentRecords.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                Không tìm thấy hàng hóa nào phù hợp.
              </div>
            ) : (
              <table className="table w-full text-slate-700">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 text-xs font-extrabold uppercase tracking-wider sticky top-0 z-10">
                    <th className="w-10 text-center">#</th>
                    <th className="py-3 px-3">Loại hình</th>
                    <th 
                      onClick={() => handleSort("name")}
                      className="cursor-pointer hover:bg-slate-100/60 py-3 px-3"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tên hàng hóa</span>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("code")}
                      className="cursor-pointer hover:bg-slate-100/60 py-3 px-3"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Mã</span>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Tiền cầm</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRecords.map((c, index) => {
                    const displayIndex = indexOfFirstRecord + index + 1;
                    const isSelected = selectedId === c.id;

                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => handleOpenEdit(c)}
                        className={`cursor-pointer transition-colors text-xs sm:text-sm hover:bg-emerald-50/50 ${
                          isSelected ? "bg-emerald-50/90 border-l-4 border-l-emerald-500 font-semibold" : ""
                        }`}
                      >
                        <td className="text-center font-bold text-slate-400">{displayIndex}</td>
                        <td>
                          <span className={`badge badge-sm font-extrabold uppercase px-2.5 py-2 text-[11px] border-none ${
                            c.category === "pawn" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {c.category === "pawn" ? "Cầm đồ" : "Tín Chấp"}
                          </span>
                        </td>
                        <td className="font-extrabold text-slate-800 py-3">
                          <div className="text-sm text-slate-900">{getCleanName(c.name)}</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            Lãi: <span className="font-bold text-slate-700">{getInterestTypeLabel(c)}</span>
                          </div>
                        </td>
                        <td className="font-extrabold text-slate-700 uppercase text-xs sm:text-sm">{c.code}</td>
                        <td className="font-extrabold text-slate-900 text-right pr-3 text-sm">{formatNumber(c.default_amount)} VNĐ</td>
                        <td>
                          <span className={`badge badge-sm font-extrabold uppercase px-2.5 py-2 text-[11px] border-none ${
                            c.status === "active" 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-200 text-slate-600"
                          }`}>
                            {c.status === "active" ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                        <td className="py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-100/80 rounded-lg h-8 min-h-[32px] w-8 p-0"
                              type="button"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(c, e)}
                              className="btn btn-ghost btn-xs text-red-500 hover:bg-red-100/80 rounded-lg h-8 min-h-[32px] w-8 p-0"
                              type="button"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-slate-600 font-semibold">
              Hiển thị {totalRecords === 0 ? "0/0" : `${indexOfFirstRecord + 1}-${Math.min(indexOfLastRecord, totalRecords)}/${totalRecords}`} bản ghi
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Mỗi trang:</span>
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
                className="select select-bordered select-xs bg-white text-slate-800 font-bold border-slate-200 focus:outline-none rounded-lg h-[28px] min-h-[28px]"
              >
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: CÁC THÔNG TIN CẦN TẠO/SỬA HÀNG HÓA (lg:col-span-5) ── */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-800 uppercase flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <span>{isEditMode ? `Chỉnh sửa: ${name || code}` : "Thêm mới cấu hình hàng hóa"}</span>
            </h2>
            {isEditMode && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="btn btn-ghost btn-xs text-emerald-600 hover:bg-emerald-50 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>+ Tạo mới</span>
              </button>
            )}
          </div>

          {/* Inline Form with Flex Rows */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-700">
            
            {/* PHẦN 1: Thông tin hàng hoá */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-blue-600 uppercase border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>1. Thông tin hàng hoá</span>
              </h3>

              <div className="space-y-3">
                {/* Category */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Lĩnh vực <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg h-9 font-medium"
                      required
                    >
                      <option value="pawn">Cầm đồ</option>
                      <option value="unsecured">Tín chấp</option>
                    </select>
                  </div>
                </div>

                {/* Code */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Mã hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <input
                      type="text"
                      placeholder="VD: XM, DTD, LTOP..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 font-bold text-xs sm:text-sm rounded-lg uppercase h-9"
                      required
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Tên hàng hoá <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <input
                      type="text"
                      placeholder="VD: Xe máy, Điện thoại, Máy tính..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg h-9 font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Trạng thái
                  </label>
                  <div className="grow flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="inlineStatus"
                        checked={status === "active"}
                        onChange={() => setStatus("active")}
                        className="radio radio-xs radio-primary"
                      />
                      <span>Hoạt động</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="inlineStatus"
                        checked={status === "inactive"}
                        onChange={() => setStatus("inactive")}
                        className="radio radio-xs radio-primary"
                      />
                      <span>Đã tạm dừng</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PHẦN 2: Cấu hình giá trị mặc định */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs sm:text-sm text-blue-600 uppercase border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>2. Định mức & Lãi suất mặc định</span>
              </h3>

              <div className="space-y-3">
                {/* Interest Type */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Hình thức lãi <span className="text-red-500">*</span>
                  </label>
                  <div className="grow flex items-center gap-3">
                    <select
                      value={interestTypeId}
                      onChange={(e) => setInterestTypeId(e.target.value)}
                      className="select select-bordered select-sm flex-1 bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg h-9 font-medium"
                      required
                    >
                      {interestTypes.map((it) => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-slate-700 shrink-0 text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={isUpfrontInterest}
                        onChange={(e) => setIsUpfrontInterest(e.target.checked)}
                        className="checkbox checkbox-xs checkbox-primary border-slate-300 rounded"
                      />
                      <span>Thu lãi trước</span>
                    </label>
                  </div>
                </div>

                {/* Default Amount */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Số tiền cầm <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <MoneyInput
                      value={defaultAmount}
                      onChange={(val) => setDefaultAmount(val)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    {getInterestConfig().label} <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full h-9">
                      <input
                        type="text"
                        placeholder={getInterestConfig().placeholder}
                        value={defaultInterestRate}
                        onChange={(e) => setDefaultInterestRate(e.target.value)}
                        className="grow px-3 text-slate-800 h-full font-bold focus:outline-none bg-white text-left text-xs sm:text-sm border-none"
                        required
                      />
                      <span className="bg-slate-50 text-slate-500 px-3 h-full flex items-center border-l border-slate-200 text-xs font-bold shrink-0 select-none">
                        {getInterestConfig().suffix}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Period value */}
                <div className="flex items-start">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none pt-2">
                    {periodValueLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full h-9">
                      <input
                        type="number"
                        placeholder={periodValuePlaceholder}
                        value={defaultPeriodValue}
                        onChange={(e) => setDefaultPeriodValue(e.target.value)}
                        className="grow px-3 text-slate-800 h-full font-bold focus:outline-none bg-white text-left text-xs sm:text-sm border-none"
                        required
                      />
                      <span className="bg-slate-50 text-slate-500 px-3 h-full flex items-center border-l border-slate-200 text-xs font-bold shrink-0 select-none uppercase">
                        {periodValueSuffix}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">
                      {periodValueHelper}
                    </p>
                  </div>
                </div>

                {/* Loan Days */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    {loanDaysLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full h-9">
                      <input
                        type="number"
                        placeholder={loanDaysPlaceholder}
                        value={defaultLoanDays}
                        onChange={(e) => setDefaultLoanDays(e.target.value)}
                        className="grow px-3 text-slate-800 h-full font-bold focus:outline-none bg-white text-left text-xs sm:text-sm border-none"
                        required
                      />
                      <span className="bg-slate-50 text-slate-500 px-3 h-full flex items-center border-l border-slate-200 text-xs font-bold shrink-0 select-none uppercase">
                        {loanDaysSuffix}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liquidation After Days */}
                <div className="flex items-center">
                  <label className="w-[140px] text-right pr-3 font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                    Thanh lý sau <span className="text-red-500">*</span>
                  </label>
                  <div className="grow">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full h-9">
                      <input
                        type="number"
                        value={liquidationAfterDays}
                        onChange={(e) => setLiquidationAfterDays(e.target.value)}
                        className="grow px-3 text-slate-800 h-full font-bold focus:outline-none bg-white text-left text-xs sm:text-sm border-none"
                        required
                      />
                      <span className="bg-slate-50 text-slate-500 px-3 h-full flex items-center border-l border-slate-200 text-xs font-bold shrink-0 select-none">
                        ngày quá hạn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHẦN 3: Thuộc tính hàng hóa */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-blue-600 uppercase flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>3. Thuộc tính hàng hoá cần nhập</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="btn btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 btn-xs rounded-lg font-bold px-2.5 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thuộc tính</span>
                </button>
              </div>

              {attributes.length === 0 ? (
                <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg text-center">
                  Chưa khai báo thuộc tính động nào (ví dụ: Biển số, Số khung, Số máy, Mật khẩu...). Nhấn "+ Thêm thuộc tính" để khai báo.
                </div>
              ) : (
                <div className="space-y-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <label className="w-[140px] text-right font-bold text-slate-700 shrink-0 text-xs sm:text-sm select-none">
                        Thuộc tính {idx + 1}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Biển số, Số khung, Số máy, Mật khẩu..."
                        value={attr}
                        onChange={(e) => handleAttrChange(idx, e.target.value)}
                        className="input input-bordered input-sm grow bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg h-9 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(idx)}
                        className="btn btn-ghost text-red-500 hover:bg-red-50 btn-sm rounded-lg h-9 min-h-[36px] w-9 p-0 flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Submit & Reset Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={handleOpenCreate}
                className="btn bg-slate-100 hover:bg-slate-200 border-none text-slate-700 btn-sm rounded-lg font-bold px-4 text-xs sm:text-sm"
              >
                Hủy / Đặt lại
              </button>
              <button 
                type="submit" 
                className="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white btn-sm rounded-lg font-extrabold px-6 text-xs sm:text-sm shadow-sm"
              >
                {isEditMode ? "Cập nhật cấu hình" : "+ Thêm mới cấu hình"}
              </button>
            </div>

          </form>
        </div>

      </div>

      <LoadingOverlay show={isPending} />
    </div>
  );
};
