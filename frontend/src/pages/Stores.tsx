import { ModalPortal } from "../components/shared/ModalPortal";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { 
  Plus, 
  Save, 
  X,
  ArrowRightLeft,
  Edit2,
  Trash2,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../lib/toast";
import { MoneyInput } from "../components/shared/MoneyInput";

interface Store {
  id: string;
  name: string;
  investment_capital: number;
  status: string;
  address?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  _count?: {
    employees: number;
  };
}

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
  "Cần Thơ",
  "Hải Phòng"
];

export const Stores: React.FC = () => {
  const navigate = useNavigate();
  const { switchStore } = useAuth();
  const confirm = useConfirm();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Pagination states
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState<"name" | "investment_capital" | "created_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Create form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [investmentCapital, setInvestmentCapital] = useState<number>(0);
  const [status, setStatus] = useState("active");
  
  // Advanced & Quick employee creation for create modal
  const [showCreateAdvanced, setShowCreateAdvanced] = useState(false);
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [representative, setRepresentative] = useState("");
  
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [empUsername, setEmpUsername] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empFullName, setEmpFullName] = useState("");
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Edit form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapital, setEditCapital] = useState<number>(0);
  const [editStatus, setEditStatus] = useState("active");
  
  // Advanced & Quick employee creation for edit modal
  const [showEditAdvanced, setShowEditAdvanced] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editRepresentative, setEditRepresentative] = useState("");
  
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [editEmpUsername, setEditEmpUsername] = useState("");
  const [editEmpPassword, setEditEmpPassword] = useState("");
  const [editEmpFullName, setEditEmpFullName] = useState("");
  const [showEditEmpPassword, setShowEditEmpPassword] = useState(false);
  
  const [editLoading, setEditLoading] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      const query = new URLSearchParams();
      if (searchQuery) {
        query.append("search", searchQuery);
      }
      if (selectedStatusFilter) {
        query.append("status", selectedStatusFilter);
      }

      const res = await axios.get(`/api/stores?${query.toString()}`);
      setStores(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể tải danh sách chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {

      // Serialize advanced fields to JSON in notes field
      const notesJson = JSON.stringify({
        province,
        district,
        representative
      });

      const storeRes = await axios.post("/api/stores", {
        name,
        investment_capital: investmentCapital,
        status,
        address,
        phone,
        notes: notesJson
      });

      const newStoreId = storeRes.data.id;

      // Handle quick employee creation if filled
      if (showCreateEmployee && empUsername && empPassword && empFullName) {
        await axios.post("/api/employees", {
          username: empUsername,
          password: empPassword,
          full_name: empFullName,
          store_id: newStoreId,
          status: "active"
        });
      }

      toast.success("Khai trương chi nhánh mới thành công!");
      setName("");
      setInvestmentCapital(0);
      setStatus("active");
      setPhone("");
      setProvince("");
      setDistrict("");
      setAddress("");
      setRepresentative("");
      setEmpUsername("");
      setEmpPassword("");
      setEmpFullName("");
      setShowCreateAdvanced(false);
      setShowCreateEmployee(false);
      setIsCreateOpen(false);
      fetchStores();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể tạo chi nhánh.");
    }
  };



  const handleDelete = (store: Store, e: React.MouseEvent) => {
    confirm({
      title: "Xóa chi nhánh",
      message: `Bạn có chắc chắn muốn xóa chi nhánh "${store.name}"?`,
      type: "danger",
      event: e,
      onConfirm: async () => {
        await axios.delete(`/api/stores/${store.id}`);
        fetchStores();
      },
      successMessage: `Xóa chi nhánh ${store.name} thành công!`,
    });
  };

  const handleOpenEdit = (store: Store) => {
    setSelectedStore(store);
    setEditName(store.name);
    setEditCapital(store.investment_capital);
    setEditStatus(store.status);
    setEditPhone(store.phone || "");
    setEditAddress(store.address || "");
    
    // Deserialize advanced info from notes
    try {
      const notesObj = JSON.parse(store.notes || "{}");
      setEditProvince(notesObj.province || "");
      setEditDistrict(notesObj.district || "");
      setEditRepresentative(notesObj.representative || "");
    } catch {
      setEditProvince("");
      setEditDistrict("");
      setEditRepresentative(store.notes || "");
    }

    setEditEmpUsername("");
    setEditEmpPassword("");
    setEditEmpFullName("");
    setShowEditAdvanced(false);
    setShowEditEmployee(false);
    setIsEditOpen(true);
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      setEditLoading(true);

      const notesJson = JSON.stringify({
        province: editProvince,
        district: editDistrict,
        representative: editRepresentative
      });

      await axios.put(`/api/stores/${selectedStore.id}`, {
        name: editName,
        investment_capital: editCapital,
        status: editStatus,
        phone: editPhone,
        address: editAddress,
        notes: notesJson
      });

      // Quick add employee for editing store if fields filled
      if (showEditEmployee && editEmpUsername && editEmpPassword && editEmpFullName) {
        await axios.post("/api/employees", {
          username: editEmpUsername,
          password: editEmpPassword,
          full_name: editEmpFullName,
          store_id: selectedStore.id,
          status: "active"
        });
      }

      toast.success(`Cập nhật cấu hình chi nhánh ${editName} thành công!`);
      setIsEditOpen(false);
      setSelectedStore(null);
      fetchStores();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Cập nhật cấu hình chi nhánh thất bại.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSwitchStore = (store: Store) => {
    switchStore({
      id: store.id,
      name: store.name,
      investment_capital: Number(store.investment_capital)
    });
    toast.success(`Chuyển quyền quản lý sang chi nhánh "${store.name}" thành công!`);
  };

  const handleNavigateToDetail = (store: Store) => {
    // Switch active store first to show appropriate statistics
    switchStore({
      id: store.id,
      name: store.name,
      investment_capital: Number(store.investment_capital)
    });
    navigate("/shop-detail");
  };

  const formatNumber = (val: number) => {
    return val === 0 ? "0" : Number(val || 0).toLocaleString("vi-VN");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleSort = (field: "name" | "investment_capital" | "created_at") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filters logic
  const filteredStores = stores.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatusFilter ? s.status === selectedStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedStores = [...filteredStores].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "created_at") {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    } else if (typeof aVal === "string") {
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
  const totalRecords = sortedStores.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const indexOfLastRecord = page * limit;
  const indexOfFirstRecord = indexOfLastRecord - limit;
  const currentRecords = sortedStores.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans pb-10">
      
      {/* ── Title Header Banner ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Edit2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              DANH SÁCH CỬA HÀNG & CHI NHÁNH
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Quản lý danh sách chi nhánh, vốn đầu tư và thông tin địa điểm toàn hệ thống</span>
              <span>•</span>
              <span>Tổng số chi nhánh: <strong className="text-slate-700">{stores.length}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStores}
            type="button"
            className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl font-medium px-4 transition-all flex items-center gap-1.5"
          >
            <ChevronsUpDown className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tên cửa hàng, địa chỉ, sĐT..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="input input-sm bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 text-xs rounded-xl w-full"
            />
          </div>

          {/* Status selector */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1); }}
            className="select select-sm select-bordered bg-slate-50 border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-xs rounded-xl h-[32px] min-h-[32px] w-full sm:w-44"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã tạm dừng</option>
          </select>
        </div>

        {/* Add Store Button */}
        <button
          onClick={() => {
            setIsCreateOpen(true);
          }}
          className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none text-white font-bold rounded-xl px-5 text-xs shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới cửa hàng</span>
        </button>
      </div>

      {/* ── STORES LIST TABLE CARD ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
            <span className="text-xs text-slate-500 font-medium">Đang tải danh sách chi nhánh...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-700">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase">
                  <th className="w-12 text-center py-3.5">#</th>
                  
                  {/* Sortable Store Name */}
                  <th 
                    onClick={() => handleSort("name")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tên Cửa Hàng</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3.5">Địa chỉ</th>
                  <th className="py-3.5">Điện thoại</th>

                  {/* Sortable Capital */}
                  <th 
                    onClick={() => handleSort("investment_capital")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5"
                  >
                    <div className="flex items-center gap-1">
                      <span>Vốn đầu tư</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  {/* Sortable Date Created */}
                  <th 
                    onClick={() => handleSort("created_at")}
                    className="cursor-pointer hover:bg-slate-100/50 py-3.5"
                  >
                    <div className="flex items-center gap-1">
                      <span>Ngày tạo</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3.5">Tình trạng</th>
                  <th className="py-3.5 text-center pr-4">Chức năng</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 bg-white text-slate-400 text-xs">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((s, index) => {
                    const displayIndex = indexOfFirstRecord + index + 1;
                    return (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="text-center font-medium text-slate-400 py-3.5">{displayIndex}</td>
                        <td className="font-bold text-slate-900">
                          <button
                            onClick={() => handleNavigateToDetail(s)}
                            className="text-blue-600 hover:underline font-bold text-left"
                            type="button"
                          >
                            {s.name}
                          </button>
                        </td>
                        <td className="text-slate-600 max-w-[200px] truncate" title={s.address}>
                          {s.address || "---"}
                        </td>
                        <td className="text-slate-600 font-medium">{s.phone || "---"}</td>
                        <td className="font-bold text-emerald-600">{formatNumber(s.investment_capital)} đ</td>
                        <td className="text-slate-500">{formatDate(s.created_at)}</td>
                        <td>
                          <span className={`badge badge-sm font-bold text-[10px] uppercase border-none px-2 rounded-lg ${
                            s.status === "active" 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {s.status === "active" ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Switch active store */}
                            <button
                              onClick={() => handleSwitchStore(s)}
                              className="btn btn-ghost btn-circle btn-xs text-indigo-600 hover:bg-indigo-50"
                              type="button"
                              title="Làm việc tại chi nhánh này"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit store configs */}
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="btn btn-ghost btn-circle btn-xs text-sky-600 hover:bg-sky-50"
                              type="button"
                              title="Chỉnh sửa chi nhánh"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete store */}
                            <button
                              onClick={(e) => handleDelete(s, e)}
                              className="btn btn-ghost btn-circle btn-xs text-rose-500 hover:bg-rose-50"
                              type="button"
                              title="Xóa chi nhánh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {totalRecords === 0 ? "0/0" : `${indexOfFirstRecord + 1}-${Math.min(indexOfLastRecord, totalRecords)}/${totalRecords}`} bản ghi
          </div>

          <div className="flex items-center gap-4">
            {/* Page Limit selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Mỗi trang:</span>
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
                className="select select-bordered select-xs bg-white text-slate-800 border-slate-200 focus:outline-none rounded-lg h-[28px] min-h-[28px]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="join gap-1.5">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-outline border-slate-200 hover:bg-slate-100 btn-xs rounded-lg px-2.5 text-slate-600 disabled:bg-slate-50 disabled:text-slate-300"
                  type="button"
                >
                  Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`btn btn-xs rounded-lg px-2.5 ${
                      page === i + 1 
                        ? "btn-primary bg-emerald-600 border-none text-white hover:bg-emerald-700" 
                        : "btn-outline border-slate-200 hover:bg-slate-100 text-slate-600 bg-white"
                    }`}
                    type="button"
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-outline border-slate-200 hover:bg-slate-100 btn-xs rounded-lg px-2.5 text-slate-600 disabled:bg-slate-50 disabled:text-slate-300"
                  type="button"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE MODAL (Thêm cửa hàng) */}
      <ModalPortal isOpen={isCreateOpen}>
          <div className="modal-box bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-base text-slate-850 border-b pb-2.5">Thêm cửa hàng</h3>
            
            <form onSubmit={handleCreate} className="space-y-4 mt-6">
              <div className="grid grid-cols-12 gap-y-4 items-center">
                
                {/* Store Name */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Tên cửa hàng <span className="text-red-500">*</span>
                </div>
                <div className="col-span-9">
                  <input
                    type="text"
                    placeholder="Nhập tên cửa hàng"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                    required
                  />
                </div>

                {/* Capital */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Số vốn đầu tư <span className="text-red-500">*</span>
                </div>
                <div className="col-span-9">
                  <MoneyInput
                    value={investmentCapital}
                    onChange={(val) => setInvestmentCapital(val)}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Status */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Trạng thái
                </div>
                <div className="col-span-9 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      className="radio radio-xs checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>Hoạt động</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                      className="radio radio-xs checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>Đã tạm dừng</span>
                  </label>
                </div>

                {/* Collapsible advanced information */}
                <div 
                  onClick={() => setShowCreateAdvanced(!showCreateAdvanced)}
                  className="col-span-12 flex items-center gap-1 text-xs text-blue-600 font-semibold cursor-pointer select-none py-2 border-t border-slate-100 mt-2"
                >
                  {showCreateAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>Thông tin nâng cao</span>
                </div>

                {showCreateAdvanced && (
                  <>
                    {/* Phone */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Số điện thoại
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Province */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Tỉnh / Thành phố
                    </div>
                    <div className="col-span-9">
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg h-[32px] min-h-[32px]"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Quận / Huyện
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Chọn quận/huyện"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Address */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Địa chỉ
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập địa chỉ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Representative */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Người đại diện
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập người đại diện"
                        value={representative}
                        onChange={(e) => setRepresentative(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>
                  </>
                )}

                {/* Collapsible quick employee creation */}
                <div 
                  onClick={() => setShowCreateEmployee(!showCreateEmployee)}
                  className="col-span-12 flex items-center gap-1 text-xs text-blue-600 font-semibold cursor-pointer select-none py-2 border-t border-slate-100 mt-2"
                >
                  {showCreateEmployee ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>Tạo tài khoản nhân viên</span>
                </div>

                {showCreateEmployee && (
                  <>
                    {/* Username */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={empUsername}
                        onChange={(e) => setEmpUsername(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                        required={showCreateEmployee}
                      />
                    </div>

                    {/* Password */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Mật khẩu <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9 relative">
                      <input
                        type={showEmpPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={empPassword}
                        onChange={(e) => setEmpPassword(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg pr-10"
                        required={showCreateEmployee}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmpPassword(!showEmpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Full Name */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Họ tên <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập họ tên"
                        value={empFullName}
                        onChange={(e) => setEmpFullName(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                        required={showCreateEmployee}
                      />
                    </div>
                  </>
                )}

                {/* Submit buttons row */}
                <div className="col-span-3"></div>
                <div className="col-span-9 pt-4 border-t border-slate-100 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary bg-[#10b981] hover:bg-emerald-600 border-none text-white btn-sm rounded-lg font-medium px-6 shadow-sm shadow-emerald-500/10 text-xs"
                  >
                    Thêm mới
                  </button>
                </div>

              </div>
            </form>
          </div>
        </ModalPortal>

      {/* EDIT MODAL (Chỉnh sửa cửa hàng) */}
      {isEditOpen && selectedStore && (
        <div className="modal modal-open">
          <div className="modal-box bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => {
                setIsEditOpen(false);
                setSelectedStore(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-base text-slate-850 border-b pb-2.5">Chỉnh sửa cửa hàng</h3>
            
            <form onSubmit={handleSaveConfiguration} className="space-y-4 mt-6">
              <div className="grid grid-cols-12 gap-y-4 items-center">
                
                {/* Edit Store Name */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Tên cửa hàng <span className="text-red-500">*</span>
                </div>
                <div className="col-span-9">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                    required
                  />
                </div>

                {/* Edit Capital */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Số vốn đầu tư <span className="text-red-500">*</span>
                </div>
                <div className="col-span-9">
                  <MoneyInput
                    value={editCapital}
                    onChange={(val) => setEditCapital(val)}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Edit Status */}
                <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                  Trạng thái
                </div>
                <div className="col-span-9 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={editStatus === "active"}
                      onChange={() => setEditStatus("active")}
                      className="radio radio-xs checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>Hoạt động</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={editStatus === "inactive"}
                      onChange={() => setEditStatus("inactive")}
                      className="radio radio-xs checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>Đã tạm dừng</span>
                  </label>
                </div>

                {/* Collapsible advanced information */}
                <div 
                  onClick={() => setShowEditAdvanced(!showEditAdvanced)}
                  className="col-span-12 flex items-center gap-1 text-xs text-blue-600 font-semibold cursor-pointer select-none py-2 border-t border-slate-100 mt-2"
                >
                  {showEditAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>Thông tin nâng cao</span>
                </div>

                {showEditAdvanced && (
                  <>
                    {/* Edit Phone */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Số điện thoại
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Edit Province */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Tỉnh / Thành phố
                    </div>
                    <div className="col-span-9">
                      <select
                        value={editProvince}
                        onChange={(e) => setEditProvince(e.target.value)}
                        className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg h-[32px] min-h-[32px]"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Edit District */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Quận / Huyện
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Chọn quận/huyện"
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Edit Address */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Địa chỉ
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập địa chỉ"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>

                    {/* Edit Representative */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Người đại diện
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập người đại diện"
                        value={editRepresentative}
                        onChange={(e) => setEditRepresentative(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                      />
                    </div>
                  </>
                )}

                {/* Collapsible quick employee creation */}
                <div 
                  onClick={() => setShowEditEmployee(!showEditEmployee)}
                  className="col-span-12 flex items-center gap-1 text-xs text-blue-600 font-semibold cursor-pointer select-none py-2 border-t border-slate-100 mt-2"
                >
                  {showEditEmployee ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>Tạo tài khoản nhân viên</span>
                </div>

                {showEditEmployee && (
                  <>
                    {/* Username */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={editEmpUsername}
                        onChange={(e) => setEditEmpUsername(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                        required={showEditEmployee}
                      />
                    </div>

                    {/* Password */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Mật khẩu <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9 relative">
                      <input
                        type={showEditEmpPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={editEmpPassword}
                        onChange={(e) => setEditEmpPassword(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg pr-10"
                        required={showEditEmployee}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditEmpPassword(!showEditEmpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showEditEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Full Name */}
                    <div className="col-span-3 text-right pr-4 text-xs font-semibold text-slate-650">
                      Họ tên <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        placeholder="Nhập họ tên"
                        value={editEmpFullName}
                        onChange={(e) => setEditEmpFullName(e.target.value)}
                        className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 text-xs rounded-lg"
                        required={showEditEmployee}
                      />
                    </div>
                  </>
                )}

                {/* Submit buttons row */}
                <div className="col-span-3"></div>
                <div className="col-span-9 pt-4 border-t border-slate-100 mt-4">
                  <button 
                    type="submit" 
                    disabled={editLoading}
                    className="btn btn-primary bg-[#10b981] hover:bg-emerald-600 border-none text-white btn-sm rounded-lg font-medium px-6 shadow-sm shadow-emerald-500/10 text-xs gap-1.5"
                  >
                    {editLoading ? (
                      <span className="loading loading-spinner btn-xs"></span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Cập nhật</span>
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
