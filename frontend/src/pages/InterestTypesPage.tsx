import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Edit2,
  Trash2,
  Percent,
  ShieldCheck,
  Sparkles,
  Search,
  RotateCcw,
  Info,
  Lock,
} from "lucide-react";
import { toast } from "../lib/toast";
import { LoadingOverlay } from "../components/shared/LoadingOverlay";
import { useConfirm } from "../context/ConfirmContext";

// ─── Types ─────────────────────────────────────────────────────────────────

interface InterestTypeItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  notes: string | null;
  is_system: boolean;
  calculation_method: string;
  status: string;
}

// Mapping: calculation_method → (period_unit, rate_type, repayment)
const CODE_TO_PARAMS: Record<string, { period_unit: string; rate_type: string; repayment: string }> = {
  daily_k_million:                    { period_unit: "daily",   rate_type: "k_million", repayment: "interest_only" },
  daily_k_day:                        { period_unit: "daily",   rate_type: "k_fixed",   repayment: "interest_only" },
  monthly_percent_30:                 { period_unit: "monthly", rate_type: "percent",   repayment: "interest_only_30" },
  monthly_percent_periodic:           { period_unit: "monthly", rate_type: "percent",   repayment: "interest_only" },
  monthly_amount_periodic:            { period_unit: "monthly", rate_type: "k_fixed",   repayment: "interest_only" },
  weekly_percent:                     { period_unit: "weekly",  rate_type: "percent",   repayment: "interest_only" },
  weekly_amount:                      { period_unit: "weekly",  rate_type: "k_fixed",   repayment: "interest_only" },
  flat_rate_monthly:                  { period_unit: "monthly", rate_type: "percent",   repayment: "flat" },
  flat_rate_daily:                    { period_unit: "daily",   rate_type: "percent",   repayment: "flat" },
  reducing_balance_fixed_installment: { period_unit: "monthly", rate_type: "percent",   repayment: "reducing_emi" },
  reducing_balance_fixed_principal:   { period_unit: "monthly", rate_type: "percent",   repayment: "reducing_fixed" },
};

const PERIOD_UNIT_OPTIONS = [
  { value: "daily",   label: "Ngày" },
  { value: "weekly",  label: "Tuần" },
  { value: "monthly", label: "Tháng" },
];

const RATE_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  daily:   [
    { value: "k_million", label: "k/triệu/ngày" },
    { value: "k_fixed",   label: "k cố định/ngày" },
    { value: "percent",   label: "% trên dư nợ" },
  ],
  weekly:  [
    { value: "percent",   label: "% trên dư nợ" },
    { value: "k_fixed",   label: "k cố định/tuần" },
  ],
  monthly: [
    { value: "percent",   label: "% trên dư nợ" },
    { value: "k_fixed",   label: "k cố định/tháng" },
  ],
};

const REPAYMENT_OPTIONS: Record<string, Record<string, { value: string; label: string }[]>> = {
  daily: {
    k_million: [{ value: "interest_only", label: "Chỉ trả lãi (Bullet)" }],
    k_fixed:   [{ value: "interest_only", label: "Chỉ trả lãi (Bullet)" }],
    percent:   [
      { value: "flat",          label: "Flat rate — Trả đều Gốc + Lãi mỗi kỳ" },
    ],
  },
  weekly: {
    percent: [{ value: "interest_only", label: "Chỉ trả lãi (Bullet)" }],
    k_fixed: [{ value: "interest_only", label: "Chỉ trả lãi (Bullet)" }],
  },
  monthly: {
    percent: [
      { value: "interest_only",    label: "Chỉ trả lãi — Kỳ lãi định kỳ" },
      { value: "interest_only_30", label: "Chỉ trả lãi — Chuẩn hóa 30 ngày/tháng" },
      { value: "flat",             label: "Flat rate — Trả đều Gốc + Lãi mỗi kỳ" },
      { value: "reducing_emi",     label: "Dư nợ giảm dần — EMI (Gốc+Lãi cố định)" },
      { value: "reducing_fixed",   label: "Dư nợ giảm dần — Gốc cố định mỗi kỳ" },
    ],
    k_fixed: [{ value: "interest_only", label: "Chỉ trả lãi (Bullet)" }],
  },
};

function describeCode(code: string): string {
  const p = CODE_TO_PARAMS[code];
  if (!p) return code;
  const periodLabel = PERIOD_UNIT_OPTIONS.find(o => o.value === p.period_unit)?.label ?? p.period_unit;
  const rateLabel   = (RATE_TYPE_OPTIONS[p.period_unit] ?? []).find(o => o.value === p.rate_type)?.label ?? p.rate_type;
  const repayLabel  = (REPAYMENT_OPTIONS[p.period_unit]?.[p.rate_type] ?? []).find(o => o.value === p.repayment)?.label ?? p.repayment;
  return `${periodLabel} · ${rateLabel} · ${repayLabel}`;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const InterestTypesPage: React.FC = () => {
  const [items, setItems] = useState<InterestTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const confirm = useConfirm();

  // ── List state ──
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "system" | "custom">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Form state ──
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPeriodUnit, setFormPeriodUnit] = useState("daily");
  const [formRateType, setFormRateType] = useState("k_million");
  const [formRepayment, setFormRepayment] = useState("interest_only");
  const [formStatus, setFormStatus] = useState("active");

  // ─── Fetch ─────────────────────────────────────────────────────────────

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/interest-types");
      setItems(res.data);
    } catch {
      toast.error("Không thể tải danh sách hình thức lãi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ─── Derived list ──────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || (filterType === "system" && item.is_system) || (filterType === "custom" && !item.is_system);
      return matchSearch && matchType;
    });
  }, [items, search, filterType]);

  const selectedItem = useMemo(() => items.find(i => i.id === selectedId) ?? null, [items, selectedId]);
  const isCreateMode = selectedId === null;
  const isSystemRecord = selectedItem?.is_system === true;

  // ─── Selection → populate form ─────────────────────────────────────────

  const handleSelect = (item: InterestTypeItem) => {
    setSelectedId(item.id);
    setFormName(item.name);
    setFormDescription(item.description ?? "");
    setFormNotes(item.notes ?? "");
    setFormStatus(item.status);

    // Decode calculation_method back to UI params
    const params = CODE_TO_PARAMS[item.calculation_method];
    if (params) {
      setFormPeriodUnit(params.period_unit);
      setFormRateType(params.rate_type);
      setFormRepayment(params.repayment);
    }
  };

  const handleNewClick = () => {
    setSelectedId(null);
    setFormName("");
    setFormDescription("");
    setFormNotes("");
    setFormPeriodUnit("daily");
    setFormRateType("k_million");
    setFormRepayment("interest_only");
    setFormStatus("active");
  };

  // ─── Period/rate cascades ───────────────────────────────────────────────

  const handlePeriodChange = (val: string) => {
    setFormPeriodUnit(val);
    const firstRate = RATE_TYPE_OPTIONS[val]?.[0]?.value ?? "percent";
    setFormRateType(firstRate);
    const firstRepay = REPAYMENT_OPTIONS[val]?.[firstRate]?.[0]?.value ?? "interest_only";
    setFormRepayment(firstRepay);
  };

  const handleRateTypeChange = (val: string) => {
    setFormRateType(val);
    const firstRepay = REPAYMENT_OPTIONS[formPeriodUnit]?.[val]?.[0]?.value ?? "interest_only";
    setFormRepayment(firstRepay);
  };

  // ─── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = {
        name: formName,
        description: formDescription,
        notes: formNotes,
        period_unit: formPeriodUnit,
        rate_type: formRateType,
        repayment: formRepayment,
        status: formStatus,
      };

      if (isCreateMode) {
        await axios.post("/api/interest-types", payload);
        toast.success("Tạo hình thức lãi thành công!");
        handleNewClick();
      } else {
        await axios.put(`/api/interest-types/${selectedId}`, payload);
        toast.success("Cập nhật hình thức lãi thành công!");
      }
      await fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Có lỗi xảy ra.");
    } finally {
      setIsPending(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────

  const handleDelete = (e: React.MouseEvent, item: InterestTypeItem) => {
    confirm({
      title: "Xóa hình thức lãi",
      message: `Bạn có chắc muốn xóa "${item.name}"? Thao tác này không thể hoàn tác.`,
      event: e,
      onConfirm: async () => {
        setIsPending(true);
        try {
          await axios.delete(`/api/interest-types/${item.id}`);
          toast.success("Đã xóa hình thức lãi.");
          if (selectedId === item.id) handleNewClick();
          await fetchItems();
        } catch (err: any) {
          toast.error(err.response?.data?.error ?? "Không thể xóa.");
        } finally {
          setIsPending(false);
        }
      },
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const currentRepaymentOptions = REPAYMENT_OPTIONS[formPeriodUnit]?.[formRateType] ?? [];
  const currentRateTypeOptions  = RATE_TYPE_OPTIONS[formPeriodUnit] ?? [];

  return (
    <div className="relative min-h-screen bg-slate-50/50 p-4 sm:p-6 space-y-5">
      <LoadingOverlay show={isPending} />

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Hình thức tính lãi</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">Tạo các gói lãi thân thiện từ công thức có sẵn của hệ thống</p>
        </div>
        <button
          type="button"
          onClick={handleNewClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tạo mới
        </button>
      </div>

      {/* ── Main Grid 7:5 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Danh sách (lg:col-span-7) ── */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Controls */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              {search && (
                <button type="button" onClick={() => setSearch("")} className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all",    label: "Tất cả" },
                { key: "system", label: "Hệ thống" },
                { key: "custom", label: "Tùy chỉnh" },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setFilterType(opt.key as typeof filterType)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    filterType === opt.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                  {opt.key === "all"    && ` (${items.length})`}
                  {opt.key === "system" && ` (${items.filter(i => i.is_system).length})`}
                  {opt.key === "custom" && ` (${items.filter(i => !i.is_system).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Đang tải...</div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Percent className="w-8 h-8 opacity-30" />
                <p className="text-sm">Không tìm thấy hình thức lãi nào.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`px-4 py-3.5 cursor-pointer transition-all hover:bg-indigo-50/50 ${
                      selectedId === item.id ? "bg-indigo-50 border-l-4 border-indigo-500" : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-slate-800 truncate">{item.name}</span>
                          {item.is_system ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                              <ShieldCheck className="w-3 h-3" /> Hệ thống
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                              <Sparkles className="w-3 h-3" /> Tùy chỉnh
                            </span>
                          )}
                          {item.status === "inactive" && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full uppercase">Tắt</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{describeCode(item.calculation_method)}</p>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      {!item.is_system && (
                        <button
                          type="button"
                          onClick={ex => { ex.stopPropagation(); handleDelete(ex, item); }}
                          className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── RIGHT: Form chi tiết (lg:col-span-5) ── */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

          {/* Form Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCreateMode ? (
                <>
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Tạo hình thức lãi mới</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Chỉnh sửa thông tin</span>
                </>
              )}
            </div>
            {isSystemRecord && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Lock className="w-3 h-3" /> Bản ghi hệ thống
              </span>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Tên */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tên hiển thị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Xe máy — Lãi ngày k/triệu"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>

            {/* Separator */}
            {!isSystemRecord && (
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <p className="text-xs text-slate-500">Chọn tổ hợp tham số — hệ thống sẽ tự ghép thành công thức tương ứng.</p>
                </div>

                {/* Đơn vị thời gian */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Đơn vị thời gian <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PERIOD_UNIT_OPTIONS.map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handlePeriodChange(opt.value)}
                        className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                          formPeriodUnit === opt.value
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kiểu lãi */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Kiểu tính lãi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRateType}
                    onChange={e => handleRateTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  >
                    {currentRateTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Hình thức trả gốc */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Hình thức trả gốc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRepayment}
                    onChange={e => setFormRepayment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  >
                    {currentRepaymentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Công thức preview (readonly) */}
            {isSystemRecord && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Công thức hệ thống</p>
                <p className="text-sm text-slate-700 font-medium">{describeCode(selectedItem?.calculation_method ?? "")}</p>
                <p className="text-xs text-slate-400 mt-1">Công thức hệ thống không thể thay đổi.</p>
              </div>
            )}

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả</label>
              <textarea
                rows={2}
                placeholder="Ghi chú ngắn về cách dùng hình thức lãi này..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú nội bộ</label>
              <textarea
                rows={2}
                placeholder="Ghi chú nội bộ (không hiển thị cho khách hàng)..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái</label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng sử dụng</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isCreateMode ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isCreateMode ? "Tạo mới" : "Lưu thay đổi"}
              </button>
              {!isCreateMode && (
                <button
                  type="button"
                  onClick={handleNewClick}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
