import React, { useState } from "react";
import { FileText, ShieldAlert, ShieldCheck, Lock, Database, Eye, UserCheck, Globe, Bell, Server } from "lucide-react";

type TabKey = "terms" | "privacy";

export const TermsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("terms");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in text-slate-800">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
            activeTab === "terms"
              ? "bg-amber-500/10 text-amber-600 border-amber-200 shadow-sm"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Điều khoản sử dụng</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
            activeTab === "privacy"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 shadow-sm"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Chính sách bảo mật</span>
        </button>
      </div>

      {activeTab === "terms" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">Thỏa Thuận Cấp Phép và Điều Khoản Sử Dụng Phần Mềm CDPawn</h1>
              <p className="text-slate-500 text-xs mt-0.5">Cập nhật lần cuối: 24/07/2026</p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-slate-600">
            {/* Mở đầu */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-900 text-[13px] leading-relaxed space-y-3">
              <p>
                Bản thỏa thuận này có giá trị như một <strong>Hợp đồng cấp phép sử dụng phần mềm</strong>, áp dụng ngay khi Phần mềm CDPawn được cài đặt và bàn giao thành công lên hệ thống máy chủ do Khách hàng chỉ định.
              </p>
              <p>
                Bằng việc ký kết Biên bản nghiệm thu và tiếp nhận mã nguồn, Khách hàng tại đây xác nhận và cam kết đã đọc kỹ, hiểu, đồng ý, chấp nhận tuân thủ và chịu sự ràng buộc với các quy định được mô tả trong Điều Khoản và Điều Kiện này. Việc chấp nhận các điều khoản cũng đồng nghĩa với việc chấp nhận tuân thủ các quy định của pháp luật hiện hành đang điều chỉnh quan hệ pháp luật dân sự và các ngành luật khác trong hệ thống pháp luật Việt Nam có liên quan.
              </p>
            </div>

            {/* Điều 1 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 1. Giải thích từ ngữ</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  <strong>Phần Mềm (CDPawn):</strong> Là giải pháp phần mềm cung cấp chức năng quản lý các khoản cho vay, cầm đồ, trả góp và dòng tiền, được thiết kế và bàn giao cho Khách hàng. Phần mềm được xây dựng bằng các thuật toán nhằm hỗ trợ cho khách hàng khi hoạt động đúng với các quy định của pháp luật.
                </p>
                <p>
                  <strong>Khách Hàng:</strong> Là tổ chức, cá nhân tiếp cận, tìm hiểu, truy cập, đăng ký tài khoản, và/hoặc sử dụng Phần Mềm bằng phương tiện điện tử của mình. Khách hàng sử dụng phần mềm để hỗ trợ hoạt động kinh doanh trên cơ sở của pháp luật và không trái đạo đức xã hội.
                </p>
                <p>
                  <strong>Giới hạn nhận biết:</strong> Bên cung cấp phần mềm không biết, không thể biết và pháp luật không buộc phải biết về nội dung cụ thể các giao dịch dân sự phát sinh giữa khách hàng với bên thứ ba. Khách hàng tự chịu trách nhiệm trước pháp luật về tất cả các nghiệp vụ, kỹ năng kinh doanh.
                </p>
              </div>
            </section>

            {/* Điều 2 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 2. Phạm vi cấp phép sử dụng</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  Bên Phát triển cấp cho Khách Hàng quyền sử dụng mã nguồn và hệ thống Phần Mềm CDPawn nhằm phục vụ <strong>duy nhất</strong> cho hoạt động kinh doanh của Khách Hàng.
                </p>
                <p>
                  Khách Hàng <strong>không được phép</strong> phân phối lại, bán lại (re-sell), cho thuê, hoặc đóng gói lại mã nguồn dưới dạng phần mềm dịch vụ (SaaS) để cung cấp cho bất kỳ bên thứ ba nào khác.
                </p>
              </div>
            </section>

            {/* Điều 3 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 3. Quyền Sở hữu trí tuệ</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  Bản quyền cấu trúc hệ thống, các thay đổi về thiết kế giao diện (layout), và các đoạn mã lệnh (source code) được lập trình (bao gồm cả các đoạn mã được tạo ra thông qua sự hỗ trợ của AI Agent trong quá trình làm lại hệ thống) <strong>hoàn toàn thuộc quyền sở hữu của Bên Phát triển</strong>.
                </p>
                <p>
                  Khách Hàng không được phép xâm phạm quyền sở hữu trí tuệ hoặc các quyền sở hữu khác đối với phần mềm. Khách Hàng chỉ sở hữu kho dữ liệu vận hành thực tế và phiên bản ứng dụng đang được lưu trữ trên máy chủ của Khách Hàng.
                </p>
              </div>
            </section>

            {/* Điều 4 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 4. Trách nhiệm của Khách hàng</span>
              </h2>
              <div className="space-y-3 pl-1">
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Tuân thủ pháp luật:</p>
                  <p>
                    Trong suốt quá trình sử dụng, Khách Hàng phải tự chịu trách nhiệm quản lý nội dung thông tin và hoạt động trên Tài Khoản của mình. Khách Hàng tự chịu trách nhiệm về tính xác thực, tính hợp pháp của các hoạt động kinh doanh của mình với các chủ thể khác.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Giới hạn lãi suất:</p>
                  <p>
                    Khách hàng phải có nghĩa vụ cập nhật các chính sách về lãi suất cơ bản của Ngân hàng nhà nước để đảm bảo rằng lãi suất cho vay luôn thấp hơn trần lãi suất mà pháp luật cho phép các bên thỏa thuận trong giao dịch dân sự.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Hành vi bị nghiêm cấm:</p>
                  <p>
                    Khách Hàng không được sử dụng dịch vụ để thực hiện hành vi vi phạm pháp luật, trái với đạo đức, thuần phong mỹ tục Việt Nam. Cụ thể không được:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500 mt-1">
                    <li>Làm tổn hại, làm phiền cho người khác hoặc gây ra thương tổn đến con người và tài sản.</li>
                    <li>Liên quan đến việc công bố các thông tin hoặc tài liệu lừa đảo, gây mất uy tín danh dự, quấy rối hoặc mang tính khiêu dâm.</li>
                    <li>Gây tổn hại đến an ninh trật tự, an toàn xã hội.</li>
                    <li>Cản trở hoặc phá hỏng Dịch vụ (bao gồm nhưng không giới hạn bởi việc truy cập Phần Mềm thông qua bất cứ phương tiện máy móc, phần mềm).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Điều 5 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 5. Điều khoản miễn trừ trách nhiệm</span>
              </h2>
              <div className="space-y-3 pl-1">
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Về hoạt động của khách hàng:</p>
                  <p>
                    Khi sử dụng Phần Mềm, Khách hàng hiểu và đồng ý rằng Bên Phát triển không chịu trách nhiệm và không liên quan đến bất kỳ nội dung thông tin/trao đổi hoạt động nào giữa Khách hàng và bên thứ ba nào. Bên Phát triển không chịu trách nhiệm liên quan đến tính xác thực của thông tin do Khách Hàng cung cấp, hoặc các nội dung và hoạt động được Khách Hàng cài đặt, sử dụng trong Phần Mềm, hoặc các hành vi vi phạm pháp luật của Khách Hàng.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Về hạ tầng và dữ liệu:</p>
                  <p>
                    Sau khi bàn giao mã nguồn lên máy chủ của Khách Hàng, Khách Hàng toàn quyền kiểm soát cơ sở dữ liệu. Bên Phát triển không chịu trách nhiệm về các sự cố mất mát, rò rỉ dữ liệu khách hàng (thông tin người vay, hình ảnh giấy tờ) phát sinh từ lỗ hổng máy chủ hoặc do sự bất cẩn trong quản lý mật khẩu của Khách Hàng.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Về vận hành kỹ thuật:</p>
                  <p>
                    Bên Phát triển không đảm bảo rằng sự vận hành của Phần Mềm không bị gián đoạn, không có sự chậm trễ, từ chối lệnh, bị lỗi, mất hoặc bị hủy bỏ thông tin hoặc các lỗi do virut, phần mềm thứ ba vì các lý do bất khả kháng.
                  </p>
                </div>
              </div>
            </section>

            {/* Điều 6 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 6. Trách nhiệm bảo mật và An toàn thông tin</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  Khách Hàng phải tự bảo mật thông tin tài khoản của cá nhân, tuyệt đối không để lộ hoặc cung cấp thông tin về user/password của mình trên Phần Mềm cho bất kì bên thứ ba nào khác để tránh rủi ro.
                </p>
                <p>
                  Khi phát hiện các Thông Tin Bảo Mật hoặc Phương Tiện Điện Tử có thể không thuộc quyền kiểm soát của mình, Khách Hàng phải kịp thời sử dụng các phương tiện thích hợp để thông báo ngay lập tức cho hệ thống hỗ trợ về việc kết nối trái phép vào Phần Mềm bằng Tài Khoản của Khách Hàng để thực hiện các hành vi trái phép hoặc vi phạm pháp luật.
                </p>
              </div>
            </section>

            {/* Điều 7 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span>
                <span>Điều 7. Quy định chung và Giải quyết tranh chấp</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  Bản Điều Khoản và Điều Kiện này được điều chỉnh bởi luật pháp hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                </p>
                <p>
                  Nếu bất kỳ điều khoản hay điều kiện nào trong bản này hay bất kỳ phần nào hoặc khoản mục nào bị tuyên bố là không có hiệu lực hay không thể thi hành bởi cơ quan nhà nước có thẩm quyền, thì những điều khoản hay điều kiện đó sẽ không làm vô hiệu các quy định khác.
                </p>
                <p>
                  Trong trường hợp có bất kỳ tranh chấp nào mà các bên không giải quyết được bằng thương lượng, thì tranh chấp đó sẽ được giải quyết tại <strong>Trung tâm Trọng Tài Quốc Tế Việt Nam (VIAC)</strong> theo Quy tắc tố tụng trọng tài của Trung tâm này.
                </p>
              </div>
            </section>

            {/* Legal notice */}
            <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-xs mt-6">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Lưu ý pháp lý</span>
                Vui lòng đảm bảo các hoạt động kinh doanh tài chính (cầm đồ, cho vay) của bạn tuân thủ đúng quy định của pháp luật Việt Nam hiện hành về mức trần lãi suất và đăng ký kinh doanh.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Chính sách bảo mật */}
      {activeTab === "privacy" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Chính Sách Bảo Mật</h1>
              <p className="text-slate-500 text-xs mt-0.5">Cập nhật lần cuối: 24/07/2026</p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-slate-600">

            {/* Mở đầu */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-900 text-[13px] leading-relaxed space-y-2">
              <p>
                Chính sách bảo mật này được tích hợp sẵn trong hệ thống phần mềm <strong>CDPawn</strong> nhằm hỗ trợ Đơn vị vận hành hệ thống (Cơ sở kinh doanh) thông báo đến khách hàng của mình về cách thức thu thập, xử lý và bảo vệ dữ liệu cá nhân.
              </p>
              <p className="text-emerald-700 text-xs italic">
                Đội ngũ phát triển CDPawn cung cấp nền tảng công nghệ và <strong>không phải là chủ thể kiểm soát dữ liệu</strong>. Toàn bộ dữ liệu vận hành được lưu trữ trực tiếp trên máy chủ do Đơn vị vận hành quản lý.
              </p>
            </div>

            {/* Điều 1. Phạm vi thu thập */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 1. Phạm vi thu thập thông tin</span>
              </h2>
              <p>
                Hệ thống phần mềm CDPawn cung cấp công cụ để Đơn vị vận hành thực hiện thu thập và quản lý các dữ liệu sau nhằm mục đích vận hành nghiệp vụ tài chính. Toàn bộ dữ liệu này được lưu trữ trực tiếp trên hệ thống máy chủ do Đơn vị vận hành quản lý:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li><strong>Thông tin tài khoản:</strong> Họ tên, tên đăng nhập, mật khẩu (được mã hóa), số điện thoại.</li>
                <li><strong>Thông tin khách hàng:</strong> Họ tên, CMND/CCCD, địa chỉ, số điện thoại, thông tin người thân liên hệ (nếu cung cấp).</li>
                <li><strong>Dữ liệu giao dịch:</strong> Hợp đồng cầm đồ, tín chấp, trả góp, nguồn vốn, phiếu thu/chi, lịch sử thanh toán lãi.</li>
                <li><strong>Dữ liệu tài sản cầm đồ:</strong> Thông tin mô tả, ảnh chụp tài sản thế chấp.</li>
                <li><strong>Nhật ký hoạt động:</strong> Lịch sử đăng nhập, thao tác trên hệ thống phục vụ kiểm tra và truy vết.</li>
              </ul>
            </section>

            {/* Điều 2. Mục đích sử dụng */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 2. Mục đích sử dụng thông tin</span>
              </h2>
              <p>
                Phần mềm CDPawn được thiết kế để hỗ trợ Đơn vị vận hành sử dụng dữ liệu thu thập vào các mục đích nghiệp vụ sau:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <UserCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Quản lý tài khoản</span>
                    <span className="text-[11px] text-slate-500">Xác thực danh tính, phân quyền truy cập theo vai trò nhân viên của Đơn vị vận hành.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Database className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Vận hành nghiệp vụ</span>
                    <span className="text-[11px] text-slate-500">Tạo, quản lý và tính toán lãi suất các hợp đồng tài chính theo cấu hình của Đơn vị vận hành.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Bell className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Thông báo & cảnh báo</span>
                    <span className="text-[11px] text-slate-500">Cảnh báo quá hạn đóng lãi, nhắc nhở thanh toán và thông báo nội bộ hệ thống.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Eye className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Kiểm tra & truy vết</span>
                    <span className="text-[11px] text-slate-500">Ghi nhận nhật ký thao tác nhằm đảm bảo minh bạch và truy xuất nguồn gốc cho Đơn vị vận hành.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Điều 3. Biện pháp bảo mật kỹ thuật */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 3. Biện pháp bảo mật kỹ thuật</span>
              </h2>
              <p>
                Hệ thống phần mềm CDPawn được thiết kế và trang bị các tiêu chuẩn bảo mật kỹ thuật tiên tiến để hỗ trợ Đơn vị vận hành bảo vệ dữ liệu, bao gồm:
              </p>
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Mã hóa mật khẩu (bcrypt)</span>
                    <span className="text-[11px] text-slate-500">Tất cả mật khẩu người dùng được băm (hash) bằng thuật toán bcrypt trước khi lưu trữ. Không ai, kể cả quản trị viên hoặc đội ngũ phát triển, có thể đọc ngược mật khẩu gốc.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <Globe className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Hỗ trợ truyền tải qua HTTPS/TLS</span>
                    <span className="text-[11px] text-slate-500">Phần mềm hỗ trợ mã hóa dữ liệu truyền tải bằng giao thức TLS 1.2+. Việc cấu hình chứng chỉ SSL trên máy chủ thuộc trách nhiệm của Đơn vị vận hành.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <Server className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Xác thực JWT & phiên đăng nhập</span>
                    <span className="text-[11px] text-slate-500">Hệ thống sử dụng token JWT có thời hạn để xác thực. Phiên đăng nhập tự động hết hạn khi không hoạt động, giảm rủi ro truy cập trái phép.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 text-xs block">Phân quyền dựa trên vai trò (RBAC)</span>
                    <span className="text-[11px] text-slate-500">Mỗi nhân viên chỉ được truy cập đúng các chức năng được cấp quyền. Quản trị viên của Đơn vị vận hành có thể tùy chỉnh bộ quyền chi tiết cho từng người dùng.</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic mt-2">
                * Trách nhiệm duy trì và bảo mật hạ tầng máy chủ chứa dữ liệu thuộc về Đơn vị vận hành hệ thống.
              </p>
            </section>

            {/* Điều 4. Chia sẻ và tiết lộ thông tin */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 4. Chia sẻ và tiết lộ thông tin</span>
              </h2>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 space-y-2 text-[13px] text-emerald-900">
                <p>
                  <strong>Đội ngũ phát triển nền tảng CDPawn hoàn toàn không có quyền truy cập, can thiệp hay sao chép dữ liệu thực tế</strong> đang chạy trên máy chủ của Đơn vị vận hành.
                </p>
                <p>
                  Việc quản lý, chia sẻ và cung cấp dữ liệu cho cơ quan chức năng (nếu có) thuộc thẩm quyền và trách nhiệm pháp lý của Đơn vị vận hành hệ thống.
                </p>
              </div>
              <p>
                Đơn vị vận hành có trách nhiệm đảm bảo rằng việc tiết lộ thông tin (nếu có) phải tuân thủ pháp luật hiện hành và chỉ được thực hiện trong các trường hợp:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Theo yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</li>
                <li>Khi có sự đồng ý bằng văn bản của chủ thể dữ liệu.</li>
                <li>Nhằm bảo vệ quyền lợi hợp pháp của Đơn vị vận hành trong các tranh chấp pháp lý.</li>
              </ul>
            </section>

            {/* Điều 5. Lưu trữ dữ liệu */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 5. Thời gian lưu trữ dữ liệu</span>
              </h2>
              <p>
                Đơn vị vận hành có toàn quyền quản lý thời gian lưu trữ dữ liệu trên máy chủ của mình, và cần đảm bảo tuân thủ quy định pháp luật Việt Nam về lưu trữ chứng từ tài chính.
              </p>
              <p>
                Phần mềm CDPawn hỗ trợ lưu trữ dữ liệu giao dịch trong suốt thời gian sử dụng dịch vụ. Đơn vị vận hành có trách nhiệm sao lưu dữ liệu định kỳ và thiết lập chính sách xóa/ẩn danh hóa dữ liệu cá nhân phù hợp với yêu cầu pháp luật.
              </p>
            </section>

            {/* Điều 6. Quyền của người dùng */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 6. Quyền của người dùng</span>
              </h2>
              <p>Khách hàng (Người vay) có các quyền sau liên quan đến dữ liệu cá nhân của mình tại Đơn vị vận hành:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li><strong>Quyền truy cập:</strong> Xem lại thông tin cá nhân đã cung cấp cho Đơn vị vận hành thông qua hệ thống.</li>
                <li><strong>Quyền chỉnh sửa:</strong> Yêu cầu Đơn vị vận hành cập nhật hoặc sửa đổi thông tin không chính xác.</li>
                <li><strong>Quyền xóa:</strong> Yêu cầu xóa dữ liệu cá nhân (trừ các dữ liệu phải lưu trữ theo quy định pháp luật).</li>
                <li><strong>Quyền phản đối:</strong> Từ chối xử lý dữ liệu trong một số trường hợp nhất định theo quy định pháp luật.</li>
                <li><strong>Quyền khiếu nại:</strong> Liên hệ trực tiếp Đơn vị vận hành hoặc cơ quan bảo vệ dữ liệu có thẩm quyền nếu phát hiện vi phạm.</li>
              </ul>
            </section>

            {/* Điều 7. Trách nhiệm của người dùng */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 7. Trách nhiệm của người dùng</span>
              </h2>
              <p>Để đảm bảo an toàn tài khoản và dữ liệu, người dùng hệ thống cần:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Bảo mật mật khẩu đăng nhập, không chia sẻ cho bất kỳ ai.</li>
                <li>Sử dụng mật khẩu mạnh (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số).</li>
                <li>Đăng xuất sau khi sử dụng trên thiết bị công cộng hoặc dùng chung.</li>
                <li>Thông báo ngay cho quản trị viên của Đơn vị vận hành khi phát hiện truy cập trái phép vào tài khoản.</li>
                <li>Không cố ý khai thác lỗ hổng bảo mật hoặc tấn công hệ thống.</li>
              </ul>
            </section>

            {/* Điều 8. Miễn trừ trách nhiệm của đội ngũ phát triển */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 8. Miễn trừ trách nhiệm của đội ngũ phát triển</span>
              </h2>
              <div className="space-y-2 pl-1">
                <p>
                  Đội ngũ phát triển CDPawn <strong>không kiểm soát, không truy cập và không chịu trách nhiệm</strong> đối với dữ liệu thực tế được nhập, lưu trữ và xử lý trên máy chủ của Đơn vị vận hành.
                </p>
                <p>
                  Đơn vị vận hành hệ thống chịu trách nhiệm hoàn toàn về: việc tuân thủ pháp luật trong quá trình thu thập và xử lý dữ liệu; bảo mật hạ tầng máy chủ và cơ sở dữ liệu; ban hành quy trình nội bộ về bảo vệ dữ liệu cá nhân cho khách hàng của mình.
                </p>
                <p>
                  Trong trường hợp xảy ra sự cố rò rỉ dữ liệu do lỗ hổng máy chủ, cấu hình hạ tầng, hoặc sự bất cẩn trong quản lý mật khẩu, đội ngũ phát triển CDPawn không chịu trách nhiệm pháp lý liên quan.
                </p>
              </div>
            </section>

            {/* Thông tin liên hệ */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                <span>Điều 9. Thông tin liên hệ</span>
              </h2>
              <p>
                Nếu có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ trực tiếp Đơn vị vận hành hệ thống của bạn:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1 text-xs mt-2">
                <p><strong>Nền tảng:</strong> CDPawn — Giải pháp quản lý cầm đồ & tín dụng</p>
                <p><strong>Đơn vị vận hành:</strong> Liên hệ quản trị viên hệ thống tại cơ sở kinh doanh của bạn</p>
              </div>
            </section>

            {/* Cam kết bảo mật */}
            <div className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs mt-6">
              <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Về tuân thủ pháp luật</span>
                CDPawn là giải pháp công nghệ được thiết kế với các tiêu chuẩn an toàn nhằm hỗ trợ các cơ sở kinh doanh tuân thủ Luật An ninh mạng 2018 và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Đơn vị vận hành hệ thống có trách nhiệm cao nhất trong việc ban hành quy trình nội bộ để bảo vệ dữ liệu của khách hàng.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
