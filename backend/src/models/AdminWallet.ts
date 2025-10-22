import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AdminWalletAttributes {
  id: string;
  adminId: string;
  currency: string;
  balance: number;
  totalEarnings: number;
  totalFees: number;
  totalTransactions: number;
  lastTransactionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminWalletCreationAttributes extends Optional<AdminWalletAttributes, 'id' | 'lastTransactionAt' | 'createdAt' | 'updatedAt'> {}

export class AdminWallet extends Model<AdminWalletAttributes, AdminWalletCreationAttributes> implements AdminWalletAttributes {
  public id!: string;
  public adminId!: string;
  public currency!: string;
  public balance!: number;
  public totalEarnings!: number;
  public totalFees!: number;
  public totalTransactions!: number;
  public lastTransactionAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdminWallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
      validate: {
        isIn: [['NGN', 'USD', 'USDT']],
      },
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    totalFees: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    totalTransactions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AdminWallet',
    tableName: 'admin_wallets',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['adminId', 'currency'],
      },
      {
        fields: ['adminId'],
      },
      {
        fields: ['currency'],
      },
    ],
  }
);

export default AdminWallet;
