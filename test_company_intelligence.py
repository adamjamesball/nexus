#!/usr/bin/env python3
"""
Comprehensive test suite for Nexus Company Intelligence System
Test-Engineer Agent Implementation

This test suite validates:
1. LLM client initialization and health
2. Web scraping functionality with fallback strategies
3. Multi-agent company intelligence workflow
4. Mars company test case (as specified by user)
5. End-to-end company input → intelligence gathering pipeline
"""

import asyncio
import json
import sys
import os
import time
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from backend.app.llm import client
from backend.app.intelligence import WebIntelligenceEngine
from backend.app.agents.company_intelligence_real import RealCompanyIntelligenceAgent
from backend.app.config import get_settings


class CompanyIntelligenceTestSuite:
    """Comprehensive test suite for company intelligence gathering"""

    def __init__(self):
        self.settings = get_settings()
        self.test_results = {
            "llm_tests": {},
            "web_scraping_tests": {},
            "agent_tests": {},
            "mars_test_case": {},
            "performance_metrics": {},
            "overall_status": "pending"
        }
        self.start_time = time.time()

    async def run_all_tests(self):
        """Execute comprehensive test suite"""
        print("🚀 Starting Nexus Company Intelligence Test Suite")
        print("=" * 60)

        try:
            # Test 1: LLM System Health
            await self.test_llm_initialization()
            await self.test_llm_health_check()

            # Test 2: Web Scraping System
            await self.test_web_scraping_functionality()
            await self.test_search_fallback_strategies()

            # Test 3: Multi-Agent System
            await self.test_company_intelligence_agent()

            # Test 4: Mars Company Test Case (USER REQUIREMENT)
            await self.test_mars_company_case()

            # Test 5: Performance & Reliability
            await self.test_performance_benchmarks()

            # Generate final report
            await self.generate_test_report()

        except Exception as e:
            print(f"❌ Test suite failed with critical error: {e}")
            self.test_results["overall_status"] = "failed"
            self.test_results["critical_error"] = str(e)

    async def test_llm_initialization(self):
        """Test LLM client initialization and configuration"""
        print("\n🔧 Testing LLM Client Initialization...")

        try:
            # Test client initialization
            await client.initialize()
            self.test_results["llm_tests"]["initialization"] = {
                "status": "passed",
                "message": "LLM client initialized successfully"
            }
            print("  ✅ LLM client initialization successful")

            # Test provider availability
            providers = await client.get_available_providers()
            self.test_results["llm_tests"]["available_providers"] = {
                "status": "passed" if providers else "failed",
                "providers": providers,
                "count": len(providers)
            }
            print(f"  ✅ Available LLM providers: {providers}")

        except Exception as e:
            self.test_results["llm_tests"]["initialization"] = {
                "status": "failed",
                "error": str(e)
            }
            print(f"  ❌ LLM initialization failed: {e}")

    async def test_llm_health_check(self):
        """Test LLM system health and basic functionality"""
        print("\n🏥 Testing LLM Health Check...")

        try:
            health_status = await client.health_check()
            healthy_providers = [p for p, status in health_status.get("providers", {}).items()
                               if status.get("status") == "healthy"]

            self.test_results["llm_tests"]["health_check"] = {
                "status": "passed" if healthy_providers else "failed",
                "healthy_providers": healthy_providers,
                "health_details": health_status
            }

            if healthy_providers:
                print(f"  ✅ Healthy LLM providers: {healthy_providers}")
            else:
                print("  ❌ No healthy LLM providers found")

        except Exception as e:
            self.test_results["llm_tests"]["health_check"] = {
                "status": "failed",
                "error": str(e)
            }
            print(f"  ❌ LLM health check failed: {e}")

    async def test_web_scraping_functionality(self):
        """Test web scraping with various search strategies"""
        print("\n🌐 Testing Web Scraping Functionality...")

        try:
            async with WebIntelligenceEngine() as web_engine:
                # Test basic search functionality
                test_query = "Apple Inc company about"
                search_results = await web_engine._search_google(test_query, 5)

                self.test_results["web_scraping_tests"]["basic_search"] = {
                    "status": "passed" if search_results else "partial",
                    "query": test_query,
                    "results_count": len(search_results),
                    "sample_results": search_results[:3]
                }

                if search_results:
                    print(f"  ✅ Basic search successful: {len(search_results)} results")
                else:
                    print("  ⚠️  Basic search returned no results (testing fallback)")

                # Test URL scraping
                if search_results:
                    test_url = search_results[0]
                    scraped_data = await web_engine._scrape_url(test_url)

                    self.test_results["web_scraping_tests"]["url_scraping"] = {
                        "status": "passed" if scraped_data else "failed",
                        "test_url": test_url,
                        "scraped_content_length": len(scraped_data.get("content", "")) if scraped_data else 0
                    }

                    if scraped_data:
                        print(f"  ✅ URL scraping successful: {len(scraped_data['content'])} chars")
                    else:
                        print(f"  ❌ URL scraping failed for: {test_url}")

        except Exception as e:
            self.test_results["web_scraping_tests"]["error"] = str(e)
            print(f"  ❌ Web scraping test failed: {e}")

    async def test_search_fallback_strategies(self):
        """Test fallback search strategies when primary search fails"""
        print("\n🔄 Testing Search Fallback Strategies...")

        try:
            async with WebIntelligenceEngine() as web_engine:
                # Test fallback search
                test_query = "Microsoft Corporation"
                fallback_results = await web_engine._fallback_search_strategy(test_query, 3)

                self.test_results["web_scraping_tests"]["fallback_search"] = {
                    "status": "passed" if fallback_results else "failed",
                    "query": test_query,
                    "fallback_results_count": len(fallback_results),
                    "fallback_results": fallback_results
                }

                if fallback_results:
                    print(f"  ✅ Fallback search successful: {len(fallback_results)} results")
                else:
                    print("  ❌ Fallback search failed")

                # Test website pattern generation
                website_guesses = web_engine._generate_company_website_guesses("Tesla Motors")
                self.test_results["web_scraping_tests"]["website_guessing"] = {
                    "status": "passed" if website_guesses else "failed",
                    "guesses": website_guesses
                }

                if website_guesses:
                    print(f"  ✅ Website guessing successful: {website_guesses}")
                else:
                    print("  ❌ Website guessing failed")

        except Exception as e:
            self.test_results["web_scraping_tests"]["fallback_error"] = str(e)
            print(f"  ❌ Fallback strategy test failed: {e}")

    async def test_company_intelligence_agent(self):
        """Test the multi-agent company intelligence workflow"""
        print("\n🤖 Testing Company Intelligence Agent...")

        try:
            agent = RealCompanyIntelligenceAgent()

            # Test company profile discovery
            test_company = "Nike"
            print(f"  🔍 Discovering profile for: {test_company}")

            company_profile = await agent.discover_company_profile(test_company)

            self.test_results["agent_tests"]["profile_discovery"] = {
                "status": "passed" if company_profile else "failed",
                "company": test_company,
                "profile_confidence": company_profile.confidence if company_profile else 0,
                "industry": company_profile.industry if company_profile else "Unknown",
                "websites_found": len(company_profile.websites) if company_profile else 0
            }

            if company_profile and company_profile.confidence > 0.3:
                print(f"  ✅ Profile discovery successful: {company_profile.industry} company")

                # Test document scouting
                print("  📄 Scouting sustainability documents...")
                discovered_docs = await agent.scout_sustainability_documents(company_profile)

                self.test_results["agent_tests"]["document_scouting"] = {
                    "status": "passed" if discovered_docs else "partial",
                    "documents_found": len(discovered_docs),
                    "avg_confidence": sum(doc.confidence for doc in discovered_docs) / len(discovered_docs) if discovered_docs else 0
                }

                if discovered_docs:
                    print(f"  ✅ Document scouting successful: {len(discovered_docs)} documents")
                else:
                    print("  ⚠️  No sustainability documents found")

                # Test magic moment insights
                print("  ✨ Generating magic moment insights...")
                insights = await agent.generate_magic_moment_insights(company_profile, discovered_docs)

                self.test_results["agent_tests"]["magic_moments"] = {
                    "status": "passed" if insights else "failed",
                    "insights_generated": len(insights),
                    "insight_types": list(set(insight.insight_type for insight in insights)) if insights else []
                }

                if insights:
                    print(f"  ✅ Magic moment insights generated: {len(insights)} insights")
                else:
                    print("  ❌ Magic moment generation failed")

            else:
                print(f"  ❌ Profile discovery failed or low confidence: {company_profile.confidence if company_profile else 0}")

        except Exception as e:
            self.test_results["agent_tests"]["error"] = str(e)
            print(f"  ❌ Agent test failed: {e}")

    async def test_mars_company_case(self):
        """Test the specific Mars company case as requested by user"""
        print("\n🔴 Testing Mars Company Case (USER REQUIREMENT)...")

        try:
            agent = RealCompanyIntelligenceAgent()

            # Test Mars company intelligence gathering
            mars_company = "Mars"
            print(f"  🏭 Starting comprehensive Mars company analysis...")

            start_time = time.time()

            # Step 1: Company profile discovery
            print("  📊 Step 1: Discovering Mars company profile...")
            mars_profile = await agent.discover_company_profile(mars_company)

            # Step 2: Document scouting
            print("  🔍 Step 2: Scouting Mars sustainability documents...")
            mars_docs = await agent.scout_sustainability_documents(mars_profile)

            # Step 3: Insight generation
            print("  💡 Step 3: Generating Mars intelligence insights...")
            mars_insights = await agent.generate_magic_moment_insights(mars_profile, mars_docs)

            processing_time = time.time() - start_time

            self.test_results["mars_test_case"] = {
                "status": "passed" if mars_profile and mars_profile.confidence > 0.2 else "partial",
                "company_name": mars_company,
                "processing_time_seconds": round(processing_time, 2),
                "profile": {
                    "name": mars_profile.name,
                    "industry": mars_profile.industry,
                    "confidence": mars_profile.confidence,
                    "websites": mars_profile.websites
                },
                "documents_discovered": len(mars_docs),
                "insights_generated": len(mars_insights),
                "sustainability_focus": mars_profile.sustainability_profile.get("has_sustainability_focus", False) if mars_profile.sustainability_profile else False
            }

            # Detailed results
            print(f"  🏭 Mars Profile: {mars_profile.industry} company")
            print(f"  🌐 Websites: {mars_profile.websites}")
            print(f"  📄 Documents found: {len(mars_docs)}")
            print(f"  💡 Insights generated: {len(mars_insights)}")
            print(f"  ⏱️  Processing time: {processing_time:.2f}s")
            print(f"  🎯 Confidence score: {mars_profile.confidence:.2f}")

            if mars_profile.confidence > 0.5:
                print("  ✅ Mars test case: HIGH CONFIDENCE SUCCESS")
            elif mars_profile.confidence > 0.2:
                print("  ⚠️  Mars test case: PARTIAL SUCCESS (acceptable)")
            else:
                print("  ❌ Mars test case: LOW CONFIDENCE")

        except Exception as e:
            self.test_results["mars_test_case"] = {
                "status": "failed",
                "error": str(e)
            }
            print(f"  ❌ Mars test case failed: {e}")

    async def test_performance_benchmarks(self):
        """Test system performance and reliability metrics"""
        print("\n⚡ Testing Performance Benchmarks...")

        try:
            # Test concurrent operations
            start_time = time.time()

            async with WebIntelligenceEngine() as web_engine:
                # Concurrent search test
                test_companies = ["Google", "Amazon", "Tesla"]
                tasks = [web_engine._search_google(f"{company} company", 3) for company in test_companies]
                concurrent_results = await asyncio.gather(*tasks, return_exceptions=True)

            concurrent_time = time.time() - start_time

            successful_searches = sum(1 for result in concurrent_results
                                    if isinstance(result, list) and len(result) > 0)

            self.test_results["performance_metrics"] = {
                "concurrent_search_time": round(concurrent_time, 2),
                "successful_concurrent_searches": successful_searches,
                "total_concurrent_searches": len(test_companies),
                "success_rate": successful_searches / len(test_companies)
            }

            print(f"  ⚡ Concurrent search performance: {concurrent_time:.2f}s")
            print(f"  📈 Success rate: {successful_searches}/{len(test_companies)} ({(successful_searches/len(test_companies)*100):.1f}%)")

        except Exception as e:
            self.test_results["performance_metrics"]["error"] = str(e)
            print(f"  ❌ Performance test failed: {e}")

    async def generate_test_report(self):
        """Generate comprehensive test report"""
        total_time = time.time() - self.start_time

        print("\n" + "=" * 60)
        print("📋 NEXUS COMPANY INTELLIGENCE TEST REPORT")
        print("=" * 60)

        # Overall status determination
        critical_failures = []

        # Check critical systems
        if self.test_results["llm_tests"].get("initialization", {}).get("status") != "passed":
            critical_failures.append("LLM System Initialization")

        if self.test_results["agent_tests"].get("profile_discovery", {}).get("status") not in ["passed", "partial"]:
            critical_failures.append("Company Profile Discovery")

        mars_status = self.test_results["mars_test_case"].get("status", "failed")
        if mars_status == "failed":
            critical_failures.append("Mars Test Case")

        # Determine overall status
        if not critical_failures:
            if mars_status == "passed":
                self.test_results["overall_status"] = "passed"
                print("🎉 Overall Status: PASSED ✅")
            else:
                self.test_results["overall_status"] = "partial"
                print("⚠️  Overall Status: PARTIAL SUCCESS ⚠️")
        else:
            self.test_results["overall_status"] = "failed"
            print("❌ Overall Status: FAILED ❌")
            print(f"   Critical failures: {', '.join(critical_failures)}")

        print(f"\n⏱️  Total execution time: {total_time:.2f} seconds")

        # Component status summary
        print("\n🔧 Component Status Summary:")
        print(f"  • LLM System: {self._get_component_status('llm_tests')}")
        print(f"  • Web Scraping: {self._get_component_status('web_scraping_tests')}")
        print(f"  • Multi-Agent System: {self._get_component_status('agent_tests')}")
        print(f"  • Mars Test Case: {mars_status.upper()}")

        # Key metrics
        if "mars_test_case" in self.test_results and "profile" in self.test_results["mars_test_case"]:
            mars_data = self.test_results["mars_test_case"]
            print(f"\n🔴 Mars Company Results:")
            print(f"  • Industry: {mars_data['profile']['industry']}")
            print(f"  • Confidence: {mars_data['profile']['confidence']:.2f}")
            print(f"  • Documents: {mars_data['documents_discovered']}")
            print(f"  • Insights: {mars_data['insights_generated']}")
            print(f"  • Processing time: {mars_data['processing_time_seconds']}s")

        # Save detailed results
        report_path = Path("test_results.json")
        with open(report_path, "w") as f:
            json.dump(self.test_results, f, indent=2)

        print(f"\n💾 Detailed results saved to: {report_path}")
        print("\n" + "=" * 60)

        return self.test_results["overall_status"]

    def _get_component_status(self, component_key):
        """Get overall status for a test component"""
        component_tests = self.test_results.get(component_key, {})

        if not component_tests:
            return "NOT TESTED"

        statuses = [test.get("status", "unknown") for test in component_tests.values()
                   if isinstance(test, dict) and "status" in test]

        if not statuses:
            return "NO STATUS"

        if all(status == "passed" for status in statuses):
            return "PASSED ✅"
        elif any(status == "passed" for status in statuses):
            return "PARTIAL ⚠️"
        else:
            return "FAILED ❌"


async def main():
    """Run the comprehensive test suite"""
    test_suite = CompanyIntelligenceTestSuite()

    try:
        overall_status = await test_suite.run_all_tests()

        if overall_status == "passed":
            print("\n🎉 All tests completed successfully! System ready for production.")
            sys.exit(0)
        elif overall_status == "partial":
            print("\n⚠️  Tests completed with partial success. Manual review recommended.")
            sys.exit(1)
        else:
            print("\n❌ Tests failed. System requires fixes before deployment.")
            sys.exit(2)

    except KeyboardInterrupt:
        print("\n⏹️  Test suite interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 Test suite crashed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())