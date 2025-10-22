#!/usr/bin/env node

/**
 * MalPay Feature Implementation Test
 * Tests all implemented features and navigation flows
 */

const fs = require('fs');
const path = require('path');

class FeatureTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('🧪 Running MalPay Feature Implementation Tests...\n');
    
    try {
      await this.testNavigationStructure();
      await this.testCardAdditionFlow();
      await this.testSendMoneyFlow();
      await this.testBankAccountFeatures();
      await this.testMainTabScreens();
      await this.testSecurityImplementation();
      
      this.generateTestReport();
    } catch (error) {
      console.error('❌ Error running feature tests:', error);
    }
  }

  async testNavigationStructure() {
    console.log('🧭 Testing Navigation Structure...');
    
    const tests = [
      {
        name: '5-tab navigation structure exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('Cards') && content.includes('SendMoney') && 
                 content.includes('Transactions') && content.includes('Account');
        },
        expected: true
      },
      {
        name: 'Main tab screens are properly imported',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('CardsScreen') && content.includes('SendMoneyScreen') && 
                 content.includes('AccountScreen');
        },
        expected: true
      },
      {
        name: 'Card flow navigation exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('CardsStack') && content.includes('AddCard') && 
                 content.includes('OTPVerification');
        },
        expected: true
      }
    ];

    this.runTestSuite('Navigation Structure', tests);
  }

  async testCardAdditionFlow() {
    console.log('💳 Testing Card Addition Flow...');
    
    const tests = [
      {
        name: 'AddCardScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/cards/AddCardScreen.tsx'),
        expected: true
      },
      {
        name: 'OTPVerificationScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/cards/OTPVerificationScreen.tsx'),
        expected: true
      },
      {
        name: 'CardFeeConfirmationScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/cards/CardFeeConfirmationScreen.tsx'),
        expected: true
      },
      {
        name: 'CardAdditionSuccessScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/cards/CardAdditionSuccessScreen.tsx'),
        expected: true
      },
      {
        name: 'Card encryption is implemented',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/cards/AddCardScreen.tsx', 'utf8');
          return content.includes('CardEncryption') && content.includes('encryptCardData');
        },
        expected: true
      },
      {
        name: 'Card validation is implemented',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/cards/AddCardScreen.tsx', 'utf8');
          return content.includes('validateCardNumber') && content.includes('validateExpiryDate');
        },
        expected: true
      }
    ];

    this.runTestSuite('Card Addition Flow', tests);
  }

  async testSendMoneyFlow() {
    console.log('💰 Testing Send Money Flow...');
    
    const tests = [
      {
        name: 'SendMoneyScreen exists in main tabs',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/SendMoneyScreen.tsx'),
        expected: true
      },
      {
        name: 'SendMoneyFlowScreen exists in payment stack',
        test: () => fs.existsSync('./frontend-mobile/src/screens/payment/SendMoneyScreen.tsx'),
        expected: true
      },
      {
        name: 'PINVerificationScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/payment/PINVerificationScreen.tsx'),
        expected: true
      },
      {
        name: 'SendMoneyOTPScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/payment/SendMoneyOTPScreen.tsx'),
        expected: true
      },
      {
        name: 'TransferSuccessScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/payment/TransferSuccessScreen.tsx'),
        expected: true
      },
      {
        name: 'Send money form validation exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/payment/SendMoneyScreen.tsx', 'utf8');
          return content.includes('validateForm') && content.includes('recipientEmail');
        },
        expected: true
      }
    ];

    this.runTestSuite('Send Money Flow', tests);
  }

  async testBankAccountFeatures() {
    console.log('🏦 Testing Bank Account Features...');
    
    const tests = [
      {
        name: 'BankAccountsScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/settings/BankAccountsScreen.tsx'),
        expected: true
      },
      {
        name: 'Bank account verification is implemented',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/settings/BankAccountsScreen.tsx', 'utf8');
          return content.includes('handleVerifyAccount') && content.includes('accountNumber') && 
                 content.includes('bankCode');
        },
        expected: true
      },
      {
        name: 'Bank selection modal exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/settings/BankAccountsScreen.tsx', 'utf8');
          return content.includes('BankSelectionModal') && content.includes('showBankModal');
        },
        expected: true
      },
      {
        name: 'Account confirmation flow exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/settings/BankAccountsScreen.tsx', 'utf8');
          return content.includes('handleConfirmAccount') && content.includes('verificationData');
        },
        expected: true
      }
    ];

    this.runTestSuite('Bank Account Features', tests);
  }

  async testMainTabScreens() {
    console.log('📱 Testing Main Tab Screens...');
    
    const tests = [
      {
        name: 'HomeScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/HomeScreen.tsx'),
        expected: true
      },
      {
        name: 'CardsScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/CardsScreen.tsx'),
        expected: true
      },
      {
        name: 'SendMoneyScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/SendMoneyScreen.tsx'),
        expected: true
      },
      {
        name: 'TransactionsScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/TransactionsScreen.tsx'),
        expected: true
      },
      {
        name: 'AccountScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/main/AccountScreen.tsx'),
        expected: true
      },
      {
        name: 'All main screens have proper UI components',
        test: () => {
          const screens = ['HomeScreen', 'CardsScreen', 'SendMoneyScreen', 'TransactionsScreen', 'AccountScreen'];
          return screens.every(screen => {
            const content = fs.readFileSync(`./frontend-mobile/src/screens/main/${screen}.tsx`, 'utf8');
            return content.includes('SafeAreaView') && content.includes('ScrollView') && 
                   content.includes('TouchableOpacity');
          });
        },
        expected: true
      }
    ];

    this.runTestSuite('Main Tab Screens', tests);
  }

  async testSecurityImplementation() {
    console.log('🔒 Testing Security Implementation...');
    
    const tests = [
      {
        name: 'Server-side encryption service exists',
        test: () => fs.existsSync('./backend/src/services/ServerEncryptionService.ts'),
        expected: true
      },
      {
        name: 'Rate limiting middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/rateLimiting.ts'),
        expected: true
      },
      {
        name: 'Security headers middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/securityHeaders.ts'),
        expected: true
      },
      {
        name: 'Input sanitization exists',
        test: () => fs.existsSync('./backend/src/utils/InputSanitizer.ts'),
        expected: true
      },
      {
        name: 'Security logging exists',
        test: () => fs.existsSync('./backend/src/utils/SecurityLogger.ts'),
        expected: true
      },
      {
        name: 'Card encryption uses server-side approach',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/utils/cardEncryption.ts', 'utf8');
          return content.includes('fetch') && content.includes('/api/v1/encrypt/');
        },
        expected: true
      }
    ];

    this.runTestSuite('Security Implementation', tests);
  }

  runTestSuite(suiteName, tests) {
    console.log(`  Running ${tests.length} tests...`);
    
    tests.forEach(test => {
      try {
        const result = test.test();
        const passed = result === test.expected;
        
        if (passed) {
          console.log(`    ✅ ${test.name}`);
          this.passedTests++;
        } else {
          console.log(`    ❌ ${test.name} - Expected: ${test.expected}, Got: ${result}`);
          this.failedTests++;
        }
        
        this.testResults.push({
          suite: suiteName,
          test: test.name,
          passed,
          expected: test.expected,
          actual: result
        });
      } catch (error) {
        console.log(`    ❌ ${test.name} - Error: ${error.message}`);
        this.failedTests++;
        this.testResults.push({
          suite: suiteName,
          test: test.name,
          passed: false,
          error: error.message
        });
      }
    });
    
    console.log('');
  }

  generateTestReport() {
    console.log('='.repeat(60));
    console.log('🧪 MALPAY FEATURE IMPLEMENTATION TEST REPORT');
    console.log('='.repeat(60));
    
    const totalTests = this.passedTests + this.failedTests;
    const passRate = totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Test Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${this.passedTests}`);
    console.log(`  Failed: ${this.failedTests}`);
    console.log(`  Pass Rate: ${passRate}%`);
    
    if (this.failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.testResults
        .filter(result => !result.passed)
        .forEach(result => {
          console.log(`  • ${result.suite}: ${result.test}`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
        });
    }
    
    console.log(`\n🎯 Implementation Status:`);
    if (passRate >= 90) {
      console.log(`  🟢 EXCELLENT - Most features are implemented and working`);
    } else if (passRate >= 75) {
      console.log(`  🟡 GOOD - Most features are implemented with minor issues`);
    } else if (passRate >= 50) {
      console.log(`  🟠 FAIR - Some features are implemented but needs work`);
    } else {
      console.log(`  🔴 POOR - Many features are missing or not working`);
    }
    
    console.log(`\n📋 Next Steps:`);
    if (this.failedTests === 0) {
      console.log(`  ✅ All feature tests passed!`);
      console.log(`  🔧 Proceed with integration testing`);
      console.log(`  📊 Set up monitoring and analytics`);
    } else {
      console.log(`  🔧 Fix ${this.failedTests} failed test(s)`);
      console.log(`  🔄 Re-run tests after fixes`);
      console.log(`  📊 Review implementation gaps`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Feature implementation testing completed!');
    console.log('='.repeat(60));
  }
}

// Run the feature tests
if (require.main === module) {
  const tester = new FeatureTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FeatureTester;
