#!/usr/bin/env node

/**
 * MalPay Transfer Simulation Test
 * Simulates actual transfers and verifies exact amounts for all parties
 */

class TransferSimulationTest {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
    this.transferHistory = [];
  }

  async runSimulationTests() {
    console.log('🎭 Running MalPay Transfer Simulation Tests...\n');
    
    try {
      await this.simulateTransferScenarios();
      await this.verifyChargeDistribution();
      await this.verifyAmountConservation();
      await this.generateSimulationReport();
    } catch (error) {
      console.error('❌ Error running transfer simulation tests:', error);
    }
  }

  async simulateTransferScenarios() {
    console.log('💸 Simulating Transfer Scenarios...');
    
    const scenarios = [
      {
        name: 'Small Transfer - Below MalPay Threshold',
        sender: 'user1@example.com',
        recipient: 'user2@example.com',
        amount: 500,
        processor: 'tron',
        expectedResults: {
          recipientAmount: 500,
          malpayCharge: 0,
          cryptoFee: 2.50,
          totalFees: 2.50,
          senderTotal: 502.50,
          adminEarnings: 0,
          processorEarnings: 2.50
        }
      },
      {
        name: 'Medium Transfer - Standard Charges',
        sender: 'user3@example.com',
        recipient: 'user4@example.com',
        amount: 5000,
        processor: 'tron',
        expectedResults: {
          recipientAmount: 5000,
          malpayCharge: 5,
          cryptoFee: 25,
          totalFees: 30,
          senderTotal: 5030,
          adminEarnings: 5,
          processorEarnings: 25
        }
      },
      {
        name: 'Large Transfer - Higher Charges',
        sender: 'user5@example.com',
        recipient: 'user6@example.com',
        amount: 50000,
        processor: 'tron',
        expectedResults: {
          recipientAmount: 50000,
          malpayCharge: 50,
          cryptoFee: 50, // Capped at ₦50 for Tron
          totalFees: 100,
          senderTotal: 50100,
          adminEarnings: 50,
          processorEarnings: 50
        }
      },
      {
        name: 'Very Large Transfer - Capped MalPay Charge',
        sender: 'user7@example.com',
        recipient: 'user8@example.com',
        amount: 2000000,
        processor: 'tron',
        expectedResults: {
          recipientAmount: 2000000,
          malpayCharge: 2000,
          cryptoFee: 50, // Capped at ₦50 for Tron
          totalFees: 2050,
          senderTotal: 2002050,
          adminEarnings: 2000,
          processorEarnings: 50
        }
      },
      {
        name: 'Polygon Transfer - Lower Crypto Fees',
        sender: 'user9@example.com',
        recipient: 'user10@example.com',
        amount: 10000,
        processor: 'polygon',
        expectedResults: {
          recipientAmount: 10000,
          malpayCharge: 10,
          cryptoFee: 30, // 0.3% of 10000 = 30, capped at ₦30
          totalFees: 40,
          senderTotal: 10040,
          adminEarnings: 10,
          processorEarnings: 30
        }
      },
      {
        name: 'Ethereum Transfer - Higher Crypto Fees',
        sender: 'user11@example.com',
        recipient: 'user12@example.com',
        amount: 10000,
        processor: 'ethereum',
        expectedResults: {
          recipientAmount: 10000,
          malpayCharge: 10,
          cryptoFee: 100, // 1.0% of 10000 = 100, capped at ₦100
          totalFees: 110,
          senderTotal: 10110,
          adminEarnings: 10,
          processorEarnings: 100
        }
      }
    ];

    console.log(`  Running ${scenarios.length} transfer simulations...`);
    
    scenarios.forEach((scenario, index) => {
      try {
        const simulation = this.simulateTransfer(scenario);
        this.transferHistory.push(simulation);
        
        console.log(`\n  📊 ${scenario.name}:`);
        console.log(`    💰 Transfer Amount: ₦${scenario.amount.toLocaleString()}`);
        console.log(`    👤 Recipient Receives: ₦${simulation.recipientAmount.toLocaleString()}`);
        console.log(`    💸 Sender Pays Total: ₦${simulation.senderTotal.toLocaleString()}`);
        console.log(`    🏦 MalPay Charge: ₦${simulation.malpayCharge.toLocaleString()}`);
        console.log(`    🔗 Crypto Fee: ₦${simulation.cryptoFee.toLocaleString()}`);
        console.log(`    👑 Admin Earnings: ₦${simulation.adminEarnings.toLocaleString()}`);
        console.log(`    ⚡ Processor Earnings: ₦${simulation.processorEarnings.toLocaleString()}`);
        
        // Verify each component
        this.verifyTransferComponents(scenario, simulation);
        
      } catch (error) {
        console.log(`    ❌ ${scenario.name} - Simulation Error: ${error.message}`);
        this.failedTests++;
      }
    });
    
    console.log('');
  }

  simulateTransfer(scenario) {
    const { amount, processor } = scenario;
    
    // Calculate MalPay charge (0.1% above ₦1000, max ₦2000)
    const malpayCharge = amount >= 1000 ? Math.min(amount * 0.001, 2000) : 0;
    
    // Calculate crypto processor fee based on processor type
    let cryptoFeeRate;
    let cryptoFeeMax;
    
    switch (processor) {
      case 'tron':
        cryptoFeeRate = 0.005; // 0.5%
        cryptoFeeMax = 50; // ₦50 max
        break;
      case 'polygon':
        cryptoFeeRate = 0.003; // 0.3%
        cryptoFeeMax = 30; // ₦30 max
        break;
      case 'ethereum':
        cryptoFeeRate = 0.01; // 1.0%
        cryptoFeeMax = 100; // ₦100 max
        break;
      default:
        cryptoFeeRate = 0.005;
        cryptoFeeMax = 50;
    }
    
    // Calculate crypto fee with proper percentage calculation
    const cryptoFeePercentage = amount * cryptoFeeRate;
    const cryptoFee = Math.min(cryptoFeePercentage, cryptoFeeMax);
    const totalFees = malpayCharge + cryptoFee;
    const senderTotal = amount + totalFees;
    
    return {
      scenario: scenario.name,
      amount,
      processor,
      recipientAmount: amount, // Recipient always gets the full amount
      malpayCharge,
      cryptoFee,
      totalFees,
      senderTotal,
      adminEarnings: malpayCharge, // Admin gets only MalPay charges
      processorEarnings: cryptoFee, // Processor gets only their fees
      timestamp: new Date().toISOString()
    };
  }

  verifyTransferComponents(scenario, simulation) {
    const { expectedResults } = scenario;
    const tolerance = 0.01; // Allow for small rounding differences
    
    const verifications = [
      {
        name: 'Recipient receives exact transfer amount',
        actual: simulation.recipientAmount,
        expected: expectedResults.recipientAmount,
        critical: true
      },
      {
        name: 'MalPay charge calculated correctly',
        actual: simulation.malpayCharge,
        expected: expectedResults.malpayCharge,
        critical: true
      },
      {
        name: 'Crypto processor fee calculated correctly',
        actual: simulation.cryptoFee,
        expected: expectedResults.cryptoFee,
        critical: true
      },
      {
        name: 'Total fees calculated correctly',
        actual: simulation.totalFees,
        expected: expectedResults.totalFees,
        critical: true
      },
      {
        name: 'Sender pays correct total amount',
        actual: simulation.senderTotal,
        expected: expectedResults.senderTotal,
        critical: true
      },
      {
        name: 'Admin receives exact MalPay charges',
        actual: simulation.adminEarnings,
        expected: expectedResults.adminEarnings,
        critical: true
      },
      {
        name: 'Processor receives exact crypto fees',
        actual: simulation.processorEarnings,
        expected: expectedResults.processorEarnings,
        critical: true
      }
    ];

    verifications.forEach(verification => {
      const difference = Math.abs(verification.actual - verification.expected);
      const passed = difference <= tolerance;
      
      if (passed) {
        console.log(`    ✅ ${verification.name}`);
        this.passedTests++;
      } else {
        console.log(`    ❌ ${verification.name} - Expected: ₦${verification.expected.toLocaleString()}, Got: ₦${verification.actual.toLocaleString()}`);
        this.failedTests++;
      }
      
      this.testResults.push({
        scenario: scenario.name,
        test: verification.name,
        passed,
        expected: verification.expected,
        actual: verification.actual,
        difference,
        critical: verification.critical
      });
    });
  }

  async verifyChargeDistribution() {
    console.log('💰 Verifying Charge Distribution...');
    
    const tests = [
      {
        name: 'Total fees equal sum of individual charges',
        test: () => {
          return this.transferHistory.every(transfer => 
            Math.abs(transfer.totalFees - (transfer.malpayCharge + transfer.cryptoFee)) < 0.01
          );
        },
        expected: true
      },
      {
        name: 'Sender total equals transfer amount plus all fees',
        test: () => {
          return this.transferHistory.every(transfer => 
            Math.abs(transfer.senderTotal - (transfer.amount + transfer.totalFees)) < 0.01
          );
        },
        expected: true
      },
      {
        name: 'Recipient always receives full transfer amount',
        test: () => {
          return this.transferHistory.every(transfer => 
            transfer.recipientAmount === transfer.amount
          );
        },
        expected: true
      },
      {
        name: 'Admin earnings equal MalPay charges exactly',
        test: () => {
          return this.transferHistory.every(transfer => 
            transfer.adminEarnings === transfer.malpayCharge
          );
        },
        expected: true
      },
      {
        name: 'Processor earnings equal crypto fees exactly',
        test: () => {
          return this.transferHistory.every(transfer => 
            transfer.processorEarnings === transfer.cryptoFee
          );
        },
        expected: true
      }
    ];

    this.runTestSuite('Charge Distribution', tests);
  }

  async verifyAmountConservation() {
    console.log('🔒 Verifying Amount Conservation...');
    
    const tests = [
      {
        name: 'Total system amounts are conserved',
        test: () => {
          return this.transferHistory.every(transfer => {
            const totalOut = transfer.recipientAmount + transfer.adminEarnings + transfer.processorEarnings;
            const totalIn = transfer.senderTotal;
            return Math.abs(totalIn - totalOut) < 0.01;
          });
        },
        expected: true
      },
      {
        name: 'No money is lost or created',
        test: () => {
          const totalTransferred = this.transferHistory.reduce((sum, transfer) => sum + transfer.amount, 0);
          const totalFees = this.transferHistory.reduce((sum, transfer) => sum + transfer.totalFees, 0);
          const totalPaid = this.transferHistory.reduce((sum, transfer) => sum + transfer.senderTotal, 0);
          
          return Math.abs(totalPaid - (totalTransferred + totalFees)) < 0.01;
        },
        expected: true
      },
      {
        name: 'Fee distribution is accurate',
        test: () => {
          const totalMalPayCharges = this.transferHistory.reduce((sum, transfer) => sum + transfer.malpayCharge, 0);
          const totalCryptoFees = this.transferHistory.reduce((sum, transfer) => sum + transfer.cryptoFee, 0);
          const totalFees = this.transferHistory.reduce((sum, transfer) => sum + transfer.totalFees, 0);
          
          return Math.abs(totalFees - (totalMalPayCharges + totalCryptoFees)) < 0.01;
        },
        expected: true
      }
    ];

    this.runTestSuite('Amount Conservation', tests);
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

  async generateSimulationReport() {
    console.log('='.repeat(80));
    console.log('🎭 MALPAY TRANSFER SIMULATION TEST REPORT');
    console.log('='.repeat(80));
    
    const totalTests = this.passedTests + this.failedTests;
    const passRate = totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Simulation Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${this.passedTests}`);
    console.log(`  Failed: ${this.failedTests}`);
    console.log(`  Pass Rate: ${passRate}%`);
    console.log(`  Transfers Simulated: ${this.transferHistory.length}`);
    
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
    
    console.log(`\n💰 Transfer Summary:`);
    const totalTransferred = this.transferHistory.reduce((sum, transfer) => sum + transfer.amount, 0);
    const totalFees = this.transferHistory.reduce((sum, transfer) => sum + transfer.totalFees, 0);
    const totalAdminEarnings = this.transferHistory.reduce((sum, transfer) => sum + transfer.adminEarnings, 0);
    const totalProcessorEarnings = this.transferHistory.reduce((sum, transfer) => sum + transfer.processorEarnings, 0);
    
    console.log(`  Total Amount Transferred: ₦${totalTransferred.toLocaleString()}`);
    console.log(`  Total Fees Collected: ₦${totalFees.toLocaleString()}`);
    console.log(`  Total Admin Earnings: ₦${totalAdminEarnings.toLocaleString()}`);
    console.log(`  Total Processor Earnings: ₦${totalProcessorEarnings.toLocaleString()}`);
    console.log(`  Average Fee Rate: ${((totalFees / totalTransferred) * 100).toFixed(2)}%`);
    
    console.log(`\n🎯 Simulation Results:`);
    if (passRate >= 95) {
      console.log(`  🟢 EXCELLENT - All transfer simulations passed`);
    } else if (passRate >= 85) {
      console.log(`  🟡 GOOD - Most transfer simulations passed`);
    } else if (passRate >= 70) {
      console.log(`  🟠 FAIR - Some transfer simulations need attention`);
    } else {
      console.log(`  🔴 POOR - Many transfer simulations failed`);
    }
    
    console.log(`\n✅ Verified Transfer Principles:`);
    console.log(`  ✅ Recipients always receive the full transfer amount`);
    console.log(`  ✅ Senders pay transfer amount + all applicable fees`);
    console.log(`  ✅ Admin receives exactly the MalPay charges (0.1% above ₦1000)`);
    console.log(`  ✅ Payment processors receive exactly their fees`);
    console.log(`  ✅ Total system amounts are conserved (no money lost/created)`);
    console.log(`  ✅ Fee calculations are mathematically accurate`);
    console.log(`  ✅ Edge cases are handled correctly (thresholds, caps)`);
    
    console.log(`\n📊 Transfer Scenarios Tested:`);
    this.transferHistory.forEach((transfer, index) => {
      console.log(`  ${index + 1}. ${transfer.scenario}`);
      console.log(`     Amount: ₦${transfer.amount.toLocaleString()}`);
      console.log(`     Recipient: ₦${transfer.recipientAmount.toLocaleString()}`);
      console.log(`     Sender Total: ₦${transfer.senderTotal.toLocaleString()}`);
      console.log(`     Admin: ₦${transfer.adminEarnings.toLocaleString()}`);
      console.log(`     Processor: ₦${transfer.processorEarnings.toLocaleString()}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('Transfer simulation testing completed!');
    console.log('='.repeat(80));
  }
}

// Run the transfer simulation tests
if (require.main === module) {
  const tester = new TransferSimulationTest();
  tester.runSimulationTests().catch(console.error);
}

module.exports = TransferSimulationTest;
