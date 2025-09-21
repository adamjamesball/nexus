"""
Company research and benchmarking engine with AI-powered insights
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import hashlib

from .web_scraper import WebIntelligenceEngine, ScrapedDocument, CompanyProfile
from ..llm import LLMMessage
from ..llm.client import client
from ..processing import DocumentProcessor, ProcessedDocument


logger = logging.getLogger(__name__)


@dataclass
class MagicMomentInsight:
    """Individual insight for the magic moment experience"""
    id: str
    title: str
    description: str
    insight_type: str  # "opportunity", "risk", "benchmark", "recommendation"
    confidence: float
    source: str
    impact: str  # "high", "medium", "low"
    data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CompanyBenchmark:
    """Company benchmarking data"""
    company_name: str
    industry: str
    size: str
    sustainability_maturity: str
    benchmark_scores: Dict[str, float] = field(default_factory=dict)
    peer_comparison: Dict[str, Any] = field(default_factory=dict)
    improvement_areas: List[str] = field(default_factory=list)
    best_practices: List[str] = field(default_factory=list)


class CompanyResearchEngine:
    """Advanced company research with AI-powered analysis and benchmarking"""

    def __init__(self):
        self.web_engine = None
        self.doc_processor = DocumentProcessor()
        self._research_cache: Dict[str, Any] = {}

    async def __aenter__(self):
        """Async context manager entry"""
        self.web_engine = WebIntelligenceEngine()
        await self.web_engine.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.web_engine:
            await self.web_engine.__aexit__(exc_type, exc_val, exc_tb)

    async def generate_magic_moment_insights(
        self,
        company_profile: CompanyProfile,
        discovered_docs: List[ScrapedDocument]
    ) -> List[MagicMomentInsight]:
        """Generate AI-powered insights for the magic moment onboarding experience"""
        logger.info(f"Generating magic moment insights for {company_profile.name}")

        try:
            await client.initialize()

            # Prepare context for AI analysis
            context = self._build_research_context(company_profile, discovered_docs)

            # Generate different types of insights
            insights = []

            # 1. Industry benchmark insights
            benchmark_insights = await self._generate_benchmark_insights(context)
            insights.extend(benchmark_insights)

            # 2. Risk and opportunity insights
            risk_opportunity_insights = await self._generate_risk_opportunity_insights(context)
            insights.extend(risk_opportunity_insights)

            # 3. Quick win recommendations
            quick_win_insights = await self._generate_quick_win_insights(context)
            insights.extend(quick_win_insights)

            # Sort by impact and confidence
            insights.sort(key=lambda x: (x.impact == "high", x.confidence), reverse=True)

            # Return top 5 most impactful insights
            return insights[:5]

        except Exception as e:
            logger.error(f"Magic moment insight generation failed: {e}")
            return self._generate_fallback_insights(company_profile)

    def _build_research_context(
        self,
        company_profile: CompanyProfile,
        discovered_docs: List[ScrapedDocument]
    ) -> Dict[str, Any]:
        """Build comprehensive research context for AI analysis"""
        # Combine all discovered content
        combined_content = ""
        document_types = []

        for doc in discovered_docs[:5]:  # Limit to prevent token overflow
            combined_content += f"{doc.title}: {doc.content[:1000]}\n\n"
            document_types.append(doc.document_type)

        return {
            "company_profile": {
                "name": company_profile.name,
                "industry": company_profile.industry,
                "size": company_profile.size,
                "jurisdiction": company_profile.jurisdiction,
                "employee_count": company_profile.employee_count,
                "sustainability_profile": company_profile.sustainability_profile
            },
            "discovered_content": combined_content,
            "document_types": list(set(document_types)),
            "content_length": len(combined_content),
            "sustainability_indicators": self._extract_sustainability_indicators(combined_content)
        }

    def _extract_sustainability_indicators(self, content: str) -> Dict[str, bool]:
        """Extract sustainability indicators from content"""
        content_lower = content.lower()

        indicators = {
            "has_carbon_reporting": any(term in content_lower for term in ["carbon", "ghg", "greenhouse", "emissions"]),
            "has_esg_framework": any(term in content_lower for term in ["esg", "sustainability report", "csr"]),
            "has_nature_focus": any(term in content_lower for term in ["biodiversity", "nature", "ecosystem", "tnfd"]),
            "has_social_programs": any(term in content_lower for term in ["diversity", "inclusion", "community", "social impact"]),
            "has_governance_structure": any(term in content_lower for term in ["board", "governance", "ethics", "compliance"]),
            "has_science_targets": any(term in content_lower for term in ["science based", "sbti", "net zero"]),
            "has_supply_chain_focus": any(term in content_lower for term in ["supply chain", "supplier", "procurement"])
        }

        return indicators

    async def _generate_benchmark_insights(self, context: Dict[str, Any]) -> List[MagicMomentInsight]:
        """Generate industry benchmark insights"""
        try:
            prompt = f"""
            Based on the company profile and industry context below, generate 2 industry benchmark insights that would be valuable for sustainability consultants.

            Company: {context['company_profile']['name']}
            Industry: {context['company_profile']['industry']}
            Size: {context['company_profile']['size']}

            Sustainability Indicators:
            {json.dumps(context['sustainability_indicators'], indent=2)}

            Generate insights that compare this company to industry benchmarks and highlight gaps or opportunities. Return as JSON:
            [
                {{
                    "title": "Insight title",
                    "description": "Detailed description with specific benchmarks",
                    "insight_type": "benchmark",
                    "confidence": 0.8,
                    "impact": "high|medium|low",
                    "source": "industry_analysis",
                    "data": {{"benchmark_metric": "value", "peer_average": "value"}}
                }}
            ]
            """

            messages = [LLMMessage(role="user", content=prompt)]
            response = await client.generate(
                messages=messages,
                max_tokens=800,
                temperature=0.3
            )

            insights_data = json.loads(response.content)
            insights = []

            for i, insight_data in enumerate(insights_data):
                insight = MagicMomentInsight(
                    id=f"benchmark_{i}_{hashlib.md5(insight_data['title'].encode()).hexdigest()[:8]}",
                    title=insight_data['title'],
                    description=insight_data['description'],
                    insight_type=insight_data['insight_type'],
                    confidence=insight_data['confidence'],
                    source=insight_data['source'],
                    impact=insight_data['impact'],
                    data=insight_data.get('data', {})
                )
                insights.append(insight)

            return insights

        except Exception as e:
            logger.error(f"Benchmark insight generation failed: {e}")
            return []

    async def _generate_risk_opportunity_insights(self, context: Dict[str, Any]) -> List[MagicMomentInsight]:
        """Generate risk and opportunity insights"""
        try:
            prompt = f"""
            Analyze the company information to identify key sustainability risks and opportunities.

            Company Profile:
            {json.dumps(context['company_profile'], indent=2)}

            Document Content Summary:
            {context['discovered_content'][:2000]}

            Generate 2 insights focusing on:
            1. One major sustainability risk this company should address
            2. One significant opportunity they could capitalize on

            Return as JSON array with this structure:
            [
                {{
                    "title": "Risk/Opportunity title",
                    "description": "Specific description with business impact",
                    "insight_type": "risk|opportunity",
                    "confidence": 0.7,
                    "impact": "high|medium|low",
                    "source": "risk_analysis",
                    "data": {{"risk_factor": "value", "potential_impact": "description"}}
                }}
            ]
            """

            messages = [LLMMessage(role="user", content=prompt)]
            response = await client.generate(
                messages=messages,
                max_tokens=800,
                temperature=0.4
            )

            insights_data = json.loads(response.content)
            insights = []

            for i, insight_data in enumerate(insights_data):
                insight = MagicMomentInsight(
                    id=f"risk_opp_{i}_{hashlib.md5(insight_data['title'].encode()).hexdigest()[:8]}",
                    title=insight_data['title'],
                    description=insight_data['description'],
                    insight_type=insight_data['insight_type'],
                    confidence=insight_data['confidence'],
                    source=insight_data['source'],
                    impact=insight_data['impact'],
                    data=insight_data.get('data', {})
                )
                insights.append(insight)

            return insights

        except Exception as e:
            logger.error(f"Risk/opportunity insight generation failed: {e}")
            return []

    async def _generate_quick_win_insights(self, context: Dict[str, Any]) -> List[MagicMomentInsight]:
        """Generate quick win recommendation insights"""
        try:
            prompt = f"""
            Based on the company's current sustainability position, identify 1-2 quick wins they could implement within 3-6 months.

            Company: {context['company_profile']['name']}
            Industry: {context['company_profile']['industry']}
            Current sustainability indicators: {json.dumps(context['sustainability_indicators'])}

            Focus on actionable recommendations that:
            1. Can be implemented quickly (3-6 months)
            2. Have high impact on sustainability performance
            3. Are realistic for their industry and size

            Return as JSON:
            [
                {{
                    "title": "Quick win title",
                    "description": "Specific implementation steps and expected outcomes",
                    "insight_type": "recommendation",
                    "confidence": 0.9,
                    "impact": "medium|high",
                    "source": "quick_wins_analysis",
                    "data": {{"implementation_time": "3-6 months", "expected_benefit": "description"}}
                }}
            ]
            """

            messages = [LLMMessage(role="user", content=prompt)]
            response = await client.generate(
                messages=messages,
                max_tokens=600,
                temperature=0.2
            )

            insights_data = json.loads(response.content)
            insights = []

            for i, insight_data in enumerate(insights_data):
                insight = MagicMomentInsight(
                    id=f"quick_win_{i}_{hashlib.md5(insight_data['title'].encode()).hexdigest()[:8]}",
                    title=insight_data['title'],
                    description=insight_data['description'],
                    insight_type=insight_data['insight_type'],
                    confidence=insight_data['confidence'],
                    source=insight_data['source'],
                    impact=insight_data['impact'],
                    data=insight_data.get('data', {})
                )
                insights.append(insight)

            return insights

        except Exception as e:
            logger.error(f"Quick win insight generation failed: {e}")
            return []

    def _generate_fallback_insights(self, company_profile: CompanyProfile) -> List[MagicMomentInsight]:
        """Generate fallback insights when AI analysis fails"""
        insights = []

        # Industry-specific fallback insight
        industry_insight = MagicMomentInsight(
            id=f"fallback_industry_{hashlib.md5(company_profile.name.encode()).hexdigest()[:8]}",
            title=f"{company_profile.industry} Industry Sustainability Trends",
            description=f"Companies in {company_profile.industry} are increasingly focusing on sustainability initiatives. Key areas include carbon footprint reduction, supply chain transparency, and stakeholder engagement.",
            insight_type="benchmark",
            confidence=0.6,
            source="industry_knowledge",
            impact="medium",
            data={"industry": company_profile.industry}
        )
        insights.append(industry_insight)

        # Size-specific insight
        size_insight = MagicMomentInsight(
            id=f"fallback_size_{hashlib.md5(company_profile.name.encode()).hexdigest()[:8]}",
            title="Sustainability Maturity Assessment",
            description=f"As a {company_profile.size} company, focusing on foundational sustainability practices like energy efficiency, waste reduction, and basic ESG reporting could provide quick wins.",
            insight_type="recommendation",
            confidence=0.7,
            source="size_analysis",
            impact="high",
            data={"company_size": company_profile.size}
        )
        insights.append(size_insight)

        return insights

    async def benchmark_company(
        self,
        company_profile: CompanyProfile,
        peer_companies: List[str] = None
    ) -> CompanyBenchmark:
        """Generate comprehensive company benchmarking analysis"""
        logger.info(f"Benchmarking {company_profile.name}")

        try:
            await client.initialize()

            # Build benchmarking context
            benchmark_context = await self._build_benchmark_context(company_profile, peer_companies)

            # Generate benchmark scores
            benchmark_scores = await self._calculate_benchmark_scores(benchmark_context)

            # Identify improvement areas
            improvement_areas = await self._identify_improvement_areas(benchmark_context)

            # Extract best practices
            best_practices = await self._extract_best_practices(benchmark_context)

            return CompanyBenchmark(
                company_name=company_profile.name,
                industry=company_profile.industry,
                size=company_profile.size,
                sustainability_maturity=self._assess_sustainability_maturity(company_profile),
                benchmark_scores=benchmark_scores,
                improvement_areas=improvement_areas,
                best_practices=best_practices
            )

        except Exception as e:
            logger.error(f"Company benchmarking failed: {e}")
            return self._generate_fallback_benchmark(company_profile)

    async def _build_benchmark_context(
        self,
        company_profile: CompanyProfile,
        peer_companies: List[str] = None
    ) -> Dict[str, Any]:
        """Build context for benchmarking analysis"""
        context = {
            "target_company": company_profile,
            "industry_context": self._get_industry_context(company_profile.industry),
            "size_context": self._get_size_context(company_profile.size),
            "peer_data": []
        }

        # If peer companies specified, gather limited data about them
        if peer_companies:
            for peer in peer_companies[:3]:  # Limit to 3 peers to avoid overload
                try:
                    # Basic web intelligence on peers
                    peer_profile = await self.web_engine.discover_company_profile(peer)
                    context["peer_data"].append(peer_profile)
                except Exception as e:
                    logger.warning(f"Could not gather data on peer company {peer}: {e}")

        return context

    def _get_industry_context(self, industry: str) -> Dict[str, Any]:
        """Get industry-specific sustainability context"""
        industry_contexts = {
            "technology": {
                "key_metrics": ["energy_efficiency", "e_waste", "carbon_neutral_operations"],
                "typical_maturity": "advanced",
                "common_frameworks": ["GRI", "CDP", "SASB"]
            },
            "manufacturing": {
                "key_metrics": ["scope_1_emissions", "water_usage", "waste_reduction"],
                "typical_maturity": "intermediate",
                "common_frameworks": ["GRI", "ISO_14001", "CDP"]
            },
            "financial": {
                "key_metrics": ["financed_emissions", "sustainable_lending", "esg_integration"],
                "typical_maturity": "advanced",
                "common_frameworks": ["TCFD", "GRI", "SASB"]
            }
        }

        return industry_contexts.get(industry.lower(), {
            "key_metrics": ["carbon_footprint", "esg_reporting", "stakeholder_engagement"],
            "typical_maturity": "baseline",
            "common_frameworks": ["GRI"]
        })

    def _get_size_context(self, size: str) -> Dict[str, Any]:
        """Get size-specific sustainability context"""
        size_contexts = {
            "startup": {"focus_areas": ["foundation_building"], "resource_level": "limited"},
            "small": {"focus_areas": ["operational_efficiency"], "resource_level": "moderate"},
            "medium": {"focus_areas": ["systematic_approach"], "resource_level": "good"},
            "large": {"focus_areas": ["comprehensive_strategy"], "resource_level": "extensive"},
            "enterprise": {"focus_areas": ["leadership_innovation"], "resource_level": "unlimited"}
        }

        return size_contexts.get(size.lower(), {
            "focus_areas": ["basic_compliance"],
            "resource_level": "unknown"
        })

    async def _calculate_benchmark_scores(self, context: Dict[str, Any]) -> Dict[str, float]:
        """Calculate benchmark scores across different dimensions"""
        # Simplified scoring based on available data
        company = context["target_company"]
        sustainability_profile = company.sustainability_profile or {}

        scores = {
            "overall_maturity": 0.5,  # Default baseline
            "carbon_management": 0.3,
            "social_impact": 0.4,
            "governance": 0.6,
            "reporting_transparency": 0.5
        }

        # Adjust scores based on sustainability profile
        if sustainability_profile.get("has_sustainability_focus"):
            scores["overall_maturity"] += 0.2
            scores["reporting_transparency"] += 0.2

        sustainability_mentions = sustainability_profile.get("mentions", 0)
        if sustainability_mentions > 5:
            scores["carbon_management"] += 0.3
            scores["social_impact"] += 0.2

        # Normalize scores to 0-1 range
        for key in scores:
            scores[key] = min(1.0, scores[key])

        return scores

    async def _identify_improvement_areas(self, context: Dict[str, Any]) -> List[str]:
        """Identify key areas for improvement"""
        company = context["target_company"]
        industry_context = context["industry_context"]

        improvement_areas = []

        # Industry-specific improvements
        key_metrics = industry_context.get("key_metrics", [])
        for metric in key_metrics:
            improvement_areas.append(f"Enhance {metric.replace('_', ' ')} measurement and reporting")

        # Size-specific improvements
        size_context = context["size_context"]
        focus_areas = size_context.get("focus_areas", [])
        for area in focus_areas:
            improvement_areas.append(f"Strengthen {area.replace('_', ' ')} capabilities")

        return improvement_areas[:5]  # Return top 5

    async def _extract_best_practices(self, context: Dict[str, Any]) -> List[str]:
        """Extract relevant best practices"""
        industry = context["target_company"].industry

        # Industry-specific best practices
        best_practices_db = {
            "technology": [
                "Implement cloud-based energy monitoring systems",
                "Establish e-waste recycling partnerships",
                "Set science-based carbon reduction targets"
            ],
            "manufacturing": [
                "Deploy IoT sensors for energy optimization",
                "Implement circular economy principles in production",
                "Establish supplier sustainability scorecards"
            ],
            "financial": [
                "Integrate climate risk into investment decisions",
                "Develop green financing products",
                "Implement TCFD-aligned reporting"
            ]
        }

        return best_practices_db.get(industry.lower(), [
            "Establish baseline sustainability metrics",
            "Engage stakeholders in sustainability planning",
            "Implement energy efficiency measures"
        ])

    def _assess_sustainability_maturity(self, company_profile: CompanyProfile) -> str:
        """Assess overall sustainability maturity level"""
        sustainability_profile = company_profile.sustainability_profile or {}
        mentions = sustainability_profile.get("mentions", 0)
        has_focus = sustainability_profile.get("has_sustainability_focus", False)

        if mentions >= 10 and has_focus:
            return "advanced"
        elif mentions >= 5 or has_focus:
            return "intermediate"
        elif mentions >= 2:
            return "baseline"
        else:
            return "initiated"

    def _generate_fallback_benchmark(self, company_profile: CompanyProfile) -> CompanyBenchmark:
        """Generate fallback benchmark when analysis fails"""
        return CompanyBenchmark(
            company_name=company_profile.name,
            industry=company_profile.industry,
            size=company_profile.size,
            sustainability_maturity="baseline",
            benchmark_scores={
                "overall_maturity": 0.5,
                "carbon_management": 0.4,
                "social_impact": 0.4,
                "governance": 0.5,
                "reporting_transparency": 0.3
            },
            improvement_areas=[
                "Establish sustainability baseline metrics",
                "Develop ESG reporting framework",
                "Implement energy efficiency initiatives"
            ],
            best_practices=[
                "Start with materiality assessment",
                "Set up sustainability governance structure",
                "Begin stakeholder engagement process"
            ]
        )