import express from 'express';
import { adminService } from '../services/AdminService';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';

const router = express.Router();

/**
 * @route POST /api/admin/create
 * @desc Create a new admin account
 * @access Private (Super Admin only)
 */
router.post('/create', adminAuthMiddleware(['super_admin']), async (req, res) => {
  try {
    const adminData = req.body;
    const result = await adminService.createAdmin(adminData);
    
    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          username: result.admin.username,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
          role: result.admin.role,
          permissions: result.admin.permissions,
          isActive: result.admin.isActive,
          createdAt: result.admin.createdAt,
        },
        wallet: {
          id: result.wallet.id,
          currency: result.wallet.currency,
          balance: result.wallet.balance,
          totalEarnings: result.wallet.totalEarnings,
          totalFees: result.wallet.totalFees,
          totalTransactions: result.wallet.totalTransactions,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create admin account',
    });
  }
});

/**
 * @route POST /api/admin/login
 * @desc Admin login
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.loginAdmin({ email, password });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          username: result.admin.username,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
          role: result.admin.role,
          permissions: result.admin.permissions,
          lastLoginAt: result.admin.lastLoginAt,
        },
        token: result.token,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

/**
 * @route GET /api/admin/profile
 * @desc Get admin profile
 * @access Private (Admin only)
 */
router.get('/profile', adminAuthMiddleware(['super_admin', 'admin', 'moderator']), async (req, res) => {
  try {
    const adminId = req.admin?.adminId;
    const admin = await adminService.getAdminById(adminId!);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile',
    });
  }
});

/**
 * @route GET /api/admin/wallet
 * @desc Get admin wallet
 * @access Private (Admin only)
 */
router.get('/wallet', adminAuthMiddleware(['super_admin', 'admin', 'moderator']), async (req, res) => {
  try {
    const adminId = req.admin?.adminId;
    const { currency = 'NGN' } = req.query;
    
    const wallet = await adminService.getAdminWallet(adminId!, currency as string);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Admin wallet not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          currency: wallet.currency,
          balance: wallet.balance,
          totalEarnings: wallet.totalEarnings,
          totalFees: wallet.totalFees,
          totalTransactions: wallet.totalTransactions,
          lastTransactionAt: wallet.lastTransactionAt,
          createdAt: wallet.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get admin wallet',
    });
  }
});

/**
 * @route GET /api/admin/earnings
 * @desc Get admin earnings summary
 * @access Private (Admin only)
 */
router.get('/earnings', adminAuthMiddleware(['super_admin', 'admin', 'moderator']), async (req, res) => {
  try {
    const adminId = req.admin?.adminId;
    const { currency = 'NGN' } = req.query;
    
    const earnings = await adminService.getAdminEarningsSummary(adminId!, currency as string);
    
    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get admin earnings',
    });
  }
});

/**
 * @route POST /api/admin/credit-earnings
 * @desc Credit admin with transaction fees
 * @access Private (System only)
 */
router.post('/credit-earnings', adminAuthMiddleware(['super_admin']), async (req, res) => {
  try {
    const { adminId, amount, currency, transactionId, description, metadata } = req.body;
    
    const result = await adminService.creditAdminEarnings({
      adminId,
      amount,
      currency,
      transactionId,
      description,
      metadata,
    });
    
    res.json({
      success: true,
      message: 'Admin earnings credited successfully',
      data: {
        transaction: {
          id: result.id,
          type: result.type,
          amount: result.amount,
          currency: result.currency,
          description: result.description,
          status: result.status,
          processedAt: result.processedAt,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to credit admin earnings',
    });
  }
});

/**
 * @route GET /api/admin/all-wallets
 * @desc Get all admin wallets
 * @access Private (Super Admin only)
 */
router.get('/all-wallets', adminAuthMiddleware(['super_admin']), async (req, res) => {
  try {
    const wallets = await adminService.getAllAdminWallets();
    
    res.json({
      success: true,
      data: {
        wallets: wallets.map(wallet => ({
          id: wallet.id,
          admin: wallet.admin,
          currency: wallet.currency,
          balance: wallet.balance,
          totalEarnings: wallet.totalEarnings,
          totalFees: wallet.totalFees,
          totalTransactions: wallet.totalTransactions,
          lastTransactionAt: wallet.lastTransactionAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get admin wallets',
    });
  }
});

/**
 * @route GET /api/admin/system-earnings
 * @desc Get system-wide admin earnings
 * @access Private (Super Admin only)
 */
router.get('/system-earnings', adminAuthMiddleware(['super_admin']), async (req, res) => {
  try {
    const earnings = await adminService.getSystemAdminEarnings();
    
    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get system earnings',
    });
  }
});

/**
 * @route POST /api/admin/initialize
 * @desc Initialize default super admin
 * @access Public (One-time setup)
 */
router.post('/initialize', async (req, res) => {
  try {
    const result = await adminService.createDefaultSuperAdmin();
    
    res.status(201).json({
      success: true,
      message: 'Default super admin created successfully',
      data: {
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          username: result.admin.username,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
          role: result.admin.role,
        },
        wallet: {
          id: result.wallet.id,
          currency: result.wallet.currency,
          balance: result.wallet.balance,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to initialize super admin',
    });
  }
});

export default router;
