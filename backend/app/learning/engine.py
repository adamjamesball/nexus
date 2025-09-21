"""
Continuous learning engine for improving AI performance based on user feedback
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict
import json
import hashlib
import statistics

from ..llm import LLMMessage
from ..llm.client import client
from ..config import get_settings


logger = logging.getLogger(__name__)


@dataclass
class FeedbackRecord:
    """Individual feedback record from users"""
    feedback_id: str
    session_id: str
    agent: Optional[str]
    feedback_type: str  # "correction", "rating", "comment", "thumbs_up", "thumbs_down"
    content: Dict[str, Any]
    timestamp: datetime
    processed: bool = False
    learning_weight: float = 1.0


@dataclass
class LearningSignal:
    """Learning signal derived from user interactions"""
    signal_id: str
    signal_type: str  # "accuracy_feedback", "user_correction", "performance_metric"
    agent: Optional[str]
    context: Dict[str, Any]
    impact_score: float
    timestamp: datetime
    applied: bool = False


@dataclass
class PerformanceMetrics:
    """Performance tracking metrics"""
    total_analyses: int = 0
    accuracy_score: float = 0.0
    user_satisfaction_score: float = 0.0
    data_quality_score: float = 0.0
    improvement_trend: str = "stable"  # "improving", "stable", "declining"
    last_updated: datetime = field(default_factory=datetime.utcnow)
    domain_specific_metrics: Dict[str, Dict[str, Any]] = field(default_factory=dict)


class ContinuousLearningEngine:
    """Engine for continuous learning and improvement based on user feedback"""

    def __init__(self):
        self.settings = get_settings()
        self._feedback_buffer: List[FeedbackRecord] = []
        self._learning_signals: List[LearningSignal] = []
        self._performance_metrics: Dict[str, PerformanceMetrics] = defaultdict(PerformanceMetrics)
        self._learning_patterns: Dict[str, Any] = {}

    async def process_feedback(
        self,
        session_id: str,
        agent: Optional[str],
        feedback_type: str,
        content: Dict[str, Any]
    ) -> str:
        """Process incoming user feedback and generate learning signals"""
        logger.info(f"Processing feedback for session {session_id}, agent {agent}")

        # Create feedback record
        feedback_id = hashlib.md5(
            f"{session_id}_{agent}_{feedback_type}_{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()

        feedback_record = FeedbackRecord(
            feedback_id=feedback_id,
            session_id=session_id,
            agent=agent,
            feedback_type=feedback_type,
            content=content,
            timestamp=datetime.utcnow()
        )

        self._feedback_buffer.append(feedback_record)

        # Generate immediate learning signals
        learning_signals = await self._generate_learning_signals(feedback_record)
        self._learning_signals.extend(learning_signals)

        # Update performance metrics
        await self._update_performance_metrics(feedback_record)

        # Process accumulated feedback if buffer is large enough
        if len(self._feedback_buffer) >= 10:
            await self._batch_process_feedback()

        return feedback_id

    async def _generate_learning_signals(self, feedback: FeedbackRecord) -> List[LearningSignal]:
        """Generate learning signals from feedback"""
        signals = []

        try:
            await client.initialize()

            if feedback.feedback_type == "correction":
                # User provided a correction - high impact learning signal
                signal = LearningSignal(
                    signal_id=f"correction_{feedback.feedback_id}",
                    signal_type="user_correction",
                    agent=feedback.agent,
                    context={
                        "original_output": feedback.content.get("original"),
                        "corrected_output": feedback.content.get("corrected"),
                        "correction_reason": feedback.content.get("reason"),
                        "session_context": feedback.session_id
                    },
                    impact_score=0.9,  # High impact
                    timestamp=feedback.timestamp
                )
                signals.append(signal)

            elif feedback.feedback_type == "rating":
                # Numerical rating - moderate impact
                rating = feedback.content.get("rating", 3)
                impact = self._calculate_rating_impact(rating)

                signal = LearningSignal(
                    signal_id=f"rating_{feedback.feedback_id}",
                    signal_type="accuracy_feedback",
                    agent=feedback.agent,
                    context={
                        "rating": rating,
                        "max_rating": feedback.content.get("max_rating", 5),
                        "category": feedback.content.get("category", "overall")
                    },
                    impact_score=impact,
                    timestamp=feedback.timestamp
                )
                signals.append(signal)

            elif feedback.feedback_type in ["thumbs_up", "thumbs_down"]:
                # Binary feedback - moderate impact
                is_positive = feedback.feedback_type == "thumbs_up"

                signal = LearningSignal(
                    signal_id=f"binary_{feedback.feedback_id}",
                    signal_type="accuracy_feedback",
                    agent=feedback.agent,
                    context={
                        "is_positive": is_positive,
                        "context": feedback.content.get("context", "")
                    },
                    impact_score=0.7 if is_positive else 0.3,
                    timestamp=feedback.timestamp
                )
                signals.append(signal)

            elif feedback.feedback_type == "comment":
                # Analyze comment sentiment and content for learning signals
                comment_signals = await self._analyze_comment_feedback(feedback)
                signals.extend(comment_signals)

            return signals

        except Exception as e:
            logger.error(f"Learning signal generation failed: {e}")
            return []

    def _calculate_rating_impact(self, rating: float, max_rating: float = 5) -> float:
        """Calculate impact score from numerical rating"""
        normalized_rating = rating / max_rating
        # Convert to impact score (higher ratings = higher impact)
        return max(0.1, normalized_rating)

    async def _analyze_comment_feedback(self, feedback: FeedbackRecord) -> List[LearningSignal]:
        """Analyze comment feedback using AI to extract learning signals"""
        try:
            comment = feedback.content.get("comment", "")
            if not comment or len(comment) < 10:
                return []

            prompt = f"""
            Analyze this user feedback comment and extract learning signals for AI system improvement.

            Comment: "{comment}"
            Agent: {feedback.agent or "general"}
            Session context: {feedback.session_id}

            Identify:
            1. Sentiment (positive, negative, neutral)
            2. Specific issues or praise mentioned
            3. Actionable improvement suggestions
            4. Impact level (high, medium, low)

            Return as JSON:
            {{
                "sentiment": "positive|negative|neutral",
                "specific_issues": ["issue1", "issue2"],
                "praise_points": ["point1", "point2"],
                "improvement_suggestions": ["suggestion1", "suggestion2"],
                "impact_level": "high|medium|low",
                "categories": ["accuracy", "speed", "completeness", "relevance"]
            }}
            """

            messages = [LLMMessage(role="user", content=prompt)]
            response = await client.generate(
                messages=messages,
                max_tokens=400,
                temperature=0.2
            )

            analysis = json.loads(response.content)

            # Create learning signals based on analysis
            signals = []

            # Overall sentiment signal
            sentiment_impact = {
                "positive": 0.8,
                "negative": 0.2,
                "neutral": 0.5
            }.get(analysis.get("sentiment", "neutral"), 0.5)

            sentiment_signal = LearningSignal(
                signal_id=f"sentiment_{feedback.feedback_id}",
                signal_type="accuracy_feedback",
                agent=feedback.agent,
                context={
                    "sentiment": analysis.get("sentiment"),
                    "comment": comment,
                    "analysis": analysis
                },
                impact_score=sentiment_impact,
                timestamp=feedback.timestamp
            )
            signals.append(sentiment_signal)

            # Issue-specific signals
            for issue in analysis.get("specific_issues", []):
                issue_signal = LearningSignal(
                    signal_id=f"issue_{feedback.feedback_id}_{hashlib.md5(issue.encode()).hexdigest()[:8]}",
                    signal_type="user_correction",
                    agent=feedback.agent,
                    context={
                        "issue_type": "user_identified",
                        "issue_description": issue,
                        "original_comment": comment
                    },
                    impact_score=0.7,
                    timestamp=feedback.timestamp
                )
                signals.append(issue_signal)

            return signals

        except Exception as e:
            logger.error(f"Comment analysis failed: {e}")
            return []

    async def _update_performance_metrics(self, feedback: FeedbackRecord) -> None:
        """Update performance metrics based on feedback"""
        agent_key = feedback.agent or "general"
        metrics = self._performance_metrics[agent_key]

        # Update total analyses
        metrics.total_analyses += 1

        # Update satisfaction score based on feedback type
        if feedback.feedback_type == "rating":
            rating = feedback.content.get("rating", 3)
            max_rating = feedback.content.get("max_rating", 5)
            normalized_rating = rating / max_rating

            # Update running average
            current_weight = 0.1  # Weight for new feedback
            metrics.user_satisfaction_score = (
                (1 - current_weight) * metrics.user_satisfaction_score +
                current_weight * normalized_rating
            )

        elif feedback.feedback_type == "thumbs_up":
            metrics.user_satisfaction_score = (
                0.9 * metrics.user_satisfaction_score + 0.1 * 1.0
            )

        elif feedback.feedback_type == "thumbs_down":
            metrics.user_satisfaction_score = (
                0.9 * metrics.user_satisfaction_score + 0.1 * 0.0
            )

        # Update accuracy score based on corrections
        if feedback.feedback_type == "correction":
            # Corrections indicate accuracy issues
            metrics.accuracy_score = max(0.0, metrics.accuracy_score - 0.05)
        elif feedback.feedback_type in ["thumbs_up", "rating"] and feedback.content.get("rating", 3) >= 4:
            # Positive feedback improves accuracy score
            metrics.accuracy_score = min(1.0, metrics.accuracy_score + 0.02)

        metrics.last_updated = datetime.utcnow()

    async def _batch_process_feedback(self) -> None:
        """Process accumulated feedback in batch for deeper learning"""
        logger.info(f"Batch processing {len(self._feedback_buffer)} feedback records")

        try:
            await client.initialize()

            # Group feedback by agent and type
            grouped_feedback = defaultdict(list)
            for feedback in self._feedback_buffer:
                key = (feedback.agent, feedback.feedback_type)
                grouped_feedback[key].append(feedback)

            # Analyze patterns in each group
            for (agent, feedback_type), feedback_list in grouped_feedback.items():
                await self._analyze_feedback_patterns(agent, feedback_type, feedback_list)

            # Clear processed feedback
            self._feedback_buffer.clear()

        except Exception as e:
            logger.error(f"Batch feedback processing failed: {e}")

    async def _analyze_feedback_patterns(
        self,
        agent: Optional[str],
        feedback_type: str,
        feedback_list: List[FeedbackRecord]
    ) -> None:
        """Analyze patterns in grouped feedback"""
        if len(feedback_list) < 3:  # Need minimum data for pattern analysis
            return

        try:
            # Prepare feedback summary for AI analysis
            feedback_summary = []
            for feedback in feedback_list:
                summary_item = {
                    "timestamp": feedback.timestamp.isoformat(),
                    "content": feedback.content,
                    "session_id": feedback.session_id
                }
                feedback_summary.append(summary_item)

            prompt = f"""
            Analyze patterns in this user feedback for agent '{agent}' of type '{feedback_type}'.

            Feedback data:
            {json.dumps(feedback_summary, indent=2)}

            Identify:
            1. Common themes or issues
            2. Trends over time
            3. Improvement recommendations
            4. Success patterns

            Return as JSON:
            {{
                "common_themes": ["theme1", "theme2"],
                "trend_analysis": "improving|stable|declining",
                "key_issues": ["issue1", "issue2"],
                "success_patterns": ["pattern1", "pattern2"],
                "recommendations": ["rec1", "rec2"]
            }}
            """

            messages = [LLMMessage(role="user", content=prompt)]
            response = await client.generate(
                messages=messages,
                max_tokens=600,
                temperature=0.3
            )

            pattern_analysis = json.loads(response.content)

            # Store pattern analysis for future use
            pattern_key = f"{agent}_{feedback_type}"
            self._learning_patterns[pattern_key] = {
                "analysis": pattern_analysis,
                "last_updated": datetime.utcnow(),
                "feedback_count": len(feedback_list)
            }

            # Update performance metrics based on trends
            if agent:
                metrics = self._performance_metrics[agent]
                trend = pattern_analysis.get("trend_analysis", "stable")
                metrics.improvement_trend = trend

        except Exception as e:
            logger.error(f"Pattern analysis failed for {agent}: {e}")

    async def get_learning_recommendations(self, agent: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get learning-based recommendations for system improvement"""
        recommendations = []

        try:
            await client.initialize()

            if agent:
                # Agent-specific recommendations
                metrics = self._performance_metrics.get(agent, PerformanceMetrics())
                pattern_key = f"{agent}_*"

                recommendations.extend(
                    await self._generate_agent_recommendations(agent, metrics)
                )
            else:
                # System-wide recommendations
                for agent_name, metrics in self._performance_metrics.items():
                    agent_recs = await self._generate_agent_recommendations(agent_name, metrics)
                    recommendations.extend(agent_recs)

            # Sort by potential impact
            recommendations.sort(key=lambda x: x.get("impact_score", 0), reverse=True)
            return recommendations[:10]  # Return top 10

        except Exception as e:
            logger.error(f"Learning recommendations generation failed: {e}")
            return []

    async def _generate_agent_recommendations(
        self,
        agent: str,
        metrics: PerformanceMetrics
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for a specific agent"""
        recommendations = []

        # Low accuracy recommendations
        if metrics.accuracy_score < 0.7:
            recommendations.append({
                "type": "accuracy_improvement",
                "title": f"Improve {agent} Accuracy",
                "description": f"Accuracy score is {metrics.accuracy_score:.2f}. Consider retraining or adjusting prompts.",
                "impact_score": 0.9,
                "agent": agent
            })

        # Low satisfaction recommendations
        if metrics.user_satisfaction_score < 0.6:
            recommendations.append({
                "type": "satisfaction_improvement",
                "title": f"Enhance {agent} User Experience",
                "description": f"User satisfaction is {metrics.user_satisfaction_score:.2f}. Review recent feedback for improvement areas.",
                "impact_score": 0.8,
                "agent": agent
            })

        # Trend-based recommendations
        if metrics.improvement_trend == "declining":
            recommendations.append({
                "type": "trend_reversal",
                "title": f"Address {agent} Performance Decline",
                "description": "Performance metrics show declining trend. Investigate recent changes.",
                "impact_score": 0.7,
                "agent": agent
            })

        return recommendations

    def get_performance_metrics(self, agent: Optional[str] = None) -> Dict[str, Any]:
        """Get current performance metrics"""
        if agent:
            metrics = self._performance_metrics.get(agent, PerformanceMetrics())
            return {
                "agent": agent,
                "total_analyses": metrics.total_analyses,
                "accuracy_score": metrics.accuracy_score,
                "user_satisfaction_score": metrics.user_satisfaction_score,
                "data_quality_score": metrics.data_quality_score,
                "improvement_trend": metrics.improvement_trend,
                "last_updated": metrics.last_updated.isoformat()
            }
        else:
            # Return aggregated metrics
            all_metrics = list(self._performance_metrics.values())
            if not all_metrics:
                return {
                    "total_analyses": 0,
                    "accuracy_score": 0.0,
                    "user_satisfaction_score": 0.0,
                    "data_quality_score": 0.0,
                    "improvement_trend": "stable"
                }

            return {
                "total_analyses": sum(m.total_analyses for m in all_metrics),
                "accuracy_score": statistics.mean(m.accuracy_score for m in all_metrics),
                "user_satisfaction_score": statistics.mean(m.user_satisfaction_score for m in all_metrics),
                "data_quality_score": statistics.mean(m.data_quality_score for m in all_metrics),
                "improvement_trend": "stable",  # Could be more sophisticated
                "agent_count": len(self._performance_metrics)
            }

    def get_learning_signals(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get learning signals for analysis"""
        signals = self._learning_signals

        if session_id:
            # Filter by session
            session_feedback = [f for f in self._feedback_buffer if f.session_id == session_id]
            signal_ids = [f.feedback_id for f in session_feedback]
            signals = [s for s in signals if any(sid in s.signal_id for sid in signal_ids)]

        return [
            {
                "signal_id": signal.signal_id,
                "signal_type": signal.signal_type,
                "agent": signal.agent,
                "impact_score": signal.impact_score,
                "timestamp": signal.timestamp.isoformat(),
                "context": signal.context,
                "applied": signal.applied
            }
            for signal in signals[-50:]  # Return last 50 signals
        ]


# Global learning engine instance
learning_engine = ContinuousLearningEngine()