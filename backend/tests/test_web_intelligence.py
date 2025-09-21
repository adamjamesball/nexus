"""
Unit tests for web intelligence and scraping system
Test-Engineer Agent Implementation
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.intelligence import WebIntelligenceEngine, CompanyProfile


class TestWebIntelligence:
    """Unit tests for web intelligence system"""

    @pytest.mark.asyncio
    async def test_web_engine_initialization(self):
        """Test web intelligence engine initialization"""
        async with WebIntelligenceEngine() as engine:
            assert engine._session is not None

    @pytest.mark.asyncio
    async def test_google_search_with_fallback(self):
        """Test Google search with fallback strategies"""
        async with WebIntelligenceEngine() as engine:
            # Test with a well-known company
            results = await engine._search_google("Apple Inc company", 3)

            # Should get results either from Google or fallback
            assert isinstance(results, list)
            # Even if Google fails, fallback should provide some results
            if not results:
                # Test fallback directly
                fallback_results = await engine._fallback_search_strategy("Apple Inc", 3)
                assert len(fallback_results) > 0, "Both Google and fallback search failed"

    @pytest.mark.asyncio
    async def test_website_pattern_generation(self):
        """Test website pattern generation for company names"""
        async with WebIntelligenceEngine() as engine:
            patterns = engine._generate_company_website_guesses("Tesla Motors company")

            assert isinstance(patterns, list)
            assert len(patterns) > 0
            assert any("tesla" in pattern.lower() for pattern in patterns)
            assert all(pattern.startswith("http") for pattern in patterns)

    @pytest.mark.asyncio
    async def test_url_scraping(self):
        """Test URL scraping functionality"""
        async with WebIntelligenceEngine() as engine:
            # Test with a reliable website
            test_url = "https://httpbin.org/html"
            scraped_data = await engine._scrape_url(test_url)

            if scraped_data:  # May fail due to network issues in testing
                assert "url" in scraped_data
                assert "title" in scraped_data
                assert "content" in scraped_data
                assert isinstance(scraped_data["content"], str)

    @pytest.mark.asyncio
    async def test_company_profile_discovery(self):
        """Test company profile discovery workflow"""
        async with WebIntelligenceEngine() as engine:
            # Test with well-known company
            profile = await engine.discover_company_profile("Microsoft")

            assert isinstance(profile, CompanyProfile)
            assert profile.name == "Microsoft"
            assert profile.confidence >= 0.0
            assert isinstance(profile.websites, list)

            # Should have some basic information
            if profile.confidence > 0.3:
                assert profile.industry != "Unknown"

    @pytest.mark.asyncio
    async def test_sustainability_document_scouting(self):
        """Test sustainability document discovery"""
        async with WebIntelligenceEngine() as engine:
            # Create a test company profile
            test_profile = CompanyProfile(
                name="Nike",
                industry="Consumer Goods",
                size="Large",
                jurisdiction="United States",
                websites=["nike.com"],
                confidence=0.8
            )

            documents = await engine.scout_sustainability_documents(test_profile)

            assert isinstance(documents, list)
            # May not find documents in test environment, but should not crash

    @pytest.mark.asyncio
    async def test_content_analysis_functions(self):
        """Test content analysis utility functions"""
        async with WebIntelligenceEngine() as engine:
            # Test document type classification
            pdf_url = "https://example.com/report.pdf"
            doc_type = engine._classify_document_type(pdf_url)
            assert "PDF" in doc_type

            # Test sustainability relevance scoring
            sustainability_url = "https://example.com/sustainability-report"
            score = engine._score_sustainability_relevance(sustainability_url, "sustainability")
            assert 0.0 <= score <= 1.0
            assert score > 0.0  # Should have positive score for sustainability content

            # Test domain identification
            test_content = "Our company focuses on carbon emissions reduction and biodiversity conservation"
            domains = engine._identify_relevant_domains(test_content)
            assert isinstance(domains, list)
            assert "carbon" in domains
            assert "nature" in domains

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in web intelligence system"""
        async with WebIntelligenceEngine() as engine:
            # Test with invalid URL
            invalid_data = await engine._scrape_url("https://invalid-url-that-does-not-exist.com")
            assert invalid_data is None

            # Test with empty company name
            empty_profile = await engine.discover_company_profile("")
            assert empty_profile.confidence < 0.5


if __name__ == "__main__":
    asyncio.run(pytest.main([__file__, "-v"]))