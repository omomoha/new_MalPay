import { Admin, AdminWallet, AdminTransaction } from '../models';
import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface CreateAdminData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  permissions?: string[];
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminEarningsData {
  adminId: string;
  amount: number;
  currency: string;
  transactionId: string;
  description: string;
  metadata?: Record<string, any>;
}

export class AdminService {
  private static instance: AdminService;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Create a new admin account
   */
  async createAdmin(data: CreateAdminData): Promise<{ admin: Admin; wallet: AdminWallet }> {
    const transaction = await sequelize.transaction();

    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        where: {
          [sequelize.Op.or]: [
            { email: data.email },
            { username: data.username },
            { phoneNumber: data.phoneNumber }
          ]
        },
        transaction
      });

      if (existingAdmin) {
        throw new Error('Admin with this email, username, or phone number already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create admin
      const admin = await Admin.create({
        id: uuidv4(),
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: data.role || 'admin',
        permissions: data.permissions || this.getDefaultPermissions(data.role || 'admin'),
        isActive: true,
      }, { transaction });

      // Create admin wallet
      const wallet = await AdminWallet.create({
        id: uuidv4(),
        adminId: admin.id,
        currency: 'NGN',
        balance: 0.00,
        totalEarnings: 0.00,
        totalFees: 0.00,
        totalTransactions: 0,
      }, { transaction });

      await transaction.commit();

      return { admin, wallet };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Authenticate admin login
   */
  async loginAdmin(data: AdminLoginData): Promise<{ admin: Admin; token: string }> {
    const admin = await Admin.findOne({
      where: { email: data.email, isActive: true }
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // In a real implementation, you would verify the password here
    // For now, we'll just check if the admin exists and is active
    const isValidPassword = true; // Replace with actual password verification

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await admin.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return { admin, token };
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: string): Promise<Admin | null> {
    return await Admin.findByPk(adminId);
  }

  /**
   * Get admin wallet
   */
  async getAdminWallet(adminId: string, currency: string = 'NGN'): Promise<AdminWallet | null> {
    return await AdminWallet.findOne({
      where: { adminId, currency }
    });
  }

  /**
   * Create or get admin wallet
   */
  async getOrCreateAdminWallet(adminId: string, currency: string = 'NGN'): Promise<AdminWallet> {
    let wallet = await this.getAdminWallet(adminId, currency);

    if (!wallet) {
      wallet = await AdminWallet.create({
        id: uuidv4(),
        adminId,
        currency,
        balance: 0.00,
        totalEarnings: 0.00,
        totalFees: 0.00,
        totalTransactions: 0,
      });
    }

    return wallet;
  }

  /**
   * Credit admin wallet with earnings from transaction fees
   */
  async creditAdminEarnings(data: AdminEarningsData): Promise<AdminTransaction> {
    const transaction = await sequelize.transaction();

    try {
      // Get or create admin wallet
      const wallet = await this.getOrCreateAdminWallet(data.adminId, data.currency);

      // Create admin transaction record
      const adminTransaction = await AdminTransaction.create({
        id: uuidv4(),
        adminId: data.adminId,
        transactionId: data.transactionId,
        type: 'fee_earned',
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        metadata: data.metadata || {},
        status: 'completed',
        processedAt: new Date(),
      }, { transaction });

      // Update wallet balance
      await wallet.update({
        balance: parseFloat(wallet.balance.toString()) + data.amount,
        totalEarnings: parseFloat(wallet.totalEarnings.toString()) + data.amount,
        totalFees: parseFloat(wallet.totalFees.toString()) + data.amount,
        totalTransactions: wallet.totalTransactions + 1,
        lastTransactionAt: new Date(),
      }, { transaction });

      await transaction.commit();

      return adminTransaction;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get admin earnings summary
   */
  async getAdminEarningsSummary(adminId: string, currency: string = 'NGN'): Promise<{
    wallet: AdminWallet;
    recentTransactions: AdminTransaction[];
    monthlyEarnings: number;
    totalEarnings: number;
  }> {
    const wallet = await this.getAdminWallet(adminId, currency);
    
    if (!wallet) {
      throw new Error('Admin wallet not found');
    }

    // Get recent transactions
    const recentTransactions = await AdminTransaction.findAll({
      where: { adminId, currency },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Calculate monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await AdminTransaction.findAll({
      where: {
        adminId,
        currency,
        type: 'fee_earned',
        status: 'completed',
        createdAt: {
          [sequelize.Op.gte]: startOfMonth,
        },
      },
    });

    const monthlyEarnings = monthlyTransactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
      0
    );

    return {
      wallet,
      recentTransactions,
      monthlyEarnings,
      totalEarnings: parseFloat(wallet.totalEarnings.toString()),
    };
  }

  /**
   * Get all admin wallets
   */
  async getAllAdminWallets(): Promise<AdminWallet[]> {
    return await AdminWallet.findAll({
      include: [{
        model: Admin,
        as: 'admin',
        attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'role'],
      }],
      order: [['totalEarnings', 'DESC']],
    });
  }

  /**
   * Get system-wide admin earnings
   */
  async getSystemAdminEarnings(): Promise<{
    totalEarnings: number;
    totalFees: number;
    totalTransactions: number;
    monthlyEarnings: number;
    topEarningAdmins: Array<{
      admin: Admin;
      wallet: AdminWallet;
    }>;
  }> {
    // Get all admin wallets
    const wallets = await this.getAllAdminWallets();

    // Calculate totals
    const totalEarnings = wallets.reduce(
      (sum, wallet) => sum + parseFloat(wallet.totalEarnings.toString()),
      0
    );

    const totalFees = wallets.reduce(
      (sum, wallet) => sum + parseFloat(wallet.totalFees.toString()),
      0
    );

    const totalTransactions = wallets.reduce(
      (sum, wallet) => sum + wallet.totalTransactions,
      0
    );

    // Calculate monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await AdminTransaction.findAll({
      where: {
        type: 'fee_earned',
        status: 'completed',
        createdAt: {
          [sequelize.Op.gte]: startOfMonth,
        },
      },
    });

    const monthlyEarnings = monthlyTransactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
      0
    );

    // Get top earning admins
    const topEarningAdmins = wallets
      .sort((a, b) => parseFloat(b.totalEarnings.toString()) - parseFloat(a.totalEarnings.toString()))
      .slice(0, 5)
      .map(wallet => ({
        admin: wallet.admin,
        wallet,
      }));

    return {
      totalEarnings,
      totalFees,
      totalTransactions,
      monthlyEarnings,
      topEarningAdmins,
    };
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: string): string[] {
    const permissions = {
      super_admin: [
        'manage_admins',
        'manage_users',
        'manage_transactions',
        'view_analytics',
        'manage_settings',
        'manage_wallets',
        'view_reports',
        'manage_system',
      ],
      admin: [
        'manage_users',
        'manage_transactions',
        'view_analytics',
        'manage_wallets',
        'view_reports',
      ],
      moderator: [
        'manage_users',
        'view_analytics',
        'view_reports',
      ],
    };

    return permissions[role as keyof typeof permissions] || [];
  }

  /**
   * Create the default super admin account
   */
  async createDefaultSuperAdmin(): Promise<{ admin: Admin; wallet: AdminWallet }> {
    const superAdminData: CreateAdminData = {
      email: 'admin@malpay.com',
      username: 'superadmin',
      firstName: 'MalPay',
      lastName: 'Administrator',
      phoneNumber: '+2348000000000',
      password: 'MalPay@Admin2024!',
      role: 'super_admin',
      permissions: [
        'manage_admins',
        'manage_users',
        'manage_transactions',
        'view_analytics',
        'manage_settings',
        'manage_wallets',
        'view_reports',
        'manage_system',
      ],
    };

    return await this.createAdmin(superAdminData);
  }
}

export const adminService = AdminService.getInstance();
export default AdminService;
