import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Save, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Search,
  Users,
  ShieldCheck,
  CheckSquare,
  RotateCcw,
  X,
  Building2,
  UserCheck,
  Sparkles
} from "lucide-react";
import { toast } from "../lib/toast";

interface Employee {
  id: string;
  username: string;
  full_name: string;
  store_id: string;
  permissions: any[];
}

interface Store {
  id: string;
  name: string;
}

interface PermissionNode {
  code: string;
  name: string;
  children?: PermissionNode[];
}

// Tree schema matching application permissions structure
const treeSchema: PermissionNode[] = [
  { code: "HOME_OWNER", name: "Trang chủ (Dành cho chủ cửa hàng)" },
  { code: "HOME_STAFF", name: "Trang chủ (Dành cho nhân viên)" },
  { code: "HIDE_PHONE", name: "Không cho xem SĐT" },
  {
    code: "REMINDERS_MANAGE",
    name: "Nhắc nợ",
    children: [
      { code: "WARNINGS_PAWN", name: "Cảnh báo Cầm đồ" },
      { code: "WARNINGS_LOAN", name: "Cảnh báo Vay Lãi" },
      { code: "WARNINGS_INSTALLMENT", name: "Cảnh báo Trả góp" },
      { code: "WARNINGS_CAPITAL", name: "Cảnh báo nguồn vốn" },
    ]
  },
  {
    code: "PAWN_GROUP",
    name: "Cầm đồ",
    children: [
      { code: "PAWN_VIEW_SUMMARY", name: "Xem thông tin quỹ tiền mặt, tiền đang vay, lãi dự kiến, lãi đã thu" },
      { code: "PAWN_VIEW_LIST", name: "Xem danh sách hợp đồng" },
      { code: "PAWN_CREATE", name: "Tạo mới hợp đồng" },
      { code: "PAWN_EDIT_DATE", name: "Sửa ngày vay" },
      { code: "PAWN_EDIT", name: "Sửa hợp đồng" },
      { code: "PAWN_DELETE", name: "Xóa hợp đồng" },
      { code: "PAWN_PAY_INTEREST", name: "Đóng lãi" },
      { code: "PAWN_CANCEL_INTEREST", name: "Hủy đóng lãi" },
      { code: "PAWN_BORROW_MORE", name: "Vay thêm gốc" },
      { code: "PAWN_PAY_DOWN", name: "Trả bớt gốc" },
      { code: "PAWN_REDEEM", name: "Chuộc đồ" },
      { code: "PAWN_EDIT_REDEEM_DATE", name: "Sửa ngày chuộc đồ" },
      { code: "PAWN_CANCEL_REDEEM", name: "Hủy chuộc đồ" },
      { code: "PAWN_RECORD_DEBT", name: "Ghi nhận nợ lãi" },
      { code: "PAWN_LIQUIDATE", name: "Thanh Lý Đồ" },
    ]
  },
  {
    code: "LOAN_GROUP",
    name: "Tín Chấp",
    children: [
      { code: "LOAN_VIEW_SUMMARY", name: "Xem thông tin quỹ tiền mặt, tiền đang vay, lãi dự kiến, lãi đã thu" },
      { code: "LOAN_VIEW_LIST", name: "Xem danh sách hợp đồng" },
      { code: "LOAN_CREATE", name: "Tạo mới hợp đồng" },
      { code: "LOAN_EDIT_DATE", name: "Sửa ngày vay" },
      { code: "LOAN_EDIT", name: "Sửa hợp đồng" },
      { code: "LOAN_DELETE", name: "Xóa hợp đồng" },
      { code: "LOAN_PAY_INTEREST", name: "Đóng lãi" },
      { code: "LOAN_CANCEL_INTEREST", name: "Hủy đóng lãi" },
      { code: "LOAN_BORROW_MORE", name: "Vay thêm gốc" },
      { code: "LOAN_PAY_DOWN", name: "Trả bớt gốc" },
      { code: "LOAN_EXTEND", name: "Gia hạn HĐ" },
      { code: "LOAN_CLOSE", name: "Đóng hợp đồng" },
      { code: "LOAN_EDIT_CLOSE_DATE", name: "Sửa ngày đóng hợp đồng" },
      { code: "LOAN_CANCEL_CLOSE", name: "Hủy đóng hợp đồng" },
      { code: "LOAN_RECORD_DEBT", name: "Ghi nhận nợ lãi" },
    ]
  },
  {
    code: "INSTALLMENT_GROUP",
    name: "Trả góp",
    children: [
      { code: "INSTALLMENT_VIEW_SUMMARY", name: "Xem thông tin quỹ tiền mặt, tiền đang vay, lãi dự kiến, lãi đã thu" },
      { code: "INSTALLMENT_VIEW_LIST", name: "Xem danh sách hợp đồng" },
      { code: "INSTALLMENT_CREATE", name: "Tạo mới hợp đồng" },
      { code: "INSTALLMENT_EDIT", name: "Sửa hợp đồng" },
      { code: "INSTALLMENT_DELETE", name: "Xóa hợp đồng" },
      { code: "INSTALLMENT_PAY", name: "Đóng tiền" },
      { code: "INSTALLMENT_CANCEL_PAY", name: "Hủy đóng tiền" },
      { code: "INSTALLMENT_CLOSE", name: "Đóng hợp đồng" },
      { code: "INSTALLMENT_CANCEL_CLOSE", name: "Hủy đóng hợp đồng" },
      { code: "INSTALLMENT_RECORD_DEBT", name: "Ghi nợ" },
      { code: "INSTALLMENT_CONVERT", name: "Trả góp HĐ mới" },
    ]
  },
  {
    code: "CUSTOMERS_GROUP",
    name: "Khách hàng & Cộng tác viên",
    children: [
      { code: "CUSTOMERS_MANAGE", name: "Khách hàng" },
      { code: "COLLABORATORS_MANAGE", name: "Cộng tác viên" },
    ]
  },
  {
    code: "STORES_GROUP",
    name: "Quản lý cửa hàng",
    children: [
      { code: "STORES_SUMMARY", name: "Tổng quát chuỗi cửa hàng" },
      { code: "STORES_DETAIL", name: "Thông tin chi tiết cửa hàng" },
      { code: "STORES_LIST", name: "Danh sách cửa hàng" },
      { code: "COMMODITIES_MANAGE", name: "Cấu hình hàng hóa" },
      { code: "INTEREST_TYPES_MANAGE", name: "Cấu hình hình thức lãi" },
      { code: "CASH_FUND_MANAGE", name: "Nhập tiền quỹ đầu ngày" },
    ]
  },

  {
    code: "VOUCHERS_GROUP",
    name: "Quản lý thu chi",
    children: [
      { code: "VOUCHERS_PAYMENT", name: "Chi hoạt động" },
      { code: "VOUCHERS_RECEIPT", name: "Thu hoạt động" },
      { code: "CAPITAL_MANAGE", name: "Nguồn vốn" },
      { code: "VOUCHERS_DELETE", name: "Xóa phiếu thu hoặc phiếu chi" },
    ]
  },
  {
    code: "EMPLOYEES_GROUP",
    name: "Quản lý nhân viên",
    children: [
      { code: "EMPLOYEES_LIST", name: "Danh sách nhân viên" },
      { code: "EMPLOYEES_PERMISSIONS", name: "Phân quyền nhân viên" },
    ]
  },
  {
    code: "REPORTS_GROUP",
    name: "Báo cáo",
    children: [
      { code: "REPORT_TRANSACTIONS", name: "Tổng kết giao dịch" },
      { code: "REPORT_PROFIT", name: "Tổng kết lợi nhuận" },
      { code: "REPORT_INTEREST", name: "Chi tiết tiền lãi" },
      { code: "REPORT_COLLECTIONS", name: "Thống kê thu tiền" },
      { code: "REPORT_LIQUIDATION_WAITING", name: "Hợp đồng chờ thanh lý" },
      { code: "REPORT_REDEMPTIONS", name: "Hợp đồng tất toán" },
      { code: "REPORT_ACTIVE_LOANS", name: "Hợp đồng đang vay" },
      { code: "REPORT_LIQUIDATED", name: "Hợp đồng đã thanh lý" },
      { code: "REPORT_DELETED_CONTRACTS", name: "Hợp đồng đã xóa" },
      { code: "REPORT_HANDOVER", name: "Bàn giao ca" },
      { code: "REPORT_DAILY_CASH", name: "Dòng tiền theo ngày" },
      { code: "REPORT_COLLABORATORS", name: "Cộng tác viên" },
    ]
  }
];

