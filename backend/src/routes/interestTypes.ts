import { Router, Response } from "express";
import { prisma } from "../utils/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { InMemoryCache } from "../utils/cache";

const router = Router();

// Authenticate all requests to this router
router.use(authenticateToken as any);

// Mapping: UI params → system code
// period_unit: "daily" | "weekly" | "monthly"
// rate_type: "k_million" | "k_fixed" | "percent"
// repayment: "interest_only" | "interest_only_30" | "flat" | "reducing_emi" | "reducing_fixed"
function mapParamsToCode(
  period_unit: string,
  rate_type: string,
  repayment: string
): string | null {
  if (period_unit === "daily" && rate_type === "k_million" && repayment === "interest_only") return "daily_k_million";
  if (period_unit === "daily" && rate_type === "k_fixed" && repayment === "interest_only") return "daily_k_day";
  if (period_unit === "monthly" && rate_type === "percent" && repayment === "interest_only_30") return "monthly_percent_30";
  if (period_unit === "monthly" && rate_type === "percent" && repayment === "interest_only") return "monthly_percent_periodic";
  if (period_unit === "monthly" && rate_type === "k_fixed" && repayment === "interest_only") return "monthly_amount_periodic";
  if (period_unit === "weekly" && rate_type === "percent" && repayment === "interest_only") return "weekly_percent";
  if (period_unit === "weekly" && rate_type === "k_fixed" && repayment === "interest_only") return "weekly_amount";
  if (period_unit === "monthly" && rate_type === "percent" && repayment === "flat") return "flat_rate_monthly";
  if (period_unit === "daily" && rate_type === "percent" && repayment === "flat") return "flat_rate_daily";
  if (period_unit === "monthly" && rate_type === "percent" && repayment === "reducing_emi") return "reducing_balance_fixed_installment";
  if (period_unit === "monthly" && rate_type === "percent" && repayment === "reducing_fixed") return "reducing_balance_fixed_principal";
  return null;
}

function invalidateCache() {
  InMemoryCache.delete("interest_types_list");
}

// GET /api/interest-types
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = "interest_types_list";
    const cached = InMemoryCache.get<any[]>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const types = await prisma.interestType.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        is_system: true,
        calculation_method: true,
        status: true,
        notes: true,
      },
      orderBy: [{ is_system: "desc" }, { code: "asc" }],
    });

    InMemoryCache.set(cacheKey, types, 10 * 60 * 1000); // 10 min TTL
    return res.json(types);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/interest-types — Tạo alias hình thức lãi mới (is_system = false)
router.post(
  "/",
  requirePermission(["INTEREST_TYPES_MANAGE"]) as any,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, notes, period_unit, rate_type, repayment } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên hình thức lãi không được để trống." });
      }
      if (!period_unit || !rate_type || !repayment) {
        return res.status(400).json({ error: "Vui lòng chọn đầy đủ: đơn vị thời gian, kiểu lãi, hình thức trả gốc." });
      }

      const systemCode = mapParamsToCode(period_unit, rate_type, repayment);
      if (!systemCode) {
        return res.status(400).json({ error: "Tổ hợp tham số không hợp lệ. Vui lòng chọn lại." });
      }

      // Generate a unique code for the alias
      const baseCode = `custom_${systemCode}_${Date.now()}`;

      const created = await prisma.interestType.create({
        data: {
          code: baseCode,
          name: name.trim(),
          calculation_method: systemCode,
          is_system: false,
          status: "active",
          description: description?.trim() || null,
          notes: notes?.trim() || null,
        },
      });

      invalidateCache();
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/interest-types/:id — Sửa hình thức lãi
// - Bản ghi is_system=true: chỉ cho sửa name, description, notes
// - Bản ghi is_system=false: cho sửa tất cả kể cả tham số tính lãi
router.put(
  "/:id",
  requirePermission(["INTEREST_TYPES_MANAGE"]) as any,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, notes, period_unit, rate_type, repayment, status } = req.body;

      const existing = await prisma.interestType.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Không tìm thấy hình thức lãi." });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên hình thức lãi không được để trống." });
      }

      const updateData: any = {
        name: name.trim(),
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        status: status || existing.status,
      };

      // Chỉ cho phép thay đổi calculation_method nếu KHÔNG phải bản ghi hệ thống
      if (!existing.is_system && period_unit && rate_type && repayment) {
        const systemCode = mapParamsToCode(period_unit, rate_type, repayment);
        if (!systemCode) {
          return res.status(400).json({ error: "Tổ hợp tham số không hợp lệ. Vui lòng chọn lại." });
        }
        updateData.calculation_method = systemCode;
      }

      const updated = await prisma.interestType.update({
        where: { id },
        data: updateData,
      });

      invalidateCache();
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/interest-types/:id — Chỉ xóa được bản ghi is_system = false
router.delete(
  "/:id",
  requirePermission(["INTEREST_TYPES_MANAGE"]) as any,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const existing = await prisma.interestType.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Không tìm thấy hình thức lãi." });
      }

      if (existing.is_system) {
        return res.status(400).json({ error: "Không thể xóa hình thức lãi mặc định của hệ thống." });
      }

      // Kiểm tra xem có hàng hóa nào đang dùng không
      const inUseCount = await prisma.commodity.count({ where: { interest_type_id: id } });
      if (inUseCount > 0) {
        return res.status(400).json({
          error: `Không thể xóa vì đang được dùng bởi ${inUseCount} hàng hóa. Vui lòng chuyển hàng hóa sang hình thức lãi khác trước.`,
        });
      }

      await prisma.interestType.delete({ where: { id } });

      invalidateCache();
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

export default router;
