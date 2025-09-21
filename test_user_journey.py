#!/usr/bin/env python3
"""
End-to-End User Journey Tests for Nexus Company Intelligence
User-Journey-Tester Agent Implementation

This test suite validates the complete user workflow:
1. User inputs company name ("Mars")
2. System performs web searches and document retrieval
3. Multi-agent collaboration for data processing
4. Comprehensive company intelligence generation
5. User receives actionable insights

This ensures the system works as intended from the user's perspective.
"""

import asyncio
import httpx
import json
import sys
import time
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from backend.app.main import app
from backend.app.agents.company_intelligence_real import RealCompanyIntelligenceAgent


class UserJourneyTestSuite:
    """End-to-end user journey validation"""

    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_results = {
            "user_journeys": {},
            "api_endpoints": {},
            "mars_journey": {},
            "performance_metrics": {},
            "user_experience": {}
        }

    async def run_user_journey_tests(self):
        """Execute complete user journey test suite"""
        print("🚀 Starting User Journey Test Suite")
        print("Testing complete user workflow: Company Input → Intelligence Gathering")
        print("=" * 70)

        try:
            # Test 1: API Health and Availability
            await self.test_api_health()

            # Test 2: Company Search Journey (Mars)
            await self.test_mars_company_journey()

            # Test 3: Alternative Company Journeys
            await self.test_multiple_company_journeys()

            # Test 4: Error Handling and Edge Cases
            await self.test_error_scenarios()

            # Test 5: Performance and User Experience
            await self.test_performance_characteristics()

            # Generate user journey report
            await self.generate_journey_report()

        except Exception as e:
            print(f"❌ User journey tests failed: {e}")
            self.test_results["critical_error"] = str(e)

    async def test_api_health(self):
        """Test API health and basic functionality"""
        print("\n🏥 Testing API Health and Availability...")

        try:
            async with httpx.AsyncClient() as client:
                # Test basic health endpoint
                response = await client.get(f"{self.base_url}/health")

                self.test_results["api_endpoints"]["health"] = {
                    "status": "passed" if response.status_code == 200 else "failed",
                    "status_code": response.status_code,
                    "response_time_ms": response.elapsed.total_seconds() * 1000
                }

                if response.status_code == 200:
                    print("  ✅ Health endpoint accessible")
                else:
                    print(f"  ❌ Health endpoint failed: {response.status_code}")

                # Test LLM health endpoint
                llm_response = await client.get(f"{self.base_url}/v2/llm/health")

                self.test_results["api_endpoints"]["llm_health"] = {
                    "status": "passed" if llm_response.status_code == 200 else "failed",
                    "status_code": llm_response.status_code
                }

                if llm_response.status_code == 200:
                    llm_data = llm_response.json()
                    print(f"  ✅ LLM system status: {llm_data.get('status', 'unknown')}")
                else:
                    print(f"  ❌ LLM health check failed: {llm_response.status_code}")

        except Exception as e:
            self.test_results["api_endpoints"]["error"] = str(e)
            print(f"  ❌ API health test failed: {e}")

    async def test_mars_company_journey(self):
        """Test the complete Mars company journey as specified by user"""
        print("\n🔴 Testing Mars Company User Journey (CRITICAL REQUIREMENT)...")

        journey_start = time.time()

        try:
            # Simulate user workflow: Input "Mars" → Get Intelligence
            company_name = "Mars"
            print(f"  👤 User Action: Searching for company '{company_name}'")

            async with httpx.AsyncClient(timeout=60.0) as client:
                # Step 1: Create session (user starts analysis)
                print("  🔄 Step 1: Creating user session...")
                session_response = await client.post(f"{self.base_url}/v2/sessions")

                if session_response.status_code != 200:
                    raise Exception(f"Session creation failed: {session_response.status_code}")

                session_data = session_response.json()
                session_id = session_data["session_id"]
                print(f"  ✅ Session created: {session_id}")

                # Step 2: Company search and intelligence gathering
                print(f"  🔍 Step 2: Searching for '{company_name}' company intelligence...")

                search_payload = {"company_name": company_name}
                search_response = await client.post(
                    f"{self.base_url}/v2/companies/search",
                    json=search_payload
                )

                if search_response.status_code == 200:
                    company_data = search_response.json()
                    print(f"  ✅ Company profile discovered:")
                    print(f"    • Name: {company_data.get('name', 'Unknown')}")
                    print(f"    • Industry: {company_data.get('industry', 'Unknown')}")
                    print(f"    • Confidence: {company_data.get('confidence', 0):.2f}")
                    print(f"    • Websites: {len(company_data.get('websites', []))}")
                    print(f"    • Documents: {len(company_data.get('discovered_documents', []))}")

                    # Step 3: Generate magic moment insights
                    print("  ✨ Step 3: Generating AI-powered insights...")

                    magic_payload = {
                        "company_name": company_name,
                        "industry": company_data.get("industry"),
                        "size": company_data.get("size")
                    }

                    magic_response = await client.post(
                        f"{self.base_url}/v2/companies/magic-moment",
                        json=magic_payload
                    )

                    journey_time = time.time() - journey_start

                    if magic_response.status_code == 200:
                        magic_data = magic_response.json()
                        insights = magic_data.get("insights", [])

                        print(f"  🎯 Magic moment insights generated: {len(insights)}")
                        for i, insight in enumerate(insights[:3], 1):
                            print(f"    {i}. {insight.get('title', 'Untitled')}")
                            print(f"       Impact: {insight.get('impact', 'unknown').upper()}")

                        # Record successful journey
                        self.test_results["mars_journey"] = {
                            "status": "passed",
                            "company_name": company_name,
                            "total_journey_time": round(journey_time, 2),
                            "profile_confidence": company_data.get("confidence", 0),
                            "documents_found": len(company_data.get("discovered_documents", [])),
                            "insights_generated": len(insights),
                            "processing_time_ms": magic_data.get("processing_time_ms", 0),
                            "user_experience": "smooth" if journey_time < 30 else "slow"
                        }

                        print(f"  ⏱️  Total journey time: {journey_time:.2f}s")
                        print("  🎉 Mars company journey: SUCCESS ✅")

                    else:
                        raise Exception(f"Magic moment generation failed: {magic_response.status_code}")

                else:
                    raise Exception(f"Company search failed: {search_response.status_code}")

        except Exception as e:
            self.test_results["mars_journey"] = {
                "status": "failed",
                "error": str(e),
                "journey_time": time.time() - journey_start
            }
            print(f"  ❌ Mars journey failed: {e}")

    async def test_multiple_company_journeys(self):
        """Test user journeys with multiple different companies"""
        print("\n🏢 Testing Multiple Company User Journeys...")

        test_companies = ["Google", "Tesla", "Apple", "Microsoft"]

        for company in test_companies:
            print(f"  🔍 Testing {company} company journey...")

            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    # Quick company search test
                    search_payload = {"company_name": company}
                    response = await client.post(
                        f"{self.base_url}/v2/companies/search",
                        json=search_payload
                    )

                    if response.status_code == 200:
                        data = response.json()
                        confidence = data.get("confidence", 0)

                        self.test_results["user_journeys"][company] = {
                            "status": "passed" if confidence > 0.3 else "partial",
                            "confidence": confidence,
                            "industry": data.get("industry", "Unknown"),
                            "documents": len(data.get("discovered_documents", []))
                        }

                        if confidence > 0.5:
                            print(f"    ✅ {company}: High confidence ({confidence:.2f})")
                        elif confidence > 0.3:
                            print(f"    ⚠️  {company}: Moderate confidence ({confidence:.2f})")
                        else:
                            print(f"    ❌ {company}: Low confidence ({confidence:.2f})")
                    else:
                        self.test_results["user_journeys"][company] = {
                            "status": "failed",
                            "error": f"HTTP {response.status_code}"
                        }
                        print(f"    ❌ {company}: API error ({response.status_code})")

            except Exception as e:
                self.test_results["user_journeys"][company] = {
                    "status": "failed",
                    "error": str(e)
                }
                print(f"    ❌ {company}: {e}")

    async def test_error_scenarios(self):
        """Test user experience with error conditions"""
        print("\n⚠️  Testing Error Scenarios and Edge Cases...")

        error_tests = {
            "empty_company_name": "",
            "invalid_company": "XYZ_INVALID_COMPANY_NAME_123",
            "special_characters": "Company@#$%^&*()",
            "very_long_name": "A" * 200
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            for test_name, company_name in error_tests.items():
                try:
                    print(f"  🧪 Testing {test_name}...")

                    search_payload = {"company_name": company_name}
                    response = await client.post(
                        f"{self.base_url}/v2/companies/search",
                        json=search_payload
                    )

                    if response.status_code == 200:
                        data = response.json()
                        confidence = data.get("confidence", 0)

                        if confidence < 0.2:  # Expected for invalid inputs
                            print(f"    ✅ {test_name}: Graceful handling (low confidence)")
                            status = "passed"
                        else:
                            print(f"    ⚠️  {test_name}: Unexpected high confidence")
                            status = "warning"
                    else:
                        print(f"    ✅ {test_name}: Proper error response ({response.status_code})")
                        status = "passed"

                    self.test_results["user_experience"][test_name] = {
                        "status": status,
                        "response_code": response.status_code
                    }

                except Exception as e:
                    print(f"    ❌ {test_name}: {e}")
                    self.test_results["user_experience"][test_name] = {
                        "status": "failed",
                        "error": str(e)
                    }

    async def test_performance_characteristics(self):
        """Test performance and user experience characteristics"""
        print("\n⚡ Testing Performance and User Experience...")

        try:
            # Test response times for typical user workflow
            start_time = time.time()

            async with httpx.AsyncClient(timeout=45.0) as client:
                # Simulate realistic user workflow timing
                companies = ["Amazon", "Nike"]

                for company in companies:
                    company_start = time.time()

                    search_payload = {"company_name": company}
                    response = await client.post(
                        f"{self.base_url}/v2/companies/search",
                        json=search_payload
                    )

                    company_time = time.time() - company_start

                    if response.status_code == 200:
                        # Classify user experience based on timing
                        if company_time < 10:
                            ux_rating = "excellent"
                        elif company_time < 20:
                            ux_rating = "good"
                        elif company_time < 30:
                            ux_rating = "acceptable"
                        else:
                            ux_rating = "slow"

                        print(f"  ⏱️  {company}: {company_time:.2f}s ({ux_rating.upper()})")
                    else:
                        print(f"  ❌ {company}: Failed ({response.status_code})")

            total_time = time.time() - start_time

            self.test_results["performance_metrics"] = {
                "total_test_time": round(total_time, 2),
                "avg_response_time": round(total_time / len(companies), 2),
                "user_experience_rating": "good" if total_time < 40 else "needs_optimization"
            }

            print(f"  📊 Overall performance: {total_time:.2f}s for {len(companies)} companies")

        except Exception as e:
            self.test_results["performance_metrics"]["error"] = str(e)
            print(f"  ❌ Performance test failed: {e}")

    async def generate_journey_report(self):
        """Generate comprehensive user journey test report"""
        print("\n" + "=" * 70)
        print("📋 USER JOURNEY TEST REPORT")
        print("=" * 70)

        # Determine overall journey success
        mars_status = self.test_results.get("mars_journey", {}).get("status", "failed")
        api_working = any(
            test.get("status") == "passed"
            for test in self.test_results.get("api_endpoints", {}).values()
        )

        if mars_status == "passed" and api_working:
            overall_status = "PASSED"
            print("🎉 Overall User Journey Status: PASSED ✅")
            print("   The system successfully handles the Mars company use case!")
        elif mars_status == "partial" or api_working:
            overall_status = "PARTIAL"
            print("⚠️  Overall User Journey Status: PARTIAL SUCCESS ⚠️")
            print("   Basic functionality works, but some issues detected.")
        else:
            overall_status = "FAILED"
            print("❌ Overall User Journey Status: FAILED ❌")
            print("   Critical user workflows are not functioning.")

        # Mars journey details (critical requirement)
        if "mars_journey" in self.test_results:
            mars_data = self.test_results["mars_journey"]
            print(f"\n🔴 Mars Company Journey (CRITICAL):")
            print(f"  • Status: {mars_data.get('status', 'unknown').upper()}")

            if mars_data.get("status") == "passed":
                print(f"  • Journey time: {mars_data.get('total_journey_time', 0)}s")
                print(f"  • Profile confidence: {mars_data.get('profile_confidence', 0):.2f}")
                print(f"  • Documents found: {mars_data.get('documents_found', 0)}")
                print(f"  • Insights generated: {mars_data.get('insights_generated', 0)}")
                print(f"  • User experience: {mars_data.get('user_experience', 'unknown').upper()}")
            else:
                print(f"  • Error: {mars_data.get('error', 'Unknown error')}")

        # User experience summary
        successful_journeys = sum(
            1 for journey in self.test_results.get("user_journeys", {}).values()
            if journey.get("status") in ["passed", "partial"]
        )
        total_journeys = len(self.test_results.get("user_journeys", {}))

        if total_journeys > 0:
            success_rate = (successful_journeys / total_journeys) * 100
            print(f"\n📈 User Journey Success Rate: {successful_journeys}/{total_journeys} ({success_rate:.1f}%)")

        # Performance insights
        if "performance_metrics" in self.test_results:
            perf = self.test_results["performance_metrics"]
            print(f"\n⚡ Performance Summary:")
            print(f"  • Average response time: {perf.get('avg_response_time', 'unknown')}s")
            print(f"  • User experience rating: {perf.get('user_experience_rating', 'unknown').upper()}")

        # Recommendations for user experience
        print(f"\n💡 Recommendations:")
        if overall_status == "PASSED":
            print("  • System ready for user testing")
            print("  • Consider performance optimizations for scale")
        elif overall_status == "PARTIAL":
            print("  • Address failing test cases before production")
            print("  • Monitor performance under load")
        else:
            print("  • Critical fixes required before user testing")
            print("  • Review system architecture and error handling")

        # Save detailed results
        report_path = Path("user_journey_results.json")
        with open(report_path, "w") as f:
            json.dump(self.test_results, f, indent=2)

        print(f"\n💾 Detailed journey results saved to: {report_path}")
        print("\n" + "=" * 70)

        return overall_status


async def main():
    """Run the user journey test suite"""
    journey_tests = UserJourneyTestSuite()

    try:
        overall_status = await journey_tests.run_user_journey_tests()

        if overall_status == "PASSED":
            print("\n🎉 All user journeys completed successfully!")
            print("   System is ready for manual user testing.")
            sys.exit(0)
        elif overall_status == "PARTIAL":
            print("\n⚠️  User journeys partially successful.")
            print("   Manual review recommended before production.")
            sys.exit(1)
        else:
            print("\n❌ User journeys failed.")
            print("   System requires fixes before user testing.")
            sys.exit(2)

    except KeyboardInterrupt:
        print("\n⏹️  User journey tests interrupted")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 User journey tests crashed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())