import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Use authentication middleware for all profile endpoints
router.use(authenticateToken as any);

// 1. Get current profile details
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user!.id },
    });

    if (!employee) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: employee.id,
      username: employee.username,
      full_name: employee.full_name,
      phone: employee.phone,
      email: employee.email,
      avatar_url: employee.avatar_url,
      address: employee.address,
      gender: employee.gender,
      birthday: employee.birthday,
      two_factor_enabled: false,
      bank_name: employee.bank_name,
      bank_account_number: employee.bank_account_number,
      bank_account_holder: employee.bank_account_holder,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Update profile details
router.put("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, email, address, gender, birthday, bankName, bankAccountNumber, bankAccountHolder } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: "Họ và tên là bắt buộc." });
    }

    const updated = await prisma.employee.update({
      where: { id: req.user!.id },
      data: {
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        gender: gender || null,
        birthday: birthday ? new Date(birthday) : null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_account_holder: bankAccountHolder || null,
      },
    });

    return res.json({
      message: "Cập nhật hồ sơ cá nhân thành công",
      user: {
        id: updated.id,
        full_name: updated.full_name,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        gender: updated.gender,
        birthday: updated.birthday,
        bankName: updated.bank_name,
        bankAccountNumber: updated.bank_account_number,
        bankAccountHolder: updated.bank_account_holder,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Change password
router.put("/password", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc." });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: req.user!.id },
    });

    if (!employee) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, employee.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Mật khẩu hiện tại không chính xác." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        password_hash: newHash,
      },
    });

    return res.json({ message: "Thay đổi mật khẩu thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
