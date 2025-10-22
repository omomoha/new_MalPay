#!/usr/bin/env node

/**
 * MalPay Security Vulnerability Assessment
 * Comprehensive security audit for the MalPay application
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.warnings = [];
    this.recommendations = [];
    this.scannedFiles = 0;
    this.issuesFound = 0;
  }

  // OWASP Top 10 2021 vulnerabilities to check for
  owaspTop10Checks = {
    'A01:2021 – Broken Access Control': this.checkBrokenAccessControl.bind(this),
    'A02:2021 – Cryptographic Failures': this.checkCryptographicFailures.bind(this),
    'A03:2021 – Injection': this.checkInjection.bind(this),
    'A04:2021 – Insecure Design': this.checkInsecureDesign.bind(this),
    'A05:2021 – Security Misconfiguration': this.checkSecurityMisconfiguration.bind(this),
    'A06:2021 – Vulnerable and Outdated Components': this.checkVulnerableComponents.bind(this),
    'A07:2021 – Identification and Authentication Failures': this.checkAuthFailures.bind(this),
    'A08:2021 – Software and Data Integrity Failures': this.checkIntegrityFailures.bind(this),
    'A09:2021 – Security Logging and Monitoring Failures': this.checkLoggingFailures.bind(this),
    'A10:2021 – Server-Side Request Forgery (SSRF)': this.checkSSRF.bind(this),
  };

  async runAudit() {
    console.log('🔍 Starting MalPay Security Vulnerability Assessment...\n');
    
    // Scan frontend mobile
    await this.scanDirectory('./frontend-mobile/src', 'Frontend Mobile');
    
    // Scan backend
    await this.scanDirectory('./backend/src', 'Backend');
    
    // Run OWASP Top 10 checks
    await this.runOWASPChecks();
    
    // Check dependencies
    await this.checkDependencies();
    
    // Generate report
    this.generateReport();
  }

  async scanDirectory(dirPath, context) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory ${dirPath} not found, skipping...`);
      return;
    }

    console.log(`📁 Scanning ${context}...`);
    await this.scanFiles(dirPath, context);
  }

  async scanFiles(dirPath, context) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.scanFiles(filePath, context);
      } else if (this.isCodeFile(file)) {
        await this.scanFile(filePath, context);
      }
    }
  }

  isCodeFile(fileName) {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    return codeExtensions.some(ext => fileName.endsWith(ext));
  }

  async scanFile(filePath, context) {
    this.scannedFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check for common security issues
    this.checkHardcodedSecrets(filePath, content, context);
    this.checkSQLInjection(filePath, content, context);
    this.checkXSSVulnerabilities(filePath, content, context);
    this.checkInsecureCrypto(filePath, content, context);
    this.checkInsecureStorage(filePath, content, context);
    this.checkInsecureNetwork(filePath, content, context);
    this.checkInputValidation(filePath, content, context);
    this.checkErrorHandling(filePath, content, context);
    this.checkAuthenticationIssues(filePath, content, context);
    this.checkAuthorizationIssues(filePath, content, context);
  }

  checkHardcodedSecrets(filePath, content, context) {
    const secretPatterns = [
      /password\s*=\s*["'][^"']+["']/gi,
      /secret\s*=\s*["'][^"']+["']/gi,
      /key\s*=\s*["'][^"']+["']/gi,
      /token\s*=\s*["'][^"']+["']/gi,
      /api[_-]?key\s*=\s*["'][^"']+["']/gi,
      /private[_-]?key\s*=\s*["'][^"']+["']/gi,
      /secret[_-]?key\s*=\s*["'][^"']+["']/gi,
    ];

    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A02:2021 – Cryptographic Failures', 
            `Hardcoded secret found in ${filePath}: ${match}`, 
            'HIGH', 
            'Remove hardcoded secrets and use environment variables or secure key management');
        });
      }
    });
  }

  checkSQLInjection(filePath, content, context) {
    const sqlPatterns = [
      /query\s*\(\s*["'][^"']*\$[^"']*["']/gi,
      /execute\s*\(\s*["'][^"']*\+[^"']*["']/gi,
      /\.query\s*\(\s*[^)]*\+/gi,
    ];

    sqlPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A03:2021 – Injection',
            `Potential SQL injection in ${filePath}: ${match}`,
            'HIGH',
            'Use parameterized queries or prepared statements');
        });
      }
    });
  }

  checkXSSVulnerabilities(filePath, content, context) {
    const xssPatterns = [
      /dangerouslySetInnerHTML/gi,
      /innerHTML\s*=/gi,
      /document\.write/gi,
      /eval\s*\(/gi,
    ];

    xssPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A03:2021 – Injection',
            `Potential XSS vulnerability in ${filePath}: ${match}`,
            'MEDIUM',
            'Sanitize user input and avoid dangerous DOM manipulation');
        });
      }
    });
  }

  checkInsecureCrypto(filePath, content, context) {
    const insecureCryptoPatterns = [
      /MD5/gi,
      /SHA1/gi,
      /DES/gi,
      /RC4/gi,
      /crypto\.createHash\s*\(\s*["']md5["']/gi,
      /crypto\.createHash\s*\(\s*["']sha1["']/gi,
    ];

    insecureCryptoPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A02:2021 – Cryptographic Failures',
            `Insecure cryptographic algorithm in ${filePath}: ${match}`,
            'HIGH',
            'Use secure cryptographic algorithms like SHA-256, AES-256');
        });
      }
    });
  }

  checkInsecureStorage(filePath, content, context) {
    const insecureStoragePatterns = [
      /localStorage\.setItem/gi,
      /sessionStorage\.setItem/gi,
      /AsyncStorage\.setItem/gi,
      /SharedPreferences/gi,
    ];

    insecureStoragePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A02:2021 – Cryptographic Failures',
            `Insecure storage usage in ${filePath}: ${match}`,
            'MEDIUM',
            'Use encrypted storage for sensitive data');
        });
      }
    });
  }

  checkInsecureNetwork(filePath, content, context) {
    const insecureNetworkPatterns = [
      /http:\/\//gi,
      /allowArbitraryLoads/gi,
      /NSAllowsArbitraryLoads/gi,
    ];

    insecureNetworkPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A05:2021 – Security Misconfiguration',
            `Insecure network configuration in ${filePath}: ${match}`,
            'MEDIUM',
            'Use HTTPS for all network communications');
        });
      }
    });
  }

  checkInputValidation(filePath, content, context) {
    const validationPatterns = [
      /\.length\s*>\s*\d+/gi,
      /if\s*\(\s*[^)]*\.length/gi,
    ];

    // Check for missing input validation
    const hasValidation = content.includes('validate') || content.includes('validation') || content.includes('sanitize');
    const hasUserInput = content.includes('input') || content.includes('form') || content.includes('user');
    
    if (hasUserInput && !hasValidation) {
      this.addWarning('A03:2021 – Injection',
        `Potential missing input validation in ${filePath}`,
        'MEDIUM',
        'Implement proper input validation and sanitization');
    }
  }

  checkErrorHandling(filePath, content, context) {
    const errorPatterns = [
      /catch\s*\(\s*\)\s*\{\s*\}/gi,
      /catch\s*\(\s*[^)]*\)\s*\{\s*console\.log/gi,
    ];

    errorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addWarning('A09:2021 – Security Logging and Monitoring Failures',
            `Poor error handling in ${filePath}: ${match}`,
            'LOW',
            'Implement proper error handling and logging');
        });
      }
    });
  }

  checkAuthenticationIssues(filePath, content, context) {
    const authPatterns = [
      /password\s*=\s*["'][^"']{1,7}["']/gi, // Weak passwords
      /token\s*:\s*["'][^"']{1,15}["']/gi, // Short tokens
    ];

    authPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addVulnerability('A07:2021 – Identification and Authentication Failures',
            `Weak authentication in ${filePath}: ${match}`,
            'MEDIUM',
            'Use strong passwords and secure tokens');
        });
      }
    });
  }

  checkAuthorizationIssues(filePath, content, context) {
    const authzPatterns = [
      /if\s*\(\s*user\.role\s*===\s*["']admin["']/gi,
      /if\s*\(\s*user\.isAdmin/gi,
    ];

    authzPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addWarning('A01:2021 – Broken Access Control',
            `Potential authorization bypass in ${filePath}: ${match}`,
            'MEDIUM',
            'Implement proper role-based access control');
        });
      }
    });
  }

  async runOWASPChecks() {
    console.log('\n🔒 Running OWASP Top 10 2021 Security Checks...\n');
    
    for (const [checkName, checkFunction] of Object.entries(this.owaspTop10Checks)) {
      try {
        await checkFunction();
        console.log(`✅ ${checkName} - Check completed`);
      } catch (error) {
        console.log(`❌ ${checkName} - Check failed: ${error.message}`);
      }
    }
  }

  async checkBrokenAccessControl() {
    // Check for missing authentication checks
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('req.user') && !content.includes('authMiddleware')) {
        this.addVulnerability('A01:2021 – Broken Access Control',
          `Missing authentication middleware in ${file}`,
          'HIGH',
          'Add authentication middleware to protect routes');
      }
    }
  }

  async checkCryptographicFailures() {
    // Check for weak encryption
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('crypto') && !content.includes('AES-256')) {
        this.addWarning('A02:2021 – Cryptographic Failures',
          `Check encryption implementation in ${file}`,
          'MEDIUM',
          'Ensure strong encryption algorithms are used');
      }
    }
  }

  async checkInjection() {
    // Already checked in file scanning
    console.log('Injection checks completed during file scanning');
  }

  async checkInsecureDesign() {
    // Check for insecure design patterns
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('eval(') || content.includes('Function(')) {
        this.addVulnerability('A04:2021 – Insecure Design',
          `Dangerous code execution in ${file}`,
          'CRITICAL',
          'Remove eval() and Function() usage');
      }
    }
  }

  async checkSecurityMisconfiguration() {
    // Check for security misconfigurations
    const configFiles = ['./frontend-mobile/app.json', './backend/package.json'];
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('"debug": true') || content.includes('"development": true')) {
          this.addWarning('A05:2021 – Security Misconfiguration',
            `Development mode enabled in ${file}`,
            'LOW',
            'Ensure production builds disable debug mode');
        }
      }
    }
  }

  async checkVulnerableComponents() {
    // Check package.json for known vulnerabilities
    const packageFiles = ['./frontend-mobile/package.json', './backend/package.json'];
    for (const file of packageFiles) {
      if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const dependencies = { ...content.dependencies, ...content.devDependencies };
        
        // Check for known vulnerable packages
        const vulnerablePackages = {
          'axios': '0.21.1', // Known vulnerability
          'lodash': '4.17.19', // Known vulnerability
        };
        
        for (const [pkg, version] of Object.entries(vulnerablePackages)) {
          if (dependencies[pkg] && dependencies[pkg].includes(version)) {
            this.addVulnerability('A06:2021 – Vulnerable and Outdated Components',
              `Vulnerable package ${pkg}@${version} in ${file}`,
              'HIGH',
              'Update to latest secure version');
          }
        }
      }
    }
  }

  async checkAuthFailures() {
    // Check for authentication failures
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('password') && !content.includes('hash') && !content.includes('encrypt')) {
        this.addWarning('A07:2021 – Identification and Authentication Failures',
          `Potential plain text password storage in ${file}`,
          'HIGH',
          'Always hash passwords before storage');
      }
    }
  }

  async checkIntegrityFailures() {
    // Check for integrity failures
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('require(') && content.includes('http://')) {
        this.addVulnerability('A08:2021 – Software and Data Integrity Failures',
          `Insecure require from HTTP in ${file}`,
          'HIGH',
          'Use HTTPS for external dependencies');
      }
    }
  }

  async checkLoggingFailures() {
    // Check for logging failures
    const files = this.getAllCodeFiles();
    let hasLogging = false;
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console.log') || content.includes('logger')) {
        hasLogging = true;
        break;
      }
    }
    
    if (!hasLogging) {
      this.addWarning('A09:2021 – Security Logging and Monitoring Failures',
        'No logging implementation found',
        'MEDIUM',
        'Implement comprehensive logging and monitoring');
    }
  }

  async checkSSRF() {
    // Check for SSRF vulnerabilities
    const files = this.getAllCodeFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('fetch(') && content.includes('req.body.url')) {
        this.addVulnerability('A10:2021 – Server-Side Request Forgery (SSRF)',
          `Potential SSRF vulnerability in ${file}`,
          'HIGH',
          'Validate and sanitize URLs before making requests');
      }
    }
  }

  async checkDependencies() {
    console.log('\n📦 Checking Dependencies...\n');
    
    const packageFiles = ['./frontend-mobile/package.json', './backend/package.json'];
    for (const file of packageFiles) {
      if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const dependencies = { ...content.dependencies, ...content.devDependencies };
        
        console.log(`Dependencies in ${file}:`);
        Object.entries(dependencies).forEach(([name, version]) => {
          console.log(`  - ${name}: ${version}`);
        });
        console.log('');
      }
    }
  }

  getAllCodeFiles() {
    const files = [];
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (this.isCodeFile(item)) {
          files.push(fullPath);
        }
      }
    };
    scanDir('./frontend-mobile/src');
    scanDir('./backend/src');
    return files;
  }

  addVulnerability(category, description, severity, recommendation) {
    this.vulnerabilities.push({
      category,
      description,
      severity,
      recommendation,
      timestamp: new Date().toISOString()
    });
    this.issuesFound++;
  }

  addWarning(category, description, severity, recommendation) {
    this.warnings.push({
      category,
      description,
      severity,
      recommendation,
      timestamp: new Date().toISOString()
    });
    this.issuesFound++;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔒 MALPAY SECURITY VULNERABILITY ASSESSMENT REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Files Scanned: ${this.scannedFiles}`);
    console.log(`  Vulnerabilities Found: ${this.vulnerabilities.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Total Issues: ${this.issuesFound}`);
    
    if (this.vulnerabilities.length > 0) {
      console.log(`\n🚨 VULNERABILITIES (${this.vulnerabilities.length}):`);
      this.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n  ${index + 1}. [${vuln.severity}] ${vuln.category}`);
        console.log(`     Description: ${vuln.description}`);
        console.log(`     Recommendation: ${vuln.recommendation}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`\n  ${index + 1}. [${warning.severity}] ${warning.category}`);
        console.log(`     Description: ${warning.description}`);
        console.log(`     Recommendation: ${warning.recommendation}`);
      });
    }
    
    if (this.issuesFound === 0) {
      console.log('\n✅ No security issues found! The application appears to be secure.');
    } else {
      console.log(`\n🔧 RECOMMENDATIONS:`);
      console.log(`  1. Address all CRITICAL and HIGH severity issues immediately`);
      console.log(`  2. Review and fix MEDIUM severity issues within 30 days`);
      console.log(`  3. Consider LOW severity issues for future improvements`);
      console.log(`  4. Implement regular security audits and dependency updates`);
      console.log(`  5. Use automated security scanning tools in CI/CD pipeline`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Report generated at:', new Date().toISOString());
    console.log('='.repeat(80));
  }
}

// Run the security audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SecurityAuditor;
