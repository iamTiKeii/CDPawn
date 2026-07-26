import React from "react";
import { ShieldCheck } from "lucide-react";

export const Home: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Legal Warning Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-[#dc2626] font-bold text-lg mb-2 uppercase tracking-wide">
          Cảnh báo và cam kết khi sử dụng hệ thống
        </h2>
        <p className="text-slate-600 text-sm mb-5">
          Bằng việc đăng nhập vào hệ thống, Quý Khách hàng xác nhận và cam kết tuân thủ tuyệt đối các điều kiện sau:
        </p>

        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          {/* 1. Tuân thủ pháp luật */}
          <div>
            <h3 className="font-bold text-slate-800 mb-1.5">1. Tuân thủ pháp luật về lãi suất:</h3>
            <p>
              Quý Khách hàng không được sử dụng phần mềm để phục vụ các giao dịch vi phạm pháp luật, trái đạo đức hoặc thuần phong mỹ tục. Quý Khách hàng có nghĩa vụ đảm bảo mức lãi suất cho vay áp dụng luôn tuân thủ quy định tại{" "}
              <span className="text-[#dc2626] font-bold">Điều 468 Bộ luật Dân sự 2015</span>{" "}
              (không vượt quá 20%/năm). Các hành vi thiết lập lãi suất vượt quá giới hạn pháp luật có thể bị khép vào Tội cho vay lãi nặng trong giao dịch dân sự và bị truy cứu trách nhiệm hình sự theo{" "}
              <span className="text-[#dc2626] font-bold">Điều 201 Bộ luật Hình sự</span>.
            </p>
          </div>

          {/* 2. Tự chịu trách nhiệm */}
          <div>
            <h3 className="font-bold text-slate-800 mb-1.5">2. Tự chịu trách nhiệm vận hành:</h3>
            <p>
              Hệ thống chỉ cung cấp công cụ tính toán và lưu trữ dữ liệu. Quý Khách hàng có trách nhiệm tự tìm hiểu, cập nhật các quy định pháp luật điều chỉnh ngành nghề kinh doanh của mình. Quý Khách hàng là bên duy nhất kiểm soát nội dung, số liệu giao dịch và chịu hoàn toàn trách nhiệm trước các cơ quan nhà nước có thẩm quyền đối với bất kỳ vi phạm nào phát sinh từ quá trình sử dụng hệ thống.{" "}
              <span className="font-bold text-slate-800">Nhóm phát triển phần mềm được miễn trừ mọi trách nhiệm liên đới.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Central Graphic Section */}
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6 shadow-inner border border-amber-100">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-slate-800 text-2xl font-bold text-center tracking-wide">
          Hãy là người dùng có trách nhiệm
        </h1>
      </div>
    </div>
  );
};