// Helper to extract all leaf permission codes
const getAllLeafCodes = (nodes: PermissionNode[]): string[] => {
  const codes: string[] = [];
  nodes.forEach((n) => {
    if (!n.code.endsWith("_GROUP")) {
      codes.push(n.code);
    }
    if (n.children) {
      codes.push(...getAllLeafCodes(n.children));
    }
  });
  return codes;
};

const TOTAL_PERMISSIONS_COUNT = getAllLeafCodes(treeSchema).length;

export const StaffPermission: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [storeId, setStoreId] = useState("");
  const [grantedPerms, setGrantedPerms] = useState<string[]>([]);
  
  const [searchEmpText, setSearchEmpText] = useState("");
  const [storeFilterId, setStoreFilterId] = useState("");

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Copy permission modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceEmpId, setSourceEmpId] = useState("");

  // Track collapsed parents in tree structure
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({
    PAWN_GROUP: false,
    LOAN_GROUP: false,
    INSTALLMENT_GROUP: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, storesRes] = await Promise.all([
        axios.get("/api/employees"),
        axios.get("/api/stores"),
      ]);
      setEmployees(empRes.data);
      setStores(storesRes.data.filter((s: any) => s.status === "active"));
      
      // Auto-select first employee if available
      if (empRes.data.length > 0) {
        const firstEmp = empRes.data[0];
        setSelectedEmpId(firstEmp.id);
        setSelectedEmp(firstEmp);
        setStoreId(firstEmp.store_id || "");
        
        const codes = (firstEmp.permissions || []).map((p: any) => {
          if (typeof p === "string") return p;
          if (p.permission && p.permission.code) return p.permission.code;
          if (p.code) return p.code;
          return null;
        }).filter(Boolean);
        setGrantedPerms(codes);
      }
    } catch {
      toast.error("Không thể tải thông tin nhân viên hoặc chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setSelectedEmp(emp);
      setStoreId(emp.store_id || "");
      
      const codes = (emp.permissions || []).map((p: any) => {
        if (typeof p === "string") return p;
        if (p.permission && p.permission.code) return p.permission.code;
        if (p.code) return p.code;
        return null;
      }).filter(Boolean);
      
      setGrantedPerms(codes);
    } else {
      setSelectedEmp(null);
      setStoreId("");
      setGrantedPerms([]);
    }
  };

  // Node helper check
  const isNodeChecked = (node: PermissionNode): boolean => {
    if (!node.children) {
      return grantedPerms.includes(node.code);
    }
    return node.children.every(child => isNodeChecked(child)) &&
      (node.code.endsWith("_GROUP") ? true : grantedPerms.includes(node.code));
  };

  const handleNodeToggle = (node: PermissionNode) => {
    const isCurrentlyChecked = isNodeChecked(node);
    let nextPerms = [...grantedPerms];

    const getLeafCodes = (n: PermissionNode): string[] => {
      const codes: string[] = [];
      if (!n.code.endsWith("_GROUP")) {
        codes.push(n.code);
      }
      if (n.children) {
        n.children.forEach(child => codes.push(...getLeafCodes(child)));
      }
      return codes;
    };

    const leafCodes = getLeafCodes(node);

    if (isCurrentlyChecked) {
      nextPerms = nextPerms.filter(code => !leafCodes.includes(code));
    } else {
      leafCodes.forEach(code => {
        if (!nextPerms.includes(code)) {
          nextPerms.push(code);
        }
      });
    }

    setGrantedPerms(nextPerms);
  };

  const toggleCollapse = (code: string) => {
    setCollapsedNodes(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSelectAll = () => {
    setGrantedPerms(getAllLeafCodes(treeSchema));
    toast.success("Đã chọn toàn bộ quyền!");
  };

  const handleDeselectAll = () => {
    setGrantedPerms([]);
    toast.success("Đã xóa tất cả quyền chọn!");
  };

  // Open copy modal
  const handleOpenCopyModal = () => {
    if (!selectedEmp) {
      toast.error("Vui lòng chọn nhân viên cần phân quyền trước.");
      return;
    }
    const otherEmps = employees.filter((e) => e.id !== selectedEmp.id);
    if (otherEmps.length === 0) {
      toast.error("Hệ thống chưa có nhân viên khác để sao chép.");
      return;
    }
    setSourceEmpId(otherEmps[0].id);
    setIsCopyModalOpen(true);
  };

  // Confirm copy action
  const handleApplyCopyPermissions = () => {
    if (!sourceEmpId) {
      toast.error("Vui lòng chọn nhân viên mẫu.");
      return;
    }
    const sourceEmp = employees.find((e) => e.id === sourceEmpId);
    if (!sourceEmp) return;

    const sourcePerms = (sourceEmp.permissions || []).map((p: any) => {
      if (typeof p === "string") return p;
      if (p.permission && p.permission.code) return p.permission.code;
      if (p.code) return p.code;
      return null;
    }).filter(Boolean);

    setGrantedPerms(sourcePerms);
    setIsCopyModalOpen(false);
    toast.success(`Đã sao chép ${sourcePerms.length} quyền từ nhân viên "${sourceEmp.full_name}". Nhấn "Lưu thay đổi" để áp dụng!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      toast.error("Vui lòng chọn nhân viên trước");
      return;
    }

    setSaveLoading(true);

    try {
      // 1. Update store assignment if changed
      if (storeId !== selectedEmp.store_id) {
        await axios.put(`/api/employees/${selectedEmp.id}`, {
          store_id: storeId,
        });
      }

      // 2. Update permissions
      await axios.put(`/api/employees/${selectedEmp.id}/permissions`, {
        permission_codes: grantedPerms,
      });

      toast.success(`Cập nhật phân quyền thành công cho nhân sự ${selectedEmp.full_name}!`);
      
      // Reload employees to sync permissions list
      const empRes = await axios.get("/api/employees");
      setEmployees(empRes.data);
      const updatedEmp = empRes.data.find((e: any) => e.id === selectedEmp.id);
      if (updatedEmp) {
        setSelectedEmp(updatedEmp);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Filtered employees for left column
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      !searchEmpText.trim() ||
      emp.full_name?.toLowerCase().includes(searchEmpText.toLowerCase().trim()) ||
      emp.username?.toLowerCase().includes(searchEmpText.toLowerCase().trim());

    const matchStore = !storeFilterId || emp.store_id === storeFilterId;

    return matchSearch && matchStore;
  });

  // Rendering tree schema recursively
  const renderNode = (node: PermissionNode) => {
    const isChecked = isNodeChecked(node);
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.code] === true;

    return (
      <div key={node.code} className="space-y-1">
        <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors select-none">
          {/* Collapse toggle arrow */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleCollapse(node.code)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleNodeToggle(node)}
            className="checkbox checkbox-xs rounded border-slate-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
          />

          {/* Node name */}
          <span 
            onClick={() => handleNodeToggle(node)}
            className={`text-xs cursor-pointer select-none ${
              hasChildren ? "font-bold text-slate-800" : "text-slate-700 hover:text-blue-600"
            }`}
          >
            {node.name}
          </span>
        </div>

        {/* Children indent rendering */}
        {hasChildren && !isCollapsed && (
          <div className="pl-6 border-l border-slate-150 space-y-1 ml-3.5 my-1">
            {node.children!.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-7xl mx-auto font-sans pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>PHÂN QUYỀN NHÂN VIÊN</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và sao chép quyền hạn truy cập các chức năng cho từng nhân viên hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary bg-blue-50 text-blue-700 border-blue-200 font-bold px-3 py-2 text-xs">
            Tổng {employees.length} Nhân viên
          </span>
        </div>
      </div>

      {loading && employees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT PANEL: DANH SÁCH NHÂN VIÊN */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Danh sách nhân viên</span>
              </h2>
              <span className="badge badge-sm bg-slate-100 text-slate-600 border-none font-bold">
                {filteredEmployees.length}
              </span>
            </div>

            {/* Filter controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, tài khoản..."
                  value={searchEmpText}
                  onChange={(e) => setSearchEmpText(e.target.value)}
                  className="input input-bordered input-sm w-full pl-9 bg-slate-50 border-slate-200 text-slate-800 text-xs rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={storeFilterId}
                onChange={(e) => setStoreFilterId(e.target.value)}
                className="select select-bordered select-sm w-full bg-slate-50 border-slate-200 text-slate-800 text-xs rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Tất cả cửa hàng</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Scrollable Employee List */}
            <div className="max-h-[560px] overflow-y-auto custom-scrollbar space-y-2 pr-1 pt-1">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Không tìm thấy nhân viên phù hợp
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedEmpId === emp.id;
                  const empStore = stores.find((s) => s.id === emp.store_id);
                  const permCount = (emp.permissions || []).length;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployeeChange(emp.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {emp.full_name ? emp.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span>{emp.full_name}</span>
                            {isSelected && (
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            @{emp.username}
                          </div>
                          {empStore && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{empStore.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`badge badge-sm font-bold text-[10px] ${
                          isSelected 
                            ? "bg-blue-600 text-white border-none" 
                            : "bg-slate-100 text-slate-600 border-none"
                        }`}>
                          {permCount} quyền
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: CẤU HÌNH QUYỀN TRUY CẬP & ACTION BUTTONS */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            
            {selectedEmp ? (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Header card of selected employee */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                      Đang thiết lập phân quyền cho:
                    </div>
                    <div className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <span>{selectedEmp.full_name}</span>
                      <span className="text-xs font-normal text-slate-500 font-mono">
                        (@{selectedEmp.username})
                      </span>
                    </div>
                  </div>

                  {/* Store Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      Cửa hàng:
                    </span>
                    <select
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      className="select select-bordered select-sm bg-white border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs rounded-xl"
                      required
                    >
                      <option value="">-- Chọn cửa hàng --</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Toolbar buttons: Copy, Select All, Deselect All, Save */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenCopyModal}
                      className="btn btn-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 rounded-xl text-xs font-bold gap-1.5"
                      title="Sao chép quyền từ nhân viên khác"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Copy quyền</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 rounded-xl text-xs font-medium gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                      <span>Chọn tất cả</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 rounded-xl text-xs font-medium gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Bỏ chọn</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-none text-white rounded-xl font-bold px-5 text-xs gap-1.5 shadow-sm shadow-emerald-600/20"
                  >
                    {saveLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>

                {/* Permissions Tree Checklist Container */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span>DANH SÁCH CHỨC NĂNG HỆ THỐNG</span>
                    <span className="text-slate-500 font-normal text-[11px]">
                      Đã chọn: <strong className="text-blue-600">{grantedPerms.length}</strong> / {TOTAL_PERMISSIONS_COUNT} quyền
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar space-y-2 shadow-inner">
                    {treeSchema.map((node) => renderNode(node))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 italic">
                    * Nhấn <strong>Lưu thay đổi</strong> sau khi chỉnh sửa hoặc sao chép quyền.
                  </div>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white btn-sm rounded-xl font-bold px-6 text-xs gap-1.5"
                  >
                    {saveLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold">
                  Vui lòng chọn nhân viên ở danh sách bên trái để thiết lập quyền.
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SAO CHÉP QUYỀN TRUY CẬP GIỮA CÁC USER */}
      {/* ======================================================== */}
      {isCopyModalOpen && selectedEmp && (
        <div className="modal modal-open z-[9999]">
          <div className="modal-box bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-lg p-6 relative shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-600" />
                <span>Sao chép quyền truy cập</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Sao chép toàn bộ danh sách quyền từ nhân viên mẫu và áp dụng cho:{" "}
                  <strong className="text-blue-900 font-bold">{selectedEmp.full_name}</strong>.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Chọn nhân viên mẫu (Source Employee): <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourceEmpId}
                  onChange={(e) => setSourceEmpId(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 text-slate-800 text-xs rounded-xl focus:border-indigo-500 focus:outline-none h-10"
                >
                  {employees
                    .filter((e) => e.id !== selectedEmp.id)
                    .map((emp) => {
                      const count = (emp.permissions || []).length;
                      return (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} (@{emp.username}) — {count} quyền
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Source Employee details preview */}
              {(() => {
                const srcEmp = employees.find((e) => e.id === sourceEmpId);
                if (!srcEmp) return null;
                const count = (srcEmp.permissions || []).length;
                return (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="font-bold text-slate-700">Thông tin mẫu:</div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Nhân viên:</span>
                      <strong className="text-slate-800">{srcEmp.full_name}</strong>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Tài khoản:</span>
                      <span className="font-mono text-slate-800">@{srcEmp.username}</span>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Số lượng quyền:</span>
                      <span className="badge badge-sm bg-indigo-100 text-indigo-700 font-bold border-none">
                        {count} / {TOTAL_PERMISSIONS_COUNT} quyền
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="btn btn-outline border-slate-200 text-slate-600 rounded-xl btn-sm text-xs px-4"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyCopyPermissions}
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white font-bold rounded-xl btn-sm text-xs px-5 flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Sao chép ngay</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
