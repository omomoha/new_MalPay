import { Pool } from 'pg';
import axios from 'axios';
import { Logger } from 'winston';

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRateResponse {
  success: boolean;
  data?: ExchangeRate;
  error?: string;
}

export class ExchangeRateService {
  private db: Pool;
  private logger: Logger;
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(db: Pool, logger: Logger) {
    this.db = db;
    this.logger = logger;
  }

  /**
   * Get USDT to fiat exchange rate
   */
  async getUSDTToFiatRate(currency: string): Promise<number> {
    try {
      // Check cache first
      const cacheKey = `USDT_${currency}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        this.logger.debug(`Using cached exchange rate for USDT to ${currency}: ${cached.rate}`);
        return cached.rate;
      }

      // Get from database
      const dbRate = await this.getRateFromDatabase('USDT', currency);
      if (dbRate) {
        // Update cache
        this.cache.set(cacheKey, { rate: dbRate, timestamp: Date.now() });
        return dbRate;
      }

      // Fetch from external API if not in database
      const apiRate = await this.fetchRateFromAPI('USDT', currency);
      if (apiRate) {
        // Save to database
        await this.saveRateToDatabase('USDT', currency, apiRate, 'binance');
        
        // Update cache
        this.cache.set(cacheKey, { rate: apiRate, timestamp: Date.now() });
        return apiRate;
      }

      throw new Error(`Unable to get exchange rate for USDT to ${currency}`);
    } catch (error) {
      this.logger.error('Error getting USDT to fiat rate:', error);
      throw error;
    }
  }

  /**
   * Convert fiat amount to USDT
   */
  async convertFiatToUSDT(amount: number, currency: string): Promise<number> {
    const rate = await this.getUSDTToFiatRate(currency);
    return amount / rate;
  }

  /**
   * Convert USDT amount to fiat
   */
  async convertUSDTToFiat(amount: number, currency: string): Promise<number> {
    const rate = await this.getUSDTToFiatRate(currency);
    return amount * rate;
  }

  /**
   * Get exchange rate from database
   */
  private async getRateFromDatabase(baseCurrency: string, targetCurrency: string): Promise<number | null> {
    try {
      const query = `
        SELECT rate 
        FROM exchange_rates 
        WHERE base_currency = $1 
          AND target_currency = $2 
          AND is_active = true
        ORDER BY updated_at DESC 
        LIMIT 1
      `;
      
      const result = await this.db.query(query, [baseCurrency, targetCurrency]);
      return result.rows[0]?.rate || null;
    } catch (error) {
      this.logger.error('Error getting rate from database:', error);
      return null;
    }
  }

  /**
   * Save exchange rate to database
   */
  private async saveRateToDatabase(
    baseCurrency: string, 
    targetCurrency: string, 
    rate: number, 
    source: string
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO exchange_rates (base_currency, target_currency, rate, source)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (base_currency, target_currency, source)
        DO UPDATE SET 
          rate = EXCLUDED.rate,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await this.db.query(query, [baseCurrency, targetCurrency, rate, source]);
      this.logger.info(`Saved exchange rate ${baseCurrency}/${targetCurrency}: ${rate} from ${source}`);
    } catch (error) {
      this.logger.error('Error saving rate to database:', error);
      throw error;
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchRateFromAPI(baseCurrency: string, targetCurrency: string): Promise<number | null> {
    try {
      // Try Binance API first
      const binanceRate = await this.fetchFromBinance(baseCurrency, targetCurrency);
      if (binanceRate) return binanceRate;

      // Try CoinGecko API as fallback
      const coinGeckoRate = await this.fetchFromCoinGecko(baseCurrency, targetCurrency);
      if (coinGeckoRate) return coinGeckoRate;

      return null;
    } catch (error) {
      this.logger.error('Error fetching rate from API:', error);
      return null;
    }
  }

  /**
   * Fetch rate from Binance API
   */
  private async fetchFromBinance(baseCurrency: string, targetCurrency: string): Promise<number | null> {
    try {
      const symbol = `${baseCurrency}${targetCurrency}`;
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      
      if (response.data && response.data.price) {
        return parseFloat(response.data.price);
      }
      
      return null;
    } catch (error) {
      this.logger.warn(`Binance API error for ${baseCurrency}/${targetCurrency}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch rate from CoinGecko API
   */
  private async fetchFromCoinGecko(baseCurrency: string, targetCurrency: string): Promise<number | null> {
    try {
      // Map currencies to CoinGecko IDs
      const currencyMap: { [key: string]: string } = {
        'USDT': 'tether',
        'NGN': 'ngn',
        'USD': 'usd',
        'EUR': 'eur',
        'GBP': 'gbp'
      };

      const baseId = currencyMap[baseCurrency];
      const targetId = currencyMap[targetCurrency];

      if (!baseId || !targetId) {
        this.logger.warn(`Unsupported currency pair: ${baseCurrency}/${targetCurrency}`);
        return null;
      }

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${baseId}&vs_currencies=${targetId}`
      );

      if (response.data && response.data[baseId] && response.data[baseId][targetId]) {
        return response.data[baseId][targetId];
      }

      return null;
    } catch (error) {
      this.logger.warn(`CoinGecko API error for ${baseCurrency}/${targetCurrency}:`, error.message);
      return null;
    }
  }

  /**
   * Update all exchange rates
   */
  async updateAllRates(): Promise<void> {
    const currencies = ['NGN', 'USD', 'EUR', 'GBP'];
    
    for (const currency of currencies) {
      try {
        const rate = await this.fetchRateFromAPI('USDT', currency);
        if (rate) {
          await this.saveRateToDatabase('USDT', currency, rate, 'binance');
          this.logger.info(`Updated USDT/${currency} rate: ${rate}`);
        }
      } catch (error) {
        this.logger.error(`Error updating rate for USDT/${currency}:`, error);
      }
    }
  }

  /**
   * Get all active exchange rates
   */
  async getAllRates(): Promise<ExchangeRate[]> {
    try {
      const query = `
        SELECT id, base_currency, target_currency, rate, source, is_active, created_at, updated_at
        FROM exchange_rates
        WHERE is_active = true
        ORDER BY target_currency, updated_at DESC
      `;
      
      const result = await this.db.query(query);
      return result.rows.map(row => ({
        id: row.id,
        baseCurrency: row.base_currency,
        targetCurrency: row.target_currency,
        rate: parseFloat(row.rate),
        source: row.source,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      this.logger.error('Error getting all rates:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Exchange rate cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
