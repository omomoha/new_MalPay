import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CardBalanceAttributes {
  id: string;
  userId: string;
  cardId: string;
  cardType: 'mastercard' | 'visa' | 'amex' | 'discover' | 'verve';
  encryptedBalance: string;
  encryptedCurrency: string;
  encryptedAccountNumber: string;
  lastUpdated: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardBalanceCreationAttributes extends Optional<CardBalanceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CardBalance extends Model<CardBalanceAttributes, CardBalanceCreationAttributes> implements CardBalanceAttributes {
  public id!: string;
  public userId!: string;
  public cardId!: string;
  public cardType!: 'mastercard' | 'visa' | 'amex' | 'discover' | 'verve';
  public encryptedBalance!: string;
  public encryptedCurrency!: string;
  public encryptedAccountNumber!: string;
  public lastUpdated!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CardBalance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    cardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cards',
        key: 'id',
      },
    },
    cardType: {
      type: DataTypes.ENUM('mastercard', 'visa', 'amex', 'discover', 'verve'),
      allowNull: false,
    },
    encryptedBalance: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted account balance data',
    },
    encryptedCurrency: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted currency code',
    },
    encryptedAccountNumber: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted account number for verification',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'CardBalance',
    tableName: 'card_balances',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['cardId'],
      },
      {
        fields: ['cardType'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default CardBalance;
