#!/usr/bin/env python3
"""
Nexus Quick Demo: A Glimpse into the Future of Sustainability AI

This demonstrates the foundational layer of Nexus, showcasing:
1.  **Rock-Solid Reliability**: Fast, accurate, and reliable file processing.
2.  **Deterministic Core**: A rule-based engine for predictable, auditable results.
3.  **AI-Ready Architecture**: A clear path for layering in advanced AI and learning capabilities.
4.  **Human-Centric Output**: Clear, concise, and actionable insights.

This is the bedrock upon which we will build the world's most advanced, self-improving sustainability AI.
"""

import pandas as pd
import os
import sys
from typing import List, Dict, Any
import time

def nexus_foundational_processor(file_paths: List[str]) -> Dict[str, Any]:
    """
    Demonstrates the new, robust, and AI-ready approach.
    This function represents the deterministic core of the Nexus platform.
    """
    start_time = time.time()
    results = {
        'status': 'success',
        'entities': [],
        'errors': [],
        'warnings': [],
        'processing_time': 0.0,
        'narrative': ''
    }

    print("🚀 Initializing Nexus Foundational Processor...")
    print(f"📁 Processing {len(file_paths)} files...")

    # Step 1: Parse and Validate Files (The Deterministic Core)
    all_data = []
    for file_path in file_paths:
        try:
            print(f"📊 Parsing {os.path.basename(file_path)}...")
            # In the full platform, this would be handled by our Smart Document Agent
            if file_path.endswith('.xlsx'):
                df = pd.read_excel(file_path, engine='openpyxl')
            elif file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                results['warnings'].append(f"Unsupported format: {file_path}")
                continue

            if not df.empty:
                all_data.append((file_path, df))
                print(f"  ✅ Found {len(df)} rows, {len(df.columns)} columns")

        except Exception as e:
            error_msg = f"Failed to parse {os.path.basename(file_path)}: {str(e)}"
            results['errors'].append(error_msg)
            print(f"  ❌ {error_msg}")
            # In the full platform, this error would be logged and fed to the
            # Continuous Learning Engine to improve future parsing.

    if not all_data:
        results['status'] = 'error'
        results['narrative'] = "No files could be successfully parsed. Please check file formats and content."
        return results

    # Step 2: Extract Entities (Rule-Based Core, AI-Enhanced Future)
    print("🔍 Extracting organizational entities...")
    entities = []
    for file_path, df in all_data:
        # This is the rule-based core. In the full platform, our Entity Intelligence
        # Agent would enhance this with contextual understanding and reasoning.
        file_entities = extract_entities_simple(df, file_path)
        entities.extend(file_entities)
        print(f"  📤 Extracted {len(file_entities)} entities from {os.path.basename(file_path)}")

    # Step 3: Deduplicate and Clean
    print("🧹 Cleaning and deduplicating entities...")
    unique_entities = deduplicate_entities(entities)
    removed_count = len(entities) - len(unique_entities)
    if removed_count > 0:
        print(f"  🗑️ Removed {removed_count} duplicate entities")

    results['entities'] = unique_entities

    # Step 4: Generate Narrative (AI-Powered Insights in the Full Platform)
    print("📝 Generating analysis narrative...")
    # In the full platform, our Strategic Insight Agent would generate this narrative,
    # drawing on the full context of the knowledge graph.
    results['narrative'] = generate_simple_narrative(unique_entities, results['errors'], results['warnings'])

    # Finalize and Return
    processing_time = time.time() - start_time
    results['processing_time'] = processing_time

    if results['errors'] and not unique_entities:
        results['status'] = 'error'
    elif results['errors'] or results['warnings']:
        results['status'] = 'partial_success'

    print(f"✅ Processing completed in {processing_time:.2f} seconds")
    print(f"📈 Final status: {results['status']}")
    print(f"🏢 Total entities: {len(unique_entities)}")

    return results

def extract_entities_simple(df: pd.DataFrame, source_file: str) -> List[Dict[str, Any]]:
    """
    A simple, rule-based entity extractor. This is the deterministic
    foundation upon which our AI will build.
    """
    entities = []
    
    # Smart column detection (no AI, just good rules)
    columns = [col.lower().strip() for col in df.columns]
    
    name_cols = [col for col in df.columns if any(keyword in col.lower() for keyword in 
                 ['name', 'entity', 'company', 'organization', 'facility'])]
    
    if not name_cols:
        return entities  # No entity name column found
    
    name_col = name_cols[0]  # Use first match
    
    # Extract entities row by row
    for idx, row in df.iterrows():
        entity_name = str(row[name_col]).strip()
        
        if entity_name and entity_name.lower() not in ['nan', 'none', '']:
            entity = {
                'name': entity_name,
                'source_file': os.path.basename(source_file),
                'source_row': idx + 2,  # Excel row number (header is row 1)
                'confidence': 0.95,  # High confidence for rule-based extraction
                'is_user_verified': False
            }
            
            # Extract other fields if available
            for col in df.columns:
                col_lower = col.lower()
                if 'country' in col_lower:
                    country = str(row[col]).strip().upper()[:2]  # ISO code
                    if country and country != 'NAN':
                        entity['country'] = country
                elif 'type' in col_lower:
                    entity_type = str(row[col]).strip()
                    if entity_type and entity_type.lower() != 'nan':
                        entity['type'] = entity_type
                elif 'parent' in col_lower or 'reports' in col_lower:
                    parent = str(row[col]).strip()
                    if parent and parent.lower() not in ['nan', 'none', '']:
                        entity['parent'] = parent
            
            entities.append(entity)
    
    return entities

def deduplicate_entities(entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Simple but effective deduplication. In the full platform, this would
    use vector embeddings for semantic deduplication.
    """
    seen_names = set()
    unique_entities = []
    
    for entity in entities:
        name_key = entity['name'].lower().strip()
        if name_key not in seen_names:
            seen_names.add(name_key)
            unique_entities.append(entity)
    
    return unique_entities

def generate_simple_narrative(entities: List[Dict[str, Any]], errors: List[str], warnings: List[str]) -> str:
    """
    Generates a clear, actionable narrative. This is the baseline for
    our AI-powered Strategic Insight Agent.
    """
    if not entities:
        return """
**Organizational Boundary Analysis - No Entities Found**

The analysis was unable to extract organizational entities from the provided files. 

**Next Steps:**
- Please ensure your files contain organizational data with clear entity names.
- In the full Nexus platform, you will be able to use our AI-powered data mapping tool to resolve this automatically.
"""

    total_entities = len(entities)
    countries = set(entity.get('country') for entity in entities if entity.get('country'))
    types = set(entity.get('type') for entity in entities if entity.get('type'))
    with_parents = len([e for e in entities if e.get('parent')])

    narrative = f"""
**Organizational Boundary Analysis Summary**

Successfully identified {total_entities} organizational entities from the provided files.

**Key Findings:**
- **Geographic Footprint**: Operations span {len(countries)} countries.
- **Entity Composition**: {len(types)} different entity types were identified.
- **Hierarchy**: {with_parents} entities have defined parent relationships.

**Data Quality Assessment:**
- **Confidence**: High (based on deterministic, rule-based extraction).
- **Status**: {'Successful' if not errors else 'Partial Success - see errors below'}.

**Next Steps (Powered by Nexus AI):**
1.  **Verify & Enhance**: Review the extracted entity list. Our AI will use your feedback to improve its understanding for next time.
2.  **Explore Relationships**: Use our interactive graph visualization to explore the connections between your entities.
3.  **Generate Insights**: Ask our Carbon, Nature, and Social agents to analyze this structure and generate deeper insights.
"""
    return narrative.strip()

def demo_with_sample_data():
    """
    Creates sample data and demonstrates the foundational processing.
    """
    print("🧪 Creating sample organizational data for demo...")
    
    sample_data = {
        'Company Name': ['GlobalCorp Inc', 'EuroCorp Ltd', 'AsiaCorp Pte', 'SubsidiaryCo', 'FacilityCorp'],
        'Entity Type': ['Parent Company', 'Subsidiary', 'Subsidiary', 'Subsidiary', 'Facility'],
        'Country': ['US', 'GB', 'SG', 'DE', 'FR'],
        'Parent Entity': ['', 'GlobalCorp Inc', 'GlobalCorp Inc', 'EuroCorp Ltd', 'EuroCorp Ltd'],
        'Business Segment': ['Holding', 'Manufacturing', 'Sales', 'Operations', 'Production']
    }
    
    df = pd.DataFrame(sample_data)
    sample_file = 'sample_org_structure.xlsx'
    df.to_excel(sample_file, index=False, engine='openpyxl')
    print(f"📁 Created {sample_file}")

    # Process the sample file
    results = nexus_foundational_processor([sample_file])

    # Display results
    print("\n" + "="*60)
    print("🎯 NEXUS FOUNDATIONAL PROCESSOR - RESULTS")
    print("="*60)

    print(f"📊 Status: {results['status'].upper()}")
    print(f"⏱️ Processing Time: {results['processing_time']:.2f} seconds")
    print(f"🏢 Entities Found: {len(results['entities'])}")

    if results['entities']:
        print(f"\n📋 EXTRACTED ENTITIES (Rule-Based Core):")
        print("-