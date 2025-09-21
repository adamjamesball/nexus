# Test Case: Complex Multinational

## 📋 Overview

**Test ID**: ORG-002
**Scenario**: Large multinational corporation with complex ownership structure
**Complexity Level**: High
**Expected Duration**: 8-12 minutes
**Success Threshold**: 85% accuracy

## 🎯 Objectives

Test the Entity Intelligence Agent's ability to:
- Handle complex multi-tier organizational structures (5+ levels)
- Process entities across multiple jurisdictions (6+ countries)
- Manage varying ownership percentages (51%-100%)
- Handle different entity types (subsidiaries, holdings, branches)
- Resolve complex parent-child relationships
- Generate appropriate confidence scores for complex scenarios

## 🏢 Test Scenario

### Corporate Structure
```
GlobalEnergia Holdings S.A. (Luxembourg) - Parent
├── EnergiaTech USA Inc. (USA) - 100% subsidiary
│   ├── EnergiaTech Manufacturing LLC (USA) - 100%
│   └── EnergiaTech Services Corp (USA) - 100%
├── EuropeanEnergia B.V. (Netherlands) - 85% subsidiary
│   ├── EnergiaTech Deutschland GmbH (Germany) - 100%
│   ├── EnergiaTech France SAS (France) - 75%
│   └── Nordic Energy AB (Sweden) - 60%
├── Asia Pacific Energy Pte Ltd (Singapore) - 90% subsidiary
│   ├── EnergiaTech Japan K.K. (Japan) - 100%
│   ├── EnergiaTech Australia Pty Ltd (Australia) - 100%
│   └── India Solar Energy Pvt Ltd (India) - 51%
└── LATAM Energia Ltda (Brazil) - 70% subsidiary
    ├── EnergiaTech Mexico S.A. (Mexico) - 100%
    └── Argentina Wind Power S.A. (Argentina) - 80%
```

### Business Context
- **Industry**: Renewable Energy & Clean Technology
- **Geography**: 12 countries across 5 continents
- **Employees**: ~8,500 total across all entities
- **Structure**: Holding company model with regional subsidiaries

## 📄 Input Files

### 1. `global-entity-list.csv`
**Description**: Comprehensive entity listing with ownership structure
**Source**: Corporate legal department
**Columns**: Entity Name, Country, Legal Form, Parent Entity, Ownership %, Incorporation Date, Status

### 2. `site-operations-data.csv`
**Description**: Operational sites mapped to legal entities
**Source**: Global operations team
**Columns**: Site Name, Entity Name, Country, Region, Site Type, Employees, Revenue, Operations Status

### 3. `ownership-structure.csv`
**Description**: Detailed ownership relationships and control mechanisms
**Source**: Corporate finance team
**Columns**: Parent Entity, Subsidiary Entity, Direct Ownership %, Indirect Ownership %, Control Type, Voting Rights %

## ✅ Expected Outcomes

### Entities to be Identified (15 total)
1. **GlobalEnergia Holdings S.A.** (Luxembourg) - Ultimate parent
2. **EnergiaTech USA Inc.** (USA) - 100% subsidiary
3. **EnergiaTech Manufacturing LLC** (USA) - 100% subsidiary
4. **EnergiaTech Services Corp** (USA) - 100% subsidiary
5. **EuropeanEnergia B.V.** (Netherlands) - 85% subsidiary
6. **EnergiaTech Deutschland GmbH** (Germany) - 100% subsidiary
7. **EnergiaTech France SAS** (France) - 75% subsidiary
8. **Nordic Energy AB** (Sweden) - 60% subsidiary
9. **Asia Pacific Energy Pte Ltd** (Singapore) - 90% subsidiary
10. **EnergiaTech Japan K.K.** (Japan) - 100% subsidiary
11. **EnergiaTech Australia Pty Ltd** (Australia) - 100% subsidiary
12. **India Solar Energy Pvt Ltd** (India) - 51% subsidiary
13. **LATAM Energia Ltda** (Brazil) - 70% subsidiary
14. **EnergiaTech Mexico S.A.** (Mexico) - 100% subsidiary
15. **Argentina Wind Power S.A.** (Argentina) - 80% subsidiary

### Key Relationships (14 direct relationships)
- Complex multi-tier structure with regional holding companies
- Various ownership percentages requiring careful assessment
- Different control mechanisms (operational vs. financial)

### Expected Insights
- **Boundary Recommendations**: Entities with ≥50% ownership for operational control
- **Minority Interests**: Nordic Energy AB (60%) and India Solar (51%) require special assessment
- **Regional Consolidation**: Regional holding companies consolidate control
- **Multi-jurisdiction Compliance**: Different regulatory requirements across jurisdictions

## 🔍 Validation Criteria

### Primary Success Metrics
- [x] **Entity Count**: 15 entities identified (±1 acceptable)
- [x] **Relationship Count**: 14 direct parent-child relationships
- [x] **Ownership Accuracy**: ±5% tolerance for ownership percentages
- [x] **Multi-tier Mapping**: Correct 5-level hierarchy structure
- [x] **Jurisdiction Mapping**: All 12 countries correctly identified

### Secondary Success Metrics
- [x] **Confidence Scores**: Average confidence ≥75% (lower due to complexity)
- [x] **Entity Classification**: Appropriate legal form recognition
- [x] **Control Assessment**: Correct operational vs. financial control determination
- [x] **Minority Interest Handling**: Special flags for <100% ownership
- [x] **Processing Time**: Completed within 15 minutes

### Complex Scenario Handling
- [x] **Regional Holdings**: Intermediate holding companies correctly identified
- [x] **Minority Stakes**: 51-85% ownership scenarios handled appropriately
- [x] **Legal Form Variety**: S.A., B.V., GmbH, SAS, Pte Ltd, etc. recognized
- [x] **Cross-border Structure**: Complex international structure mapped

## ⚠️ Potential Challenges

### Known Complexities
1. **Multi-tier Ownership**: Indirect ownership calculations through regional holdings
2. **Minority Control**: 60% stake in Nordic Energy may not provide operational control
3. **Legal Form Variations**: Different corporate structures across jurisdictions
4. **Currency/Reporting**: Multiple reporting currencies and standards
5. **Joint Venture Indicators**: India Solar (51%) may be structured as JV

### Expected Agent Behavior
- Should calculate effective ownership through intermediate holdings
- Should flag entities with <100% ownership for review
- Should provide jurisdiction-specific legal form recognition
- Should assess control mechanisms beyond ownership percentage

## 🧪 Testing Process

### Manual Testing Steps
1. Upload all three input CSV files
2. Run Entity Intelligence Agent with complex organization settings
3. Review entity identification and hierarchy mapping
4. Validate ownership calculations and control assessments
5. Check regional grouping and consolidation recommendations

### Key Validation Points
- [ ] All 15 entities identified with correct names
- [ ] Ownership percentages within 5% tolerance
- [ ] Multi-tier relationships correctly mapped
- [ ] Regional holding companies properly positioned
- [ ] Minority interests appropriately flagged
- [ ] Jurisdiction mapping 100% accurate
- [ ] Control assessment considers ownership + governance

## 📊 Performance Benchmarks

### Target Metrics
- **Precision**: ≥85% (some false positives acceptable due to complexity)
- **Recall**: ≥90% (minimize missed entities)
- **F1-Score**: ≥87%
- **Processing Time**: ≤12 minutes
- **Ownership Accuracy**: ±5% tolerance
- **Control Assessment Accuracy**: ≥80%

### Complexity Handling
- **Multi-jurisdiction Processing**: All 12 countries handled correctly
- **Legal Form Recognition**: 8+ different legal forms identified
- **Ownership Calculation**: Indirect ownership through holdings calculated
- **Minority Interest Assessment**: Special handling for <100% stakes

## 🔄 Advanced Scenarios

### Edge Cases Included
- **51% Ownership**: India Solar Energy (potential joint venture)
- **60% Ownership**: Nordic Energy AB (majority but not strong control)
- **75% Ownership**: EnergiaTech France (significant minority interest)
- **Holding Company Structure**: Regional holdings consolidating control
- **Cross-border Operations**: Sites vs. legal entity jurisdictions may differ

### Learning Opportunities
- How does the agent handle regional holding company structures?
- Does it correctly assess control with varying ownership percentages?
- Can it identify potential joint venture structures?
- How well does it handle complex international corporate structures?

## 📈 Success Indicators

### Excellent Performance (90%+ score)
- All entities identified correctly
- Ownership within 2% accuracy
- Perfect hierarchy mapping
- Correct control assessments
- Processing under 10 minutes

### Good Performance (80-89% score)
- 14-15 entities identified
- Ownership within 5% accuracy
- Minor hierarchy mapping issues
- Mostly correct control assessments
- Processing under 12 minutes

### Acceptable Performance (70-79% score)
- 12-13 entities identified
- Ownership within 10% accuracy
- Some hierarchy mapping errors
- Control assessment needs review
- Processing under 15 minutes

This test case represents a realistic complex multinational structure that sustainability teams frequently encounter when establishing organizational boundaries for emissions reporting and ESG assessments.