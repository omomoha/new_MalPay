import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AdminTransactionAttributes {
  id: string;
  adminId: string;
  transactionId: string;
  type: 'fee_earned' | 'withdrawal' | 'refund' | 'bonus' | 'penalty';
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, any>;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTransactionCreationAttributes extends Optional<AdminTransactionAttributes, 'id' | 'processedAt' | 'createdAt' | 'updatedAt'> {}

export class AdminTransaction extends Model<AdminTransactionAttributes, AdminTransactionCreationAttributes> implements AdminTransactionAttributes {
  public id!: string;
  public adminId!: string;
  public transactionId!: string;
  public type!: 'fee_earned' | 'withdrawal' | 'refund' | 'bonus' | 'penalty';
  public amount!: number;
  public currency!: string;
  public description!: string;
  public metadata!: Record<string, any>;
  public status!: 'pending' | 'completed' | 'failed' | 'cancelled';
  public processedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdminTransaction.init(
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
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('fee_earned', 'withdrawal', 'refund', 'bonus', 'penalty'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['NGN', 'USD', 'USDT']],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    processedAt: {
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
    modelName: 'AdminTransaction',
    tableName: 'admin_transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['adminId'],
      },
      {
        fields: ['transactionId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default AdminTransaction;
