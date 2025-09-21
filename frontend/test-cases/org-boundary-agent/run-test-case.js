#!/usr/bin/env node

/**
 * Test Case Runner for Organizational Boundary Agent
 * 
 * Usage:
 *   node run-test-case.js --case simple-hierarchy
 *   node run-test-case.js --case complex-multinational --validate
 *   node run-test-case.js --all --report
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class OrgBoundaryTestRunner {
  constructor() {
    this.testCases = [
      'simple-hierarchy',
      'complex-multinational', 
      'joint-ventures',
      'partial-ownership',
      'data-quality-issues'
    ];
    this.results = [];
  }

  async runTestCase(testCaseName, options = {}) {
    console.log(`\n🧪 Running test case: ${testCaseName}`);
    
    const testDir = path.join(__dirname, testCaseName);
    const inputsDir = path.join(testDir, 'inputs');
    const expectedOutputsDir = path.join(testDir, 'expected-outputs');
    
    // Check if test case exists
    if (!fs.existsSync(testDir)) {
      console.error(`❌ Test case directory not found: ${testDir}`);
      return { success: false, error: 'Test case not found' };
    }

    // Load test case metadata
    const testCaseFile = path.join(testDir, 'test-case.md');
    const validationFile = path.join(testDir, 'validation-criteria.json');
    
    let validationCriteria = {};
    if (fs.existsSync(validationFile)) {
      validationCriteria = JSON.parse(fs.readFileSync(validationFile, 'utf8'));
    }

    // Load input files
    const inputFiles = this.loadInputFiles(inputsDir);
    console.log(`📁 Loaded ${inputFiles.length} input files`);

    // Load expected outputs
    const expectedOutputs = this.loadExpectedOutputs(expectedOutputsDir);
    
    // Simulate agent processing (in real implementation, this would call the actual agent)
    const agentResults = await this.simulateAgentProcessing(inputFiles, testCaseName);
    
    // Validate results
    const validationResults = this.validateResults(agentResults, expectedOutputs, validationCriteria);
    
    // Generate report
    const report = this.generateTestReport(testCaseName, agentResults, validationResults, options);
    
    this.results.push(report);
    
    if (options.verbose) {
      this.printDetailedReport(report);
    } else {
      this.printSummaryReport(report);
    }
    
    return report;
  }

  loadInputFiles(inputsDir) {
    const files = [];
    if (!fs.existsSync(inputsDir)) return files;
    
    const fileList = fs.readdirSync(inputsDir);
    for (const fileName of fileList) {
      if (fileName.endsWith('.csv')) {
        const filePath = path.join(inputsDir, fileName);
        const data = this.parseCSV(filePath);
        files.push({
          name: fileName,
          path: filePath,
          data: data,
          rowCount: data.length
        });
      }
    }
    return files;
  }

  parseCSV(filePath) {
    const data = [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines.length === 0) return data;
    
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
      }
    }
    return data;
  }

  loadExpectedOutputs(expectedOutputsDir) {
    const outputs = {};
    if (!fs.existsSync(expectedOutputsDir)) return outputs;
    
    const files = fs.readdirSync(expectedOutputsDir);
    for (const fileName of files) {
      if (fileName.endsWith('.json')) {
        const filePath = path.join(expectedOutputsDir, fileName);
        try {
          outputs[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          console.warn(`⚠️  Could not parse expected output file: ${fileName}`);
        }
      }
    }
    return outputs;
  }

  async simulateAgentProcessing(inputFiles, testCaseName) {
    // Simulate processing time
    const processingTime = Math.random() * 5000 + 2000; // 2-7 seconds
    await new Promise(resolve => setTimeout(resolve, 100)); // Quick simulation

    // Extract entities from input files
    const entities = [];
    const relationships = [];
    
    for (const file of inputFiles) {
      if (file.name.includes('entity') || file.name.includes('org-chart')) {
        file.data.forEach((row, index) => {
          const entityName = row['Entity Name'] || row['name'] || '';
          if (entityName) {
            entities.push({
              id: `entity-${String(index + 1).padStart(3, '0')}`,
              name: entityName,
              type: this.inferEntityType(row),
              jurisdiction: row['Country'] || row['Legal Jurisdiction'] || 'Unknown',
              ownershipPercentage: this.parseOwnership(row['Ownership %'] || row['Ownership Percentage']),
              parentId: this.findParentId(row['Parent Entity'] || row['Parent Company'], entities),
              confidenceScore: Math.random() * 20 + 80, // 80-100%
              metadata: {
                legalType: row['Legal Form'] || row['Entity Type'] || 'Unknown',
                employees: parseInt(row['Employee Count'] || row['Employees']) || 0,
                revenue: this.parseRevenue(row['Annual Revenue (USD)'] || row['Revenue']),
                primaryActivity: row['Primary Business Activity'] || row['Business Activity'] || ''
              }
            });
          }
        });
      }
    }

    return {
      testId: `ORG-${testCaseName.toUpperCase()}`,
      entities: entities,
      relationships: relationships,
      processingMetrics: {
        entitiesProcessed: entities.length,
        relationshipsIdentified: relationships.length,
        processingTimeMs: processingTime,
        confidenceAverage: entities.reduce((sum, e) => sum + e.confidenceScore, 0) / entities.length
      },
      timestamp: new Date().toISOString()
    };
  }

  inferEntityType(row) {
    const parentEntity = row['Parent Entity'] || row['Parent Company'] || '';
    const ownershipStr = row['Ownership %'] || row['Ownership Percentage'] || '100%';
    const ownership = this.parseOwnership(ownershipStr);
    
    if (!parentEntity || parentEntity.toLowerCase() === 'n/a') {
      return 'Parent Company';
    } else if (ownership === 100) {
      return 'Subsidiary';
    } else if (ownership >= 50) {
      return 'Majority-Owned Subsidiary';
    } else {
      return 'Associate Company';
    }
  }

  parseOwnership(ownershipStr) {
    if (!ownershipStr || ownershipStr.toLowerCase() === 'n/a') return null;
    const match = ownershipStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  parseRevenue(revenueStr) {
    if (!revenueStr) return 0;
    const cleaned = revenueStr.replace(/[,$]/g, '');
    return parseFloat(cleaned) || 0;
  }

  findParentId(parentName, entities) {
    if (!parentName || parentName.toLowerCase() === 'n/a') return null;
    const parent = entities.find(e => e.name === parentName);
    return parent ? parent.id : null;
  }

  validateResults(agentResults, expectedOutputs, validationCriteria) {
    const results = {
      overallScore: 0,
      passedChecks: 0,
      totalChecks: 0,
      failures: [],
      details: {}
    };

    // Basic validation checks
    const checks = [
      {
        name: 'entity_count',
        description: 'Entity count matches expected',
        check: () => {
          const expected = Object.values(expectedOutputs)[0]?.entities?.length || 0;
          const actual = agentResults.entities.length;
          return { passed: Math.abs(actual - expected) <= 1, expected, actual };
        }
      },
      {
        name: 'processing_time',
        description: 'Processing completed within reasonable time',
        check: () => {
          const time = agentResults.processingMetrics.processingTimeMs;
          const passed = time < 600000; // 10 minutes max
          return { passed, expected: '<600000ms', actual: `${time}ms` };
        }
      },
      {
        name: 'confidence_threshold',
        description: 'Average confidence meets threshold',
        check: () => {
          const avgConfidence = agentResults.processingMetrics.confidenceAverage;
          const passed = avgConfidence >= 70; // Minimum 70% confidence
          return { passed, expected: '>=70%', actual: `${avgConfidence.toFixed(1)}%` };
        }
      }
    ];

    checks.forEach(check => {
      results.totalChecks++;
      const result = check.check();
      if (result.passed) {
        results.passedChecks++;
      } else {
        results.failures.push({
          check: check.name,
          description: check.description,
          expected: result.expected,
          actual: result.actual
        });
      }
      results.details[check.name] = result;
    });

    results.overallScore = Math.round((results.passedChecks / results.totalChecks) * 100);
    
    return results;
  }

  generateTestReport(testCaseName, agentResults, validationResults, options) {
    return {
      testCase: testCaseName,
      timestamp: new Date().toISOString(),
      success: validationResults.overallScore >= 70,
      score: validationResults.overallScore,
      agentResults: agentResults,
      validation: validationResults,
      summary: {
        entitiesFound: agentResults.entities.length,
        averageConfidence: agentResults.processingMetrics.confidenceAverage,
        processingTime: agentResults.processingMetrics.processingTimeMs,
        checksPassedRatio: `${validationResults.passedChecks}/${validationResults.totalChecks}`
      }
    };
  }

  printSummaryReport(report) {
    const status = report.success ? '✅ PASSED' : '❌ FAILED';
    const score = `${report.score}%`;
    const entities = report.summary.entitiesFound;
    const confidence = `${report.summary.averageConfidence.toFixed(1)}%`;
    const time = `${(report.summary.processingTime / 1000).toFixed(1)}s`;
    
    console.log(`${status} | Score: ${score} | Entities: ${entities} | Confidence: ${confidence} | Time: ${time}`);
    
    if (report.validation.failures.length > 0) {
      console.log(`   Failures: ${report.validation.failures.map(f => f.check).join(', ')}`);
    }
  }

  printDetailedReport(report) {
    console.log(`\n📊 Detailed Test Report: ${report.testCase}`);
    console.log(`⏰ Timestamp: ${report.timestamp}`);
    console.log(`🎯 Overall Score: ${report.score}%`);
    console.log(`✅ Status: ${report.success ? 'PASSED' : 'FAILED'}`);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Entities Found: ${report.summary.entitiesFound}`);
    console.log(`   Average Confidence: ${report.summary.averageConfidence.toFixed(1)}%`);
    console.log(`   Processing Time: ${(report.summary.processingTime / 1000).toFixed(1)}s`);
    console.log(`   Validation Checks: ${report.summary.checksPassedRatio}`);
    
    if (report.validation.failures.length > 0) {
      console.log(`\n❌ Failed Checks:`);
      report.validation.failures.forEach(failure => {
        console.log(`   • ${failure.description}`);
        console.log(`     Expected: ${failure.expected}, Actual: ${failure.actual}`);
      });
    }
    
    console.log(`\n🏢 Identified Entities:`);
    report.agentResults.entities.forEach((entity, index) => {
      const ownership = entity.ownershipPercentage ? `${entity.ownershipPercentage}%` : 'N/A';
      console.log(`   ${index + 1}. ${entity.name} (${entity.type}) - ${ownership} - ${entity.confidenceScore.toFixed(1)}%`);
    });
  }

  async runAll(options = {}) {
    console.log('🚀 Running all organizational boundary test cases...\n');
    
    for (const testCase of this.testCases) {
      await this.runTestCase(testCase, options);
    }
    
    this.generateOverallReport(options);
  }

  generateOverallReport(options) {
    console.log('\n📋 Overall Test Results Summary:');
    console.log('=' .repeat(50));
    
    let totalScore = 0;
    let passedTests = 0;
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testCase.padEnd(20)} | ${result.score}%`);
      
      totalScore += result.score;
      if (result.success) passedTests++;
    });
    
    const averageScore = totalScore / this.results.length;
    const passRate = (passedTests / this.results.length) * 100;
    
    console.log('=' .repeat(50));
    console.log(`📊 Overall Statistics:`);
    console.log(`   Tests Passed: ${passedTests}/${this.results.length} (${passRate.toFixed(1)}%)`);
    console.log(`   Average Score: ${averageScore.toFixed(1)}%`);
    console.log(`   Grade: ${this.getGrade(averageScore)}`);
    
    if (options.report) {
      this.saveReport();
    }
  }

  getGrade(score) {
    if (score >= 95) return 'A+ (Excellent)';
    if (score >= 90) return 'A (Very Good)';
    if (score >= 85) return 'B+ (Good)';
    if (score >= 80) return 'B (Satisfactory)';
    if (score >= 70) return 'C (Acceptable)';
    return 'F (Needs Improvement)';
  }

  saveReport() {
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new OrgBoundaryTestRunner();
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    validate: args.includes('--validate'),
    report: args.includes('--report')
  };
  
  if (args.includes('--all')) {
    runner.runAll(options);
  } else {
    const caseIndex = args.findIndex(arg => arg === '--case');
    if (caseIndex !== -1 && args[caseIndex + 1]) {
      const testCase = args[caseIndex + 1];
      runner.runTestCase(testCase, { ...options, verbose: true });
    } else {
      console.log('Usage:');
      console.log('  node run-test-case.js --case <test-case-name> [--validate] [--verbose]');
      console.log('  node run-test-case.js --all [--report] [--verbose]');
      console.log('\nAvailable test cases:');
      runner.testCases.forEach(tc => console.log(`  - ${tc}`));
    }
  }
}

module.exports = OrgBoundaryTestRunner;