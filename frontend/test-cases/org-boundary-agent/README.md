# Organizational Boundary Agent Test Cases

This directory contains comprehensive test cases for validating the Entity Intelligence Agent's ability to identify organizational structures, map entity relationships, and determine reporting boundaries for sustainability assessments.

## 🎯 Test Objectives

The Entity Intelligence Agent should be able to:
- Extract organizational entities from various document formats
- Identify ownership relationships and percentages
- Map complex corporate structures including subsidiaries, joint ventures, and partnerships
- Determine operational vs. financial control
- Handle data quality issues and inconsistencies
- Generate confidence scores for entity mappings
- Suggest appropriate reporting boundaries based on GHG Protocol guidance

## 📁 Test Case Structure

Each test case directory contains:
- **`inputs/`** - Excel files with site lists, entity data, and organizational information
- **`expected-outputs/`** - JSON files with expected agent results
- **`test-case.md`** - Detailed test case documentation
- **`validation-criteria.json`** - Specific validation rules and success metrics

## 🧪 Available Test Cases

### 1. Simple Hierarchy (`simple-hierarchy/`)
**Scenario**: Basic parent-subsidiary structure with 100% ownership
**Complexity**: Low
**Key Features**: Clear ownership chains, single jurisdiction

### 2. Complex Multinational (`complex-multinational/`)
**Scenario**: Large multinational with multiple subsidiaries across jurisdictions
**Complexity**: High
**Key Features**: Multi-tier ownership, various ownership percentages, regulatory complexity

### 3. Joint Ventures (`joint-ventures/`)
**Scenario**: Mix of wholly-owned subsidiaries and joint ventures
**Complexity**: Medium-High
**Key Features**: 50/50 JVs, minority interests, operational vs. financial control

### 4. Partial Ownership (`partial-ownership/`)
**Scenario**: Company with various minority and majority stakes
**Complexity**: Medium
**Key Features**: 51-99% ownership, associate companies, equity method investments

### 5. Data Quality Issues (`data-quality-issues/`)
**Scenario**: Inconsistent, incomplete, or conflicting organizational data
**Complexity**: High
**Key Features**: Missing data, name variations, conflicting ownership percentages

## 🔍 Validation Framework

### Success Criteria
1. **Entity Extraction**: ≥95% accuracy in identifying unique entities
2. **Ownership Mapping**: ≥90% accuracy in ownership percentage identification
3. **Relationship Mapping**: ≥85% accuracy in parent-child relationships
4. **Confidence Scoring**: Appropriate confidence levels (50-100%)
5. **Boundary Recommendations**: Aligned with GHG Protocol guidance

### Key Metrics
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall
- **Confidence Accuracy**: How well confidence scores predict actual accuracy

## 🚀 Running Test Cases

### Automated Testing
```bash
# Run all test cases
npm run test:org-boundary

# Run specific test case
npm run test:org-boundary -- --case simple-hierarchy

# Generate test report
npm run test:org-boundary -- --report
```

### Manual Testing
1. Upload input files through the Nexus dashboard
2. Run the Entity Intelligence Agent
3. Compare results against expected outputs
4. Validate using the provided criteria

## 📊 Expected Agent Outputs

Each test case expects the agent to produce:

```json
{
  "entities": [
    {
      "id": "entity-001",
      "name": "Global Manufacturing Corp",
      "type": "Parent Company",
      "jurisdiction": "United States",
      "ownershipPercentage": 100,
      "parentId": null,
      "confidenceScore": 95.2,
      "isUserVerified": false,
      "identificationSources": ["site_list", "org_chart"],
      "metadata": {
        "sector": "Manufacturing",
        "employees": 15000,
        "revenue": 2500000000,
        "sites": 12
      }
    }
  ],
  "relationships": [
    {
      "parentId": "entity-001",
      "childId": "entity-002",
      "ownershipPercentage": 75,
      "controlType": "operational",
      "confidenceScore": 88.5
    }
  ],
  "insights": [
    {
      "type": "boundary_recommendation",
      "title": "Scope 1 & 2 Boundary Recommendation",
      "description": "Include all entities with ≥50% ownership for operational control approach",
      "affectedEntities": ["entity-001", "entity-002"],
      "confidence": 92.1
    }
  ],
  "dataQualityIssues": [
    {
      "type": "missing_ownership",
      "entity": "entity-003",
      "description": "Ownership percentage not specified",
      "severity": "medium"
    }
  ],
  "processingMetrics": {
    "entitiesProcessed": 15,
    "relationshipsIdentified": 12,
    "confidenceAverage": 87.3,
    "processingTimeMs": 3200
  }
}
```

## 🏗️ Test Data Standards

### Input File Requirements
- **Format**: Excel (.xlsx) or CSV
- **Required Columns**: Entity Name, Location/Country, Parent Company (optional)
- **Optional Columns**: Ownership %, Employee Count, Revenue, Sector
- **Data Quality**: Mix of clean and messy data to test robustness

### Naming Conventions
- **Input files**: `{test-case}-input-{version}.xlsx`
- **Expected outputs**: `{test-case}-expected-output.json`
- **Test documentation**: `test-case.md`

## 🔬 Advanced Testing Scenarios

### Edge Cases
- Circular ownership references
- Entities with same names in different jurisdictions
- Recent acquisitions/divestments
- Bankruptcy/liquidation scenarios
- Special purpose vehicles (SPVs)

### Integration Testing
- Test with other agents (Carbon Expert, Compliance Agent)
- Cross-validation with external databases
- Multi-document reconciliation
- Real-time updates and change detection

## 📈 Continuous Improvement

### Learning Feedback Loop
1. **Human Validation**: Domain experts review and correct results
2. **Feedback Integration**: Corrections fed back to improve agent performance
3. **Model Refinement**: Regular updates based on test case performance
4. **New Test Cases**: Add cases based on real-world edge cases encountered

### Performance Monitoring
- Track accuracy trends over time
- Monitor processing speed improvements
- Validate confidence score calibration
- Measure user satisfaction with results