import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SecurityIssue {
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];

  async scanBackend(): Promise<void> {
    console.log('🔍 Scanning backend for security vulnerabilities...');
    
    await this.scanForSQLInjection();
    await this.scanForXSS();
    await this.scanForInsecureCryptography();
    await this.scanForAuthenticationIssues();
    await this.scanForAuthorizationIssues();
    await this.scanForDataExposure();
    await this.scanForInsecureDependencies();
    await this.scanForConfigurationIssues();
  }

  async scanFrontend(): Promise<void> {
    console.log('🔍 Scanning frontend for security vulnerabilities...');
    
    await this.scanForClientSideVulnerabilities();
    await this.scanForDataLeakage();
    await this.scanForInsecureStorage();
    await this.scanForNetworkSecurity();
  }

  private async scanForSQLInjection(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for string concatenation in SQL queries
        if (line.includes('query(') && line.includes('+')) {
          this.addIssue({
            type: 'SQL Injection',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Potential SQL injection vulnerability detected',
            recommendation: 'Use parameterized queries instead of string concatenation'
          });
        }
        
        // Check for template literals in SQL queries
        if (line.includes('query(') && line.includes('`')) {
          this.addIssue({
            type: 'SQL Injection',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Potential SQL injection with template literals',
            recommendation: 'Use parameterized queries with $1, $2, etc.'
          });
        }
      });
    }
  }

  private async scanForXSS(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for unsanitized user input
        if (line.includes('req.body') && !line.includes('sanitize') && !line.includes('validate')) {
          this.addIssue({
            type: 'XSS',
            severity: 'MEDIUM',
            file,
            line: index + 1,
            description: 'User input not sanitized',
            recommendation: 'Sanitize and validate all user inputs'
          });
        }
      });
    }
  }

  private async scanForInsecureCryptography(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for weak encryption algorithms
        if (line.includes('MD5') || line.includes('SHA1')) {
          this.addIssue({
            type: 'Weak Cryptography',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Weak cryptographic algorithm detected',
            recommendation: 'Use SHA-256 or stronger algorithms'
          });
        }
        
        // Check for hardcoded secrets
        if (line.includes('password') && line.includes('=') && line.includes("'")) {
          this.addIssue({
            type: 'Hardcoded Secret',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Potential hardcoded password or secret',
            recommendation: 'Use environment variables for sensitive data'
          });
        }
      });
    }
  }

  private async scanForAuthenticationIssues(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for missing authentication
        if (line.includes('app.get') || line.includes('app.post')) {
          const nextLines = lines.slice(index, index + 5);
          const hasAuth = nextLines.some(l => l.includes('authenticate') || l.includes('auth'));
          
          if (!hasAuth && !line.includes('health') && !line.includes('register') && !line.includes('login')) {
            this.addIssue({
              type: 'Missing Authentication',
              severity: 'HIGH',
              file,
              line: index + 1,
              description: 'Endpoint without authentication middleware',
              recommendation: 'Add authentication middleware to protect endpoints'
            });
          }
        }
      });
    }
  }

  private async scanForAuthorizationIssues(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for missing authorization checks
        if (line.includes('req.user') && !line.includes('authorize')) {
          this.addIssue({
            type: 'Missing Authorization',
            severity: 'MEDIUM',
            file,
            line: index + 1,
            description: 'User access not properly authorized',
            recommendation: 'Add proper authorization checks'
          });
        }
      });
    }
  }

  private async scanForDataExposure(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for sensitive data in responses
        if (line.includes('res.json') && (line.includes('password') || line.includes('secret'))) {
          this.addIssue({
            type: 'Data Exposure',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Sensitive data exposed in response',
            recommendation: 'Remove sensitive data from API responses'
          });
        }
      });
    }
  }

  private async scanForInsecureDependencies(): Promise<void> {
    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('📦 Checking for vulnerable dependencies...');
        
        // Run npm audit
        try {
          const auditResult = execSync('npm audit --json', { cwd: path.dirname(packageJsonPath) });
          const audit = JSON.parse(auditResult.toString());
          
          if (audit.vulnerabilities) {
            Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
              this.addIssue({
                type: 'Vulnerable Dependency',
                severity: vuln.severity === 'high' ? 'HIGH' : vuln.severity === 'moderate' ? 'MEDIUM' : 'LOW',
                file: 'package.json',
                description: `Vulnerable dependency: ${pkg}`,
                recommendation: `Update ${pkg} to a secure version`
              });
            });
          }
        } catch (error) {
          console.log('⚠️ Could not run npm audit');
        }
      }
    } catch (error) {
      console.log('⚠️ Error checking dependencies');
    }
  }

  private async scanForConfigurationIssues(): Promise<void> {
    const backendDir = path.join(__dirname, '../src');
    const files = this.getFilesRecursively(backendDir, ['.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for debug mode in production
        if (line.includes('debug') && line.includes('true')) {
          this.addIssue({
            type: 'Configuration Issue',
            severity: 'MEDIUM',
            file,
            line: index + 1,
            description: 'Debug mode enabled',
            recommendation: 'Disable debug mode in production'
          });
        }
        
        // Check for missing CORS configuration
        if (line.includes('app.use') && line.includes('cors')) {
          const nextLines = lines.slice(index, index + 3);
          const hasOrigin = nextLines.some(l => l.includes('origin'));
          
          if (!hasOrigin) {
            this.addIssue({
              type: 'CORS Misconfiguration',
              severity: 'MEDIUM',
              file,
              line: index + 1,
              description: 'CORS not properly configured',
              recommendation: 'Configure CORS with specific origins'
            });
          }
        }
      });
    }
  }

  private async scanForClientSideVulnerabilities(): Promise<void> {
    const frontendDir = path.join(__dirname, '../../frontend-mobile/src');
    if (!fs.existsSync(frontendDir)) return;
    
    const files = this.getFilesRecursively(frontendDir, ['.tsx', '.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for dangerous HTML rendering
        if (line.includes('dangerouslySetInnerHTML')) {
          this.addIssue({
            type: 'XSS Vulnerability',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Dangerous HTML rendering detected',
            recommendation: 'Sanitize HTML content before rendering'
          });
        }
        
        // Check for eval usage
        if (line.includes('eval(')) {
          this.addIssue({
            type: 'Code Injection',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'eval() usage detected',
            recommendation: 'Avoid using eval() for security reasons'
          });
        }
      });
    }
  }

  private async scanForDataLeakage(): Promise<void> {
    const frontendDir = path.join(__dirname, '../../frontend-mobile/src');
    if (!fs.existsSync(frontendDir)) return;
    
    const files = this.getFilesRecursively(frontendDir, ['.tsx', '.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for console.log with sensitive data
        if (line.includes('console.log') && (line.includes('password') || line.includes('token'))) {
          this.addIssue({
            type: 'Data Leakage',
            severity: 'MEDIUM',
            file,
            line: index + 1,
            description: 'Sensitive data logged to console',
            recommendation: 'Remove sensitive data from console logs'
          });
        }
      });
    }
  }

  private async scanForInsecureStorage(): Promise<void> {
    const frontendDir = path.join(__dirname, '../../frontend-mobile/src');
    if (!fs.existsSync(frontendDir)) return;
    
    const files = this.getFilesRecursively(frontendDir, ['.tsx', '.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for AsyncStorage with sensitive data
        if (line.includes('AsyncStorage.setItem') && (line.includes('password') || line.includes('token'))) {
          this.addIssue({
            type: 'Insecure Storage',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'Sensitive data stored in AsyncStorage',
            recommendation: 'Use SecureStore for sensitive data'
          });
        }
      });
    }
  }

  private async scanForNetworkSecurity(): Promise<void> {
    const frontendDir = path.join(__dirname, '../../frontend-mobile/src');
    if (!fs.existsSync(frontendDir)) return;
    
    const files = this.getFilesRecursively(frontendDir, ['.tsx', '.ts', '.js']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for HTTP URLs
        if (line.includes('http://') && !line.includes('localhost')) {
          this.addIssue({
            type: 'Insecure Network',
            severity: 'HIGH',
            file,
            line: index + 1,
            description: 'HTTP URL detected (not HTTPS)',
            recommendation: 'Use HTTPS for all network requests'
          });
        }
      });
    }
  }

  private getFilesRecursively(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  generateReport(): void {
    console.log('\n🔒 SECURITY SCAN REPORT');
    console.log('='.repeat(50));
    
    const highIssues = this.issues.filter(i => i.severity === 'HIGH');
    const mediumIssues = this.issues.filter(i => i.severity === 'MEDIUM');
    const lowIssues = this.issues.filter(i => i.severity === 'LOW');
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   HIGH: ${highIssues.length}`);
    console.log(`   MEDIUM: ${mediumIssues.length}`);
    console.log(`   LOW: ${lowIssues.length}`);
    console.log(`   TOTAL: ${this.issues.length}`);
    
    if (highIssues.length > 0) {
      console.log('\n🚨 HIGH SEVERITY ISSUES:');
      highIssues.forEach(issue => {
        console.log(`   ${issue.type} in ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`   ${issue.description}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log('\n⚠️ MEDIUM SEVERITY ISSUES:');
      mediumIssues.forEach(issue => {
        console.log(`   ${issue.type} in ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`   ${issue.description}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }
    
    if (lowIssues.length > 0) {
      console.log('\nℹ️ LOW SEVERITY ISSUES:');
      lowIssues.forEach(issue => {
        console.log(`   ${issue.type} in ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`   ${issue.description}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }
    
    if (this.issues.length === 0) {
      console.log('\n✅ No security issues found!');
    }
    
    // Generate JSON report
    const reportPath = path.join(__dirname, '../security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      },
      issues: this.issues
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run security scan
async function runSecurityScan() {
  const scanner = new SecurityScanner();
  
  console.log('🔒 Starting MalPay Security Scan...\n');
  
  await scanner.scanBackend();
  await scanner.scanFrontend();
  
  scanner.generateReport();
}

if (require.main === module) {
  runSecurityScan().catch(console.error);
}

export { SecurityScanner };
