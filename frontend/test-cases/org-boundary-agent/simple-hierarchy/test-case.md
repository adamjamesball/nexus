# Test Case: Simple Hierarchy

## 📋 Overview

**Test ID**: ORG-001
**Scenario**: Basic parent-subsidiary structure with clear ownership
**Complexity Level**: Low
**Expected Duration**: 2-3 minutes
**Success Threshold**: 95% accuracy

## 🎯 Objectives

Test the Entity Intelligence Agent's ability to:
- Identify a simple 3-tier organizational structure
- Map clear parent-subsidiary relationships
- Handle 100% ownership scenarios
- Extract basic entity metadata from site lists
- Generate appropriate confidence scores for clean data

## 🏢 Test Scenario

### Corporate Structure
```
GreenTech Industries Inc. (Parent)
└── GreenTech Manufacturing LLC (100% subsidiary)
    └── GreenTech Solar Division (100% subsidiary)
```

### Business Context
- **Industry**: Renewable Energy Manufacturing
- **Geography**: United States (single jurisdiction)
- **Employees**: ~500 total across all entities
- **Operations**: Manufacturing solar panels and energy storage systems

## 📄 Input Files

### 1. `site-list-primary.xlsx`
**Description**: Main site listing with entity information
**Source**: Corporate facilities management system
**Columns**:
- Site Name
- Entity Name  
- Address
- Country
- State/Province
- Employee Count
- Site Type
- Parent Company
- Ownership %

### 2. `org-chart-extract.xlsx`
**Description**: Organizational chart data
**Source**: HR system export
**Columns**:
- Entity Name
- Entity Type
- Legal Jurisdiction
- Parent Entity
- Ownership Percentage
- Incorporation Date
- Primary Business Activity

## ✅ Expected Outcomes

### Entities to be Identified (3 total)
1. **GreenTech Industries Inc.**
   - Type: Parent Company
   - Jurisdiction: Delaware, USA
   - Ownership: N/A (ultimate parent)
   - Confidence: 98-100%

2. **GreenTech Manufacturing LLC**
   - Type: Subsidiary
   - Jurisdiction: Texas, USA
   - Parent: GreenTech Industries Inc.
   - Ownership: 100%
   - Confidence: 95-100%

3. **GreenTech Solar Division**
   - Type: Business Unit/Subsidiary
   - Jurisdiction: Texas, USA
   - Parent: GreenTech Manufacturing LLC
   - Ownership: 100%
   - Confidence: 90-95%

### Relationships to be Mapped (2 total)
1. GreenTech Industries Inc. → GreenTech Manufacturing LLC (100%)
2. GreenTech Manufacturing LLC → GreenTech Solar Division (100%)

### Key Insights Expected
- **Boundary Recommendation**: Include all entities for Scope 1 & 2 (100% operational control)
- **Control Assessment**: Operational control identified for all subsidiaries
- **Data Quality**: High quality assessment (minimal issues)

## 🔍 Validation Criteria

### Primary Success Metrics
- [x] **Entity Count**: Exactly 3 entities identified
- [x] **Relationship Count**: Exactly 2 parent-child relationships
- [x] **Ownership Accuracy**: 100% ownership correctly identified for both relationships
- [x] **Name Matching**: All entity names exactly match expected values
- [x] **Hierarchy Depth**: 3-tier structure correctly mapped

### Secondary Success Metrics
- [x] **Confidence Scores**: Average confidence ≥90%
- [x] **Jurisdiction Mapping**: US jurisdictions correctly identified
- [x] **Entity Types**: Appropriate classification (parent, subsidiary, division)
- [x] **Control Assessment**: Operational control correctly identified
- [x] **Processing Time**: Completed within 5 minutes

### Data Quality Assessment
- [x] **No Missing Data Issues**: All required fields populated
- [x] **No Conflicts**: Consistent ownership information across sources
- [x] **No Duplicates**: Each entity identified only once

## ⚠️ Potential Challenges

### Known Issues to Handle
1. **Division vs. Subsidiary**: Solar Division may be classified as either
2. **Legal Entity Types**: LLC vs. Inc. distinctions must be preserved
3. **Site-Entity Mapping**: Multiple sites may belong to same entity

### Expected Agent Behavior
- Should handle minor name variations (e.g., "GreenTech" vs "Green Tech")
- Should correctly aggregate site-level data to entity level
- Should provide high confidence scores for clean, consistent data

## 🧪 Testing Process

### Manual Testing Steps
1. Upload `site-list-primary.xlsx` and `org-chart-extract.xlsx`
2. Run Entity Intelligence Agent
3. Review identified entities and relationships
4. Validate against expected outputs
5. Check confidence scores and data quality assessment

### Automated Validation
```bash
npm run test:org-boundary -- --case simple-hierarchy --validate
```

### Success Criteria Checklist
- [ ] All 3 entities correctly identified
- [ ] All 2 relationships correctly mapped
- [ ] 100% ownership percentages correct
- [ ] Average confidence score ≥90%
- [ ] Processing completed without errors
- [ ] Boundary recommendations provided
- [ ] No data quality issues flagged

## 📊 Performance Benchmarks

### Target Metrics
- **Precision**: ≥98% (minimal false positives)
- **Recall**: ≥95% (minimal missed entities)
- **F1-Score**: ≥96%
- **Processing Time**: ≤3 minutes
- **Confidence Calibration**: Confidence scores align with actual accuracy

### Baseline Comparison
This test case serves as the baseline for measuring improvements in:
- Complex hierarchy handling
- Multi-jurisdiction processing
- Data quality issue resolution
- Joint venture analysis

## 🔄 Iterative Improvement

### Feedback Integration
- Domain expert reviews results and provides corrections
- Any corrections fed back to improve agent performance
- Regular re-testing to ensure consistent performance

### Extensions
This test case can be extended by:
- Adding more subsidiaries to test scalability
- Introducing minor data quality issues
- Testing with different file formats (CSV, PDF)
- Adding historical ownership changes