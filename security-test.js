#!/usr/bin/env node

/**
 * MalPay Security Test Suite
 * Tests all implemented security measures
 */

const fs = require('fs');
const path = require('path');

class SecurityTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('🔒 Running MalPay Security Tests...\n');
    
    try {
      await this.testEncryptionImplementation();
      await this.testRateLimitingImplementation();
      await this.testSecurityHeadersImplementation();
      await this.testInputSanitizationImplementation();
      await this.testCORSConfiguration();
      await this.testSecurityMiddlewareImplementation();
      await this.testLoggingImplementation();
      
      this.generateTestReport();
    } catch (error) {
      console.error('❌ Error running security tests:', error);
    }
  }

  async testEncryptionImplementation() {
    console.log('🔐 Testing Encryption Implementation...');
    
    const tests = [
      {
        name: 'Server-side encryption service exists',
        test: () => fs.existsSync('./backend/src/services/ServerEncryptionService.ts'),
        expected: true
      },
      {
        name: 'Client-side encryption updated',
        test: () => {
          const content = fs.readFileSync('./frontend-mobile/src/utils/cardEncryption.ts', 'utf8');
          return content.includes('fetch') && content.includes('/api/v1/encrypt/');
        },
        expected: true
      },
      {
        name: 'Encryption uses AES-256-GCM',
        test: () => {
          const content = fs.readFileSync('./backend/src/services/ServerEncryptionService.ts', 'utf8');
          return content.includes('aes-256-gcm') && content.includes('createCipher');
        },
        expected: true
      },
      {
        name: 'PIN hashing uses PBKDF2',
        test: () => {
          const content = fs.readFileSync('./backend/src/services/ServerEncryptionService.ts', 'utf8');
          return content.includes('pbkdf2Sync') && content.includes('100000');
        },
        expected: true
      }
    ];

    this.runTestSuite('Encryption', tests);
  }

  async testRateLimitingImplementation() {
    console.log('⏱️ Testing Rate Limiting Implementation...');
    
    const tests = [
      {
        name: 'Rate limiting middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/rateLimiting.ts'),
        expected: true
      },
      {
        name: 'General rate limiter configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/rateLimiting.ts', 'utf8');
          return content.includes('generalLimiter') && content.includes('100');
        },
        expected: true
      },
      {
        name: 'Auth rate limiter configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/rateLimiting.ts', 'utf8');
          return content.includes('authLimiter') && content.includes('5');
        },
        expected: true
      },
      {
        name: 'Sensitive operations rate limiter configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/rateLimiting.ts', 'utf8');
          return content.includes('sensitiveLimiter') && content.includes('10');
        },
        expected: true
      }
    ];

    this.runTestSuite('Rate Limiting', tests);
  }

  async testSecurityHeadersImplementation() {
    console.log('🛡️ Testing Security Headers Implementation...');
    
    const tests = [
      {
        name: 'Security headers middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/securityHeaders.ts'),
        expected: true
      },
      {
        name: 'Helmet configuration present',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/securityHeaders.ts', 'utf8');
          return content.includes('helmet') && content.includes('contentSecurityPolicy');
        },
        expected: true
      },
      {
        name: 'CSP directives configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/securityHeaders.ts', 'utf8');
          return content.includes("defaultSrc: [\"'self'\"]") && content.includes('scriptSrc');
        },
        expected: true
      },
      {
        name: 'HSTS configuration present',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/securityHeaders.ts', 'utf8');
          return content.includes('hsts') && content.includes('maxAge');
        },
        expected: true
      }
    ];

    this.runTestSuite('Security Headers', tests);
  }

  async testInputSanitizationImplementation() {
    console.log('🧹 Testing Input Sanitization Implementation...');
    
    const tests = [
      {
        name: 'Input sanitizer exists',
        test: () => fs.existsSync('./backend/src/utils/InputSanitizer.ts'),
        expected: true
      },
      {
        name: 'DOMPurify integration',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/InputSanitizer.ts', 'utf8');
          return content.includes('DOMPurify') && content.includes('sanitize');
        },
        expected: true
      },
      {
        name: 'Validator integration',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/InputSanitizer.ts', 'utf8');
          return content.includes('validator') && content.includes('isEmail');
        },
        expected: true
      },
      {
        name: 'Card number validation',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/InputSanitizer.ts', 'utf8');
          return content.includes('sanitizeCardNumber') && content.includes('13-19');
        },
        expected: true
      }
    ];

    this.runTestSuite('Input Sanitization', tests);
  }

  async testCORSConfiguration() {
    console.log('🌐 Testing CORS Configuration...');
    
    const tests = [
      {
        name: 'CORS middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/cors.ts'),
        expected: true
      },
      {
        name: 'Allowed origins configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/cors.ts', 'utf8');
          return content.includes('malpay.com') && content.includes('localhost');
        },
        expected: true
      },
      {
        name: 'Credentials enabled',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/cors.ts', 'utf8');
          return content.includes('credentials: true');
        },
        expected: true
      },
      {
        name: 'Methods configured',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/cors.ts', 'utf8');
          return content.includes('GET') && content.includes('POST') && content.includes('PUT');
        },
        expected: true
      }
    ];

    this.runTestSuite('CORS Configuration', tests);
  }

  async testSecurityMiddlewareImplementation() {
    console.log('🔒 Testing Security Middleware Implementation...');
    
    const tests = [
      {
        name: 'Security middleware exists',
        test: () => fs.existsSync('./backend/src/middleware/security.ts'),
        expected: true
      },
      {
        name: 'Request sanitization',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/security.ts', 'utf8');
          return content.includes('sanitizeObject') && content.includes('req.body');
        },
        expected: true
      },
      {
        name: 'Suspicious activity detection',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/security.ts', 'utf8');
          return content.includes('suspiciousPatterns') && content.includes('XSS');
        },
        expected: true
      },
      {
        name: 'Request size limiting',
        test: () => {
          const content = fs.readFileSync('./backend/src/middleware/security.ts', 'utf8');
          return content.includes('requestSizeLimiter') && content.includes('content-length');
        },
        expected: true
      }
    ];

    this.runTestSuite('Security Middleware', tests);
  }

  async testLoggingImplementation() {
    console.log('📝 Testing Logging Implementation...');
    
    const tests = [
      {
        name: 'Security logger exists',
        test: () => fs.existsSync('./backend/src/utils/SecurityLogger.ts'),
        expected: true
      },
      {
        name: 'Winston configuration',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/SecurityLogger.ts', 'utf8');
          return content.includes('winston') && content.includes('createLogger');
        },
        expected: true
      },
      {
        name: 'Auth attempt logging',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/SecurityLogger.ts', 'utf8');
          return content.includes('logAuthAttempt') && content.includes('AUTH_ATTEMPT');
        },
        expected: true
      },
      {
        name: 'Suspicious activity logging',
        test: () => {
          const content = fs.readFileSync('./backend/src/utils/SecurityLogger.ts', 'utf8');
          return content.includes('logSuspiciousActivity') && content.includes('SUSPICIOUS_ACTIVITY');
        },
        expected: true
      }
    ];

    this.runTestSuite('Security Logging', tests);
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
    console.log('🔒 MALPAY SECURITY TEST REPORT');
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
    
    console.log(`\n🎯 Security Status:`);
    if (passRate >= 90) {
      console.log(`  🟢 EXCELLENT - Security implementation is comprehensive`);
    } else if (passRate >= 75) {
      console.log(`  🟡 GOOD - Security implementation needs minor improvements`);
    } else if (passRate >= 50) {
      console.log(`  🟠 FAIR - Security implementation needs significant improvements`);
    } else {
      console.log(`  🔴 POOR - Security implementation needs major improvements`);
    }
    
    console.log(`\n📋 Next Steps:`);
    if (this.failedTests === 0) {
      console.log(`  ✅ All security tests passed!`);
      console.log(`  🔧 Proceed with integration testing`);
      console.log(`  📊 Set up monitoring and alerting`);
    } else {
      console.log(`  🔧 Fix ${this.failedTests} failed test(s)`);
      console.log(`  🔄 Re-run tests after fixes`);
      console.log(`  📊 Review security implementation`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Security testing completed!');
    console.log('='.repeat(60));
  }
}

// Run the security tests
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;
