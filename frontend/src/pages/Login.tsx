import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth.api";
import { Shield, Lock, User, Store, ArrowRight, FileText, ShieldCheck, X } from "lucide-react";
import { toast } from "../lib/toast";
import { MoneyInput } from "../components/shared/MoneyInput";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isBootstrapped, setIsBootstrapped] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Bootstrap form fields
  const [storeName, setStoreName] = useState("");
  const [investmentCapital, setInvestmentCapital] = useState<number | string>("");
  const [fullName, setFullName] = useState("");

  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const checkStatus = async () => {
    try {
      const data = await authApi.getStatus();
      setIsBootstrapped(data.bootstrapped);
    } catch (err) {
      console.error("Failed to fetch system status:", err);
      toast.error("Không thể kết nối đến máy chủ API.");
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      // Bước 1: Login Check (Kiểm tra tài khoản tồn tại/khóa & cấp precheck token chống DDoS)
      const checkRes = await authApi.loginCheck(username);
      if (!checkRes.allowed || !checkRes.precheck_token) {
        toast.error("Kiểm tra thông tin đăng nhập không hợp lệ.");
        return;
      }

      // Bước 2: Đăng nhập chính thức kèm precheck_token
      const data = await authApi.login(username, password, checkRes.precheck_token);
      login(data.token, data.user, data.refreshToken || data.token_id);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate bootstrap form, then show terms modal
  const handleBootstrapClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !username || !password || !fullName) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    setTermsAccepted(false);
    setShowTermsModal(true);
  };

  // Actually run bootstrap after terms accepted
  const handleBootstrapConfirm = async () => {
    try {
      setLoading(true);
      setShowTermsModal(false);
      const data = await authApi.bootstrap({
        storeName,
        investmentCapital: Number(investmentCapital) || 0,
        username,
        password,
        fullName,
      });
      login(data.token, data.user, data.refreshToken || data.token_id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Khởi tạo hệ thống thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (isBootstrapped === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
          <p className="text-slate-500 font-semibold">Đang tải cấu hình hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-card rounded-3xl p-8 shadow-2xl relative z-[1]">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-3">
            <Shield className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            {isBootstrapped ? "Đăng Nhập Hệ Thống" : "Khởi Tạo Hệ Thống"}
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            {isBootstrapped
              ? "Quản lý chuỗi cửa hàng cầm đồ, tín chấp và trả góp"
              : "Chào mừng! Hãy tạo chi nhánh và tài khoản quản trị đầu tiên"}
          </p>
        </div>

        {isBootstrapped ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label text-slate-600 font-semibold text-sm">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered w-full pl-11 bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label text-slate-600 font-semibold text-sm">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-11 bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold rounded-xl mt-6 gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Bootstrap Form */
          <form onSubmit={handleBootstrapClick} className="space-y-4">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">1. Thông tin cửa hàng</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-slate-600 font-semibold text-xs py-1">Tên cửa hàng/Chi nhánh *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Chi nhánh Quận 1"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="input input-bordered w-full pl-9 bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl input-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-xs py-1">Vốn đầu tư</label>
                <MoneyInput
                  value={investmentCapital}
                  onChange={(val) => setInvestmentCapital(val)}
                  placeholder="5.000.000.000"
                  className="input-sm bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl"
                />
              </div>
            </div>

            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-4 mb-2">2. Tài khoản quản trị chuỗi</p>
            <div>
              <label className="label text-slate-600 font-semibold text-xs py-1">Họ tên quản trị viên *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl input-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-slate-600 font-semibold text-xs py-1">Tên đăng nhập *</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered w-full bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl input-sm"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-xs py-1">Mật khẩu *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl input-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold rounded-xl mt-6 gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <span>Khởi tạo & Đăng nhập</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Điều khoản sử dụng & Chính sách bảo mật</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-600 leading-relaxed">
              {/* ═══════════════════════════════════════════════════════════ */}
              {/* SECTION 1: ĐIỀU KHOẢN SỬ DỤNG (Full) */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-slate-800 text-base uppercase tracking-wide">Thỏa Thuận Cấp Phép và Điều Khoản Sử Dụng Phần Mềm CDPawn</h3>
                </div>

                {/* Mở đầu */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-900 space-y-2">
                  <p>
                    Bản thỏa thuận này có giá trị như một <strong>Hợp đồng cấp phép sử dụng phần mềm</strong>, áp dụng ngay khi Phần mềm CDPawn được cài đặt và bàn giao thành công lên hệ thống máy chủ do Khách hàng chỉ định.
                  </p>
                  <p>
                    Bằng việc ký kết Biên bản nghiệm thu và tiếp nhận mã nguồn, Khách hàng tại đây xác nhận và cam kết đã đọc kỹ, hiểu, đồng ý, chấp nhận tuân thủ và chịu sự ràng buộc với các quy định được mô tả trong Điều Khoản và Điều Kiện này. Việc chấp nhận các điều khoản cũng đồng nghĩa với việc chấp nhận tuân thủ các quy định của pháp luật hiện hành đang điều chỉnh quan hệ pháp luật dân sự và các ngành luật khác trong hệ thống pháp luật Việt Nam có liên quan.
                  </p>
                </div>

                {/* Điều 1 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 1. Giải thích từ ngữ</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p><strong className="text-slate-600">Phần Mềm (CDPawn):</strong> Là giải pháp phần mềm cung cấp chức năng quản lý các khoản cho vay, cầm đồ, trả góp và dòng tiền, được thiết kế và bàn giao cho Khách hàng. Phần mềm được xây dựng bằng các thuật toán nhằm hỗ trợ cho khách hàng khi hoạt động đúng với các quy định của pháp luật.</p>
                    <p><strong className="text-slate-600">Khách Hàng:</strong> Là tổ chức, cá nhân tiếp cận, tìm hiểu, truy cập, đăng ký tài khoản, và/hoặc sử dụng Phần Mềm bằng phương tiện điện tử của mình. Khách hàng sử dụng phần mềm để hỗ trợ hoạt động kinh doanh trên cơ sở của pháp luật và không trái đạo đức xã hội.</p>
                    <p><strong className="text-slate-600">Giới hạn nhận biết:</strong> Bên cung cấp phần mềm không biết, không thể biết và pháp luật không buộc phải biết về nội dung cụ thể các giao dịch dân sự phát sinh giữa khách hàng với bên thứ ba. Khách hàng tự chịu trách nhiệm trước pháp luật về tất cả các nghiệp vụ, kỹ năng kinh doanh.</p>
                  </div>
                </div>

                {/* Điều 2 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 2. Phạm vi cấp phép sử dụng</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p>Bên Phát triển cấp cho Khách Hàng quyền sử dụng mã nguồn và hệ thống Phần Mềm CDPawn nhằm phục vụ <strong className="text-slate-600">duy nhất</strong> cho hoạt động kinh doanh của Khách Hàng.</p>
                    <p>Khách Hàng <strong className="text-slate-600">không được phép</strong> phân phối lại, bán lại (re-sell), cho thuê, hoặc đóng gói lại mã nguồn dưới dạng phần mềm dịch vụ (SaaS) để cung cấp cho bất kỳ bên thứ ba nào khác.</p>
                  </div>
                </div>

                {/* Điều 3 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 3. Quyền Sở hữu trí tuệ</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p>Bản quyền cấu trúc hệ thống, các thay đổi về thiết kế giao diện (layout), và các đoạn mã lệnh (source code) được lập trình (bao gồm cả các đoạn mã được tạo ra thông qua sự hỗ trợ của AI Agent trong quá trình làm lại hệ thống) <strong className="text-slate-600">hoàn toàn thuộc quyền sở hữu của Bên Phát triển</strong>.</p>
                    <p>Khách Hàng không được phép xâm phạm quyền sở hữu trí tuệ hoặc các quyền sở hữu khác đối với phần mềm. Khách Hàng chỉ sở hữu kho dữ liệu vận hành thực tế và phiên bản ứng dụng đang được lưu trữ trên máy chủ của Khách Hàng.</p>
                  </div>
                </div>

                {/* Điều 4 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 4. Trách nhiệm của Khách hàng</p>
                  <div className="space-y-2 text-xs text-slate-500 pl-1">
                    <div>
                      <p className="font-semibold text-slate-600">Tuân thủ pháp luật:</p>
                      <p>Trong suốt quá trình sử dụng, Khách Hàng phải tự chịu trách nhiệm quản lý nội dung thông tin và hoạt động trên Tài Khoản của mình. Khách Hàng tự chịu trách nhiệm về tính xác thực, tính hợp pháp của các hoạt động kinh doanh của mình với các chủ thể khác.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">Giới hạn lãi suất:</p>
                      <p>Khách hàng phải có nghĩa vụ cập nhật các chính sách về lãi suất cơ bản của Ngân hàng nhà nước để đảm bảo rằng lãi suất cho vay luôn thấp hơn trần lãi suất mà pháp luật cho phép các bên thỏa thuận trong giao dịch dân sự.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">Hành vi bị nghiêm cấm:</p>
                      <p>Khách Hàng không được sử dụng dịch vụ để thực hiện hành vi vi phạm pháp luật, trái với đạo đức, thuần phong mỹ tục Việt Nam. Cụ thể không được:</p>
                      <ul className="list-disc list-inside space-y-0.5 pl-2 mt-1">
                        <li>Làm tổn hại, làm phiền cho người khác hoặc gây ra thương tổn đến con người và tài sản.</li>
                        <li>Liên quan đến việc công bố các thông tin hoặc tài liệu lừa đảo, gây mất uy tín danh dự, quấy rối hoặc mang tính khiêu dâm.</li>
                        <li>Gây tổn hại đến an ninh trật tự, an toàn xã hội.</li>
                        <li>Cản trở hoặc phá hỏng Dịch vụ (bao gồm nhưng không giới hạn bởi việc truy cập Phần Mềm thông qua bất cứ phương tiện máy móc, phần mềm).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Điều 5 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 5. Điều khoản miễn trừ trách nhiệm</p>
                  <div className="space-y-2 text-xs text-slate-500 pl-1">
                    <div>
                      <p className="font-semibold text-slate-600">Về hoạt động của khách hàng:</p>
                      <p>Khi sử dụng Phần Mềm, Khách hàng hiểu và đồng ý rằng Bên Phát triển không chịu trách nhiệm và không liên quan đến bất kỳ nội dung thông tin/trao đổi hoạt động nào giữa Khách hàng và bên thứ ba nào.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">Về hạ tầng và dữ liệu:</p>
                      <p>Sau khi bàn giao mã nguồn lên máy chủ của Khách Hàng, Khách Hàng toàn quyền kiểm soát cơ sở dữ liệu. Bên Phát triển không chịu trách nhiệm về các sự cố mất mát, rò rỉ dữ liệu phát sinh từ lỗ hổng máy chủ hoặc do sự bất cẩn trong quản lý mật khẩu.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">Về vận hành kỹ thuật:</p>
                      <p>Bên Phát triển không đảm bảo rằng sự vận hành của Phần Mềm không bị gián đoạn, không có sự chậm trễ, từ chối lệnh, bị lỗi, mất hoặc bị hủy bỏ thông tin hoặc các lỗi do virut, phần mềm thứ ba vì các lý do bất khả kháng.</p>
                    </div>
                  </div>
                </div>

                {/* Điều 6 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 6. Trách nhiệm bảo mật và An toàn thông tin</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p>Khách Hàng phải tự bảo mật thông tin tài khoản của cá nhân, tuyệt đối không để lộ hoặc cung cấp thông tin về user/password của mình trên Phần Mềm cho bất kì bên thứ ba nào khác để tránh rủi ro.</p>
                    <p>Khi phát hiện các Thông Tin Bảo Mật hoặc Phương Tiện Điện Tử có thể không thuộc quyền kiểm soát của mình, Khách Hàng phải kịp thời thông báo ngay lập tức cho hệ thống hỗ trợ về việc kết nối trái phép vào Phần Mềm.</p>
                  </div>
                </div>

                {/* Điều 7 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 7. Quy định chung và Giải quyết tranh chấp</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p>Bản Điều Khoản và Điều Kiện này được điều chỉnh bởi luật pháp hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
                    <p>Nếu bất kỳ điều khoản hay điều kiện nào bị tuyên bố là không có hiệu lực hay không thể thi hành bởi cơ quan nhà nước có thẩm quyền, thì những điều khoản hay điều kiện đó sẽ không làm vô hiệu các quy định khác.</p>
                    <p>Trong trường hợp có bất kỳ tranh chấp nào mà các bên không giải quyết được bằng thương lượng, thì tranh chấp đó sẽ được giải quyết tại <strong className="text-slate-600">Trung tâm Trọng Tài Quốc Tế Việt Nam (VIAC)</strong> theo Quy tắc tố tụng trọng tài của Trung tâm này.</p>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════ */}
              <hr className="border-slate-200" />
              {/* ═══════════════════════════════════════════════════════════ */}
              {/* SECTION 2: CHÍNH SÁCH BẢO MẬT (Full) */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-black text-slate-800 text-base">Chính Sách Bảo Mật</h3>
                </div>

                {/* Mở đầu */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-900 space-y-2">
                  <p>Chính sách bảo mật này được tích hợp sẵn trong hệ thống phần mềm <strong>CDPawn</strong> nhằm hỗ trợ Đơn vị vận hành hệ thống (Cơ sở kinh doanh) thông báo đến khách hàng của mình về cách thức thu thập, xử lý và bảo vệ dữ liệu cá nhân.</p>
                  <p className="text-emerald-700 italic">Đội ngũ phát triển CDPawn cung cấp nền tảng công nghệ và <strong>không phải là chủ thể kiểm soát dữ liệu</strong>. Toàn bộ dữ liệu vận hành được lưu trữ trực tiếp trên máy chủ do Đơn vị vận hành quản lý.</p>
                </div>

                {/* Điều 1 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 1. Phạm vi thu thập thông tin</p>
                  <div className="text-xs text-slate-500 pl-1">
                    <p className="mb-1">Hệ thống phần mềm CDPawn cung cấp công cụ để Đơn vị vận hành thực hiện thu thập và quản lý các dữ liệu sau:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      <li><strong className="text-slate-600">Thông tin tài khoản:</strong> Họ tên, tên đăng nhập, mật khẩu (được mã hóa), số điện thoại.</li>
                      <li><strong className="text-slate-600">Thông tin khách hàng:</strong> Họ tên, CMND/CCCD, địa chỉ, số điện thoại, thông tin người thân liên hệ.</li>
                      <li><strong className="text-slate-600">Dữ liệu giao dịch:</strong> Hợp đồng cầm đồ, tín chấp, trả góp, nguồn vốn, phiếu thu/chi, lịch sử thanh toán lãi.</li>
                      <li><strong className="text-slate-600">Dữ liệu tài sản cầm đồ:</strong> Thông tin mô tả, ảnh chụp tài sản thế chấp.</li>
                      <li><strong className="text-slate-600">Nhật ký hoạt động:</strong> Lịch sử đăng nhập, thao tác trên hệ thống.</li>
                    </ul>
                  </div>
                </div>

                {/* Điều 2 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 2. Mục đích sử dụng thông tin</p>
                  <p className="text-xs text-slate-500 pl-1">Phần mềm CDPawn được thiết kế để hỗ trợ Đơn vị vận hành sử dụng dữ liệu thu thập vào các mục đích: Quản lý tài khoản và phân quyền, vận hành nghiệp vụ tài chính, gửi thông báo cảnh báo, kiểm tra và truy vết thao tác.</p>
                </div>

                {/* Điều 3 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 3. Biện pháp bảo mật kỹ thuật</p>
                  <div className="text-xs text-slate-500 pl-1 space-y-1">
                    <p>Hệ thống phần mềm CDPawn được thiết kế và trang bị các tiêu chuẩn bảo mật kỹ thuật tiên tiến để hỗ trợ Đơn vị vận hành bảo vệ dữ liệu, bao gồm:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      <li><strong className="text-slate-600">Mã hóa mật khẩu (bcrypt):</strong> Tất cả mật khẩu được băm, không ai có thể đọc ngược mật khẩu gốc.</li>
                      <li><strong className="text-slate-600">Hỗ trợ HTTPS/TLS:</strong> Mã hóa dữ liệu truyền tải bằng giao thức TLS 1.2+.</li>
                      <li><strong className="text-slate-600">Xác thực JWT:</strong> Token có thời hạn, phiên đăng nhập tự động hết hạn.</li>
                      <li><strong className="text-slate-600">Phân quyền RBAC:</strong> Mỗi nhân viên chỉ truy cập đúng chức năng được cấp quyền.</li>
                    </ul>
                    <p className="italic text-slate-400">* Trách nhiệm duy trì và bảo mật hạ tầng máy chủ thuộc về Đơn vị vận hành.</p>
                  </div>
                </div>

                {/* Điều 4 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 4. Chia sẻ và tiết lộ thông tin</p>
                  <div className="text-xs text-slate-500 pl-1 space-y-1.5">
                    <p><strong className="text-slate-600">Đội ngũ phát triển nền tảng CDPawn hoàn toàn không có quyền truy cập, can thiệp hay sao chép dữ liệu thực tế</strong> đang chạy trên máy chủ của Đơn vị vận hành.</p>
                    <p>Việc quản lý, chia sẻ và cung cấp dữ liệu cho cơ quan chức năng (nếu có) thuộc thẩm quyền và trách nhiệm pháp lý của Đơn vị vận hành hệ thống.</p>
                  </div>
                </div>

                {/* Điều 5 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 5. Thời gian lưu trữ dữ liệu</p>
                  <p className="text-xs text-slate-500 pl-1">Đơn vị vận hành có toàn quyền quản lý thời gian lưu trữ dữ liệu trên máy chủ của mình, và cần đảm bảo tuân thủ quy định pháp luật Việt Nam về lưu trữ chứng từ tài chính. Đơn vị vận hành có trách nhiệm sao lưu dữ liệu định kỳ.</p>
                </div>

                {/* Điều 6 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 6. Quyền của người dùng</p>
                  <div className="text-xs text-slate-500 pl-1">
                    <p className="mb-1">Khách hàng (Người vay) có các quyền sau liên quan đến dữ liệu cá nhân tại Đơn vị vận hành:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      <li><strong className="text-slate-600">Quyền truy cập:</strong> Xem lại thông tin cá nhân đã cung cấp.</li>
                      <li><strong className="text-slate-600">Quyền chỉnh sửa:</strong> Yêu cầu cập nhật thông tin không chính xác.</li>
                      <li><strong className="text-slate-600">Quyền xóa:</strong> Yêu cầu xóa dữ liệu cá nhân (trừ dữ liệu phải lưu trữ theo luật).</li>
                      <li><strong className="text-slate-600">Quyền phản đối:</strong> Từ chối xử lý dữ liệu trong một số trường hợp.</li>
                      <li><strong className="text-slate-600">Quyền khiếu nại:</strong> Liên hệ Đơn vị vận hành hoặc cơ quan bảo vệ dữ liệu.</li>
                    </ul>
                  </div>
                </div>

                {/* Điều 7 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 7. Trách nhiệm của người dùng</p>
                  <div className="text-xs text-slate-500 pl-1">
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      <li>Bảo mật mật khẩu đăng nhập, không chia sẻ cho bất kỳ ai.</li>
                      <li>Sử dụng mật khẩu mạnh (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số).</li>
                      <li>Đăng xuất sau khi sử dụng trên thiết bị công cộng hoặc dùng chung.</li>
                      <li>Thông báo ngay cho quản trị viên khi phát hiện truy cập trái phép.</li>
                      <li>Không cố ý khai thác lỗ hổng bảo mật hoặc tấn công hệ thống.</li>
                    </ul>
                  </div>
                </div>

                {/* Điều 8 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 8. Miễn trừ trách nhiệm của đội ngũ phát triển</p>
                  <div className="space-y-1.5 text-xs text-slate-500 pl-1">
                    <p>Đội ngũ phát triển CDPawn <strong className="text-slate-600">không kiểm soát, không truy cập và không chịu trách nhiệm</strong> đối với dữ liệu thực tế được nhập, lưu trữ và xử lý trên máy chủ của Đơn vị vận hành.</p>
                    <p>Đơn vị vận hành hệ thống chịu trách nhiệm hoàn toàn về: việc tuân thủ pháp luật trong quá trình thu thập và xử lý dữ liệu; bảo mật hạ tầng máy chủ và cơ sở dữ liệu; ban hành quy trình nội bộ về bảo vệ dữ liệu cá nhân cho khách hàng của mình.</p>
                    <p>Trong trường hợp xảy ra sự cố rò rỉ dữ liệu do lỗ hổng máy chủ, cấu hình hạ tầng, hoặc sự bất cẩn trong quản lý mật khẩu, đội ngũ phát triển CDPawn không chịu trách nhiệm pháp lý liên quan.</p>
                  </div>
                </div>

                {/* Điều 9 */}
                <div>
                  <p className="font-bold text-slate-800 text-[13px] mb-1">Điều 9. Tuân thủ pháp luật</p>
                  <p className="text-xs text-slate-500 pl-1">CDPawn là giải pháp công nghệ được thiết kế với các tiêu chuẩn an toàn nhằm hỗ trợ các cơ sở kinh doanh tuân thủ Luật An ninh mạng 2018 và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Đơn vị vận hành hệ thống có trách nhiệm cao nhất trong việc ban hành quy trình nội bộ để bảo vệ dữ liệu của khách hàng.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              {/* Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-warning mt-0.5 shrink-0"
                />
                <span className="text-sm text-slate-700 leading-snug">
                  Tôi đã đọc và đồng ý với{" "}
                  <strong className="text-amber-600">Điều khoản sử dụng</strong> và{" "}
                  <strong className="text-emerald-600">Chính sách bảo mật</strong>{" "}
                  của phần mềm CDPawn.
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="btn btn-ghost flex-1 rounded-xl text-slate-600"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={!termsAccepted || loading}
                  onClick={handleBootstrapConfirm}
                  className="btn flex-1 bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold rounded-xl gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Đồng ý & Khởi tạo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
