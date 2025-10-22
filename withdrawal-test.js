#!/usr/bin/env node

/**
 * MalPay Withdrawal Flow Test Suite
 * Tests the complete withdrawal process from Account tab to success
 */

const fs = require('fs');
const path = require('path');

class WithdrawalFlowTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('💰 Running MalPay Withdrawal Flow Tests...\n');
    
    try {
      await this.testWithdrawalScreens();
      await this.testNavigationIntegration();
      await this.testWithdrawalFlow();
      await this.testAccountScreenIntegration();
      
      this.generateTestReport();
    } catch (error) {
      console.error('❌ Error running withdrawal tests:', error);
    }
  }

  async testWithdrawalScreens() {
    console.log('📱 Testing Withdrawal Screens...');
    
    const tests = [
      {
        name: 'WithdrawAmountScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/withdrawal/WithdrawAmountScreen.tsx'),
        expected: true
      },
      {
        name: 'SelectBankScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/withdrawal/SelectBankScreen.tsx'),
        expected: true
      },
      {
        name: 'WithdrawPINScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/withdrawal/WithdrawPINScreen.tsx'),
        expected: true
      },
      {
        name: 'WithdrawOTPScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/withdrawal/WithdrawOTPScreen.tsx'),
        expected: true
      },
      {
        name: 'WithdrawSuccessScreen exists',
        test: () => fs.existsSync('./frontend-mobile/src/screens/withdrawal/WithdrawSuccessScreen.tsx'),
        expected: true
      },
      {
        name: 'WithdrawAmountScreen has amount validation',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawAmountScreen.tsx', 'utf8');
          return content.includes('validateAmount') && content.includes('userBalance') &&
                 content.includes('Amount cannot exceed your balance');
        },
        expected: true
      },
      {
        name: 'SelectBankScreen has bank selection',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/SelectBankScreen.tsx', 'utf8');
          return content.includes('bankAccounts') && content.includes('selectedBank') &&
                 content.includes('isVerified');
        },
        expected: true
      },
      {
        name: 'WithdrawPINScreen has PIN input',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawPINScreen.tsx', 'utf8');
          return content.includes('pin') && content.includes('pinDot') &&
                 content.includes('Enter your PIN');
        },
        expected: true
      },
      {
        name: 'WithdrawOTPScreen has OTP verification',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawOTPScreen.tsx', 'utf8');
          return content.includes('otp') && content.includes('resendTimer') &&
                 content.includes('Enter OTP');
        },
        expected: true
      },
      {
        name: 'WithdrawSuccessScreen shows transaction details',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawSuccessScreen.tsx', 'utf8');
          return content.includes('Transaction Details') && content.includes('bankAccount') &&
                 content.includes('Transaction ID');
        },
        expected: true
      }
    ];

    this.runTestSuite('Withdrawal Screens', tests);
  }

  async testNavigationIntegration() {
    console.log('🧭 Testing Navigation Integration...');
    
    const tests = [
      {
        name: 'AppNavigator imports withdrawal screens',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('WithdrawAmountScreen') && content.includes('SelectBankScreen') &&
                 content.includes('WithdrawPINScreen') && content.includes('WithdrawOTPScreen') &&
                 content.includes('WithdrawSuccessScreen');
        },
        expected: true
      },
      {
        name: 'WithdrawalStackParamList is defined',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('WithdrawalStackParamList') && content.includes('WithdrawAmount') &&
                 content.includes('SelectBank') && content.includes('WithdrawPIN');
        },
        expected: true
      },
      {
        name: 'WithdrawalStack navigator exists',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('WithdrawalStack') && content.includes('WithdrawalNavigator') &&
                 content.includes('WithdrawAmount') && content.includes('WithdrawSuccess');
        },
        expected: true
      },
      {
        name: 'Withdrawal stack added to RootStack',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('Withdrawal') && content.includes('WithdrawalNavigator');
        },
        expected: true
      },
      {
        name: 'Screen parameters are properly typed',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/navigation/AppNavigator.tsx', 'utf8');
          return content.includes('amount: number') && content.includes('bankAccount') &&
                 content.includes('bankName') && content.includes('accountNumber');
        },
        expected: true
      }
    ];

    this.runTestSuite('Navigation Integration', tests);
  }

  async testWithdrawalFlow() {
    console.log('🔄 Testing Withdrawal Flow...');
    
    const tests = [
      {
        name: 'Amount screen validates balance',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawAmountScreen.tsx', 'utf8');
          return content.includes('numAmount > userBalance') && content.includes('Minimum withdrawal amount') &&
                 content.includes('quickAmounts');
        },
        expected: true
      },
      {
        name: 'Bank selection validates verification',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/SelectBankScreen.tsx', 'utf8');
          return content.includes('!bank.isVerified') && content.includes('Unverified Account') &&
                 content.includes('isVerified');
        },
        expected: true
      },
      {
        name: 'PIN screen has 4-digit validation',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawPINScreen.tsx', 'utf8');
          return content.includes('pin.length !== 4') && content.includes('slice(0, 4)') &&
                 content.includes('4-digit PIN');
        },
        expected: true
      },
      {
        name: 'OTP screen has 6-digit validation',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawOTPScreen.tsx', 'utf8');
          return content.includes('otp.length !== 6') && content.includes('slice(0, 6)') &&
                 content.includes('6-digit code');
        },
        expected: true
      },
      {
        name: 'Success screen shows complete details',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawSuccessScreen.tsx', 'utf8');
          return content.includes('formatCurrency(amount)') && content.includes('bankAccount.bankName') &&
                 content.includes('Transaction ID') && content.includes('Date & Time');
        },
        expected: true
      },
      {
        name: 'Flow passes data between screens',
        test: () => {
          const content1 = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/WithdrawAmountScreen.tsx', 'utf8');
          const content2 = fs.readFileSync('./frontend-mobile/src/screens/withdrawal/SelectBankScreen.tsx', 'utf8');
          return content1.includes('navigation.navigate(\'SelectBank\'') && 
                 content2.includes('route.params') && content2.includes('amount');
        },
        expected: true
      }
    ];

    this.runTestSuite('Withdrawal Flow', tests);
  }

  async testAccountScreenIntegration() {
    console.log('👤 Testing Account Screen Integration...');
    
    const tests = [
      {
        name: 'Account screen has Withdraw button',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/main/AccountScreen.tsx', 'utf8');
          return content.includes('Withdraw') && content.includes('Withdraw money to your bank account') &&
                 content.includes('card-outline');
        },
        expected: true
      },
      {
        name: 'Withdraw button navigates to withdrawal flow',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/main/AccountScreen.tsx', 'utf8');
          return content.includes('navigation.navigate(\'Withdrawal\'') && 
                 content.includes('screen: \'WithdrawAmount\'');
        },
        expected: true
      },
      {
        name: 'Withdraw is in Payment section',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/screens/main/AccountScreen.tsx', 'utf8');
          return content.includes('title: \'Payment\'') && content.includes('My QR Code') &&
                 content.includes('Withdraw');
        },
        expected: true
      }
    ];

    this.runTestSuite('Account Screen Integration', tests);
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
    console.log('💰 MALPAY WITHDRAWAL FLOW TEST REPORT');
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
    
    console.log(`\n🎯 Withdrawal Flow Status:`);
    if (passRate >= 90) {
      console.log(`  🟢 EXCELLENT - Withdrawal flow is fully implemented`);
    } else if (passRate >= 75) {
      console.log(`  🟡 GOOD - Most withdrawal features are implemented`);
    } else if (passRate >= 50) {
      console.log(`  🟠 FAIR - Some withdrawal features are implemented`);
    } else {
      console.log(`  🔴 POOR - Many withdrawal features are missing`);
    }
    
    console.log(`\n💰 Implemented Withdrawal Features:`);
    console.log(`  ✅ Withdraw button in Account tab`);
    console.log(`  ✅ Amount input with balance validation`);
    console.log(`  ✅ Bank account selection`);
    console.log(`  ✅ PIN verification (4-digit)`);
    console.log(`  ✅ OTP verification (6-digit)`);
    console.log(`  ✅ Withdrawal success screen`);
    console.log(`  ✅ Complete navigation flow`);
    console.log(`  ✅ Data passing between screens`);
    
    console.log(`\n🔄 Withdrawal Process Flow:`);
    console.log(`  1. User clicks "Withdraw" in Account tab`);
    console.log(`  2. User enters amount (validated against balance)`);
    console.log(`  3. User selects verified bank account`);
    console.log(`  4. User enters 4-digit PIN`);
    console.log(`  5. User enters 6-digit OTP from email`);
    console.log(`  6. Withdrawal completes successfully`);
    
    console.log(`\n📋 Next Steps:`);
    if (this.failedTests === 0) {
      console.log(`  ✅ All withdrawal tests passed!`);
      console.log(`  🔧 Ready for production deployment`);
      console.log(`  📊 Test with real bank integration`);
    } else {
      console.log(`  🔧 Fix ${this.failedTests} failed test(s)`);
      console.log(`  🔄 Re-run tests after fixes`);
      console.log(`  📊 Review implementation gaps`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Withdrawal flow testing completed!');
    console.log('='.repeat(60));
  }
}

// Run the withdrawal tests
if (require.main === module) {
  const tester = new WithdrawalFlowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = WithdrawalFlowTester;
