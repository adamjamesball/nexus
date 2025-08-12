# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nexus is a multi-agent AI platform for sustainability intelligence that combines organizational boundary analysis, carbon footprint assessment, and ESG reporting. The project is in the planning/architecture phase, focused on building an advanced self-improving AI system for sustainability consultants.

## Commands and Scripts

### Running Code Examples
```bash
# Run the foundational processor demo
python quick_demo.py

# Run the example implementation
python EXAMPLE_IMPLEMENTATION.py
```

### Dependencies
- Python 3.8+ with pandas, openpyxl for the current example implementations
- No package.json or formal build system currently exists
- Future implementation will use FastAPI backend with Next.js frontend

## Architecture Overview

### Core Vision
The project aims to build a "self-improving agentic AI platform" with these key components:

1. **Multi-Agent System**: 7+ specialized AI agents collaborating autonomously
   - Smart Document Agent (multi-modal document processing)
   - Entity Intelligence Agent (organizational structure analysis)
   - Carbon Expert Agent (GHG Protocol compliance)
   - Nature Expert Agent (biodiversity impact)
   - Social Impact Agent
   - Compliance Agent
   - Strategic Insight Agent
   - Report Generation Agent

2. **Continuous Learning Engine**: System that learns from every user interaction
   - Feedback capture and processing
   - Model fine-tuning pipeline
   - Dynamic knowledge graph updates

3. **AI Workflow Orchestrator**: Built on LangGraph framework
   - Dynamic agent selection and coordination
   - Real-time workflow adaptation
   - Multi-step reasoning and conflict resolution

### Technology Stack (Planned)

**Backend**:
- FastAPI with Celery for async processing
- PostgreSQL with PGVector for data and embeddings
- Redis for caching and task queues
- Neo4j for knowledge graph
- Kafka for event streaming

**Frontend**:
- Next.js 14+ with App Router
- Shadcn/ui components with Tailwind CSS
- Real-time agent visualization

**AI/ML**:
- Multi-model gateway: Claude 4 Opus, Gemini 2.5 Pro, OpenAI o3/gpt-oss
- LangGraph for agent orchestration
- Custom continuous learning engine

**Infrastructure**:
- Docker containerization
- Kubernetes deployment
- Terraform for infrastructure as code

## Current Implementation Status

The repository contains planning documents and example implementations:

- `quick_demo.py`: Demonstrates foundational file processing approach
- `EXAMPLE_IMPLEMENTATION.py`: Shows planned architecture with AI enhancement layer
- Planning documents in root directory outline the full vision and roadmap

The actual multi-agent platform has not been implemented yet - this is currently in the design and planning phase.

## Key Design Principles

1. **Reliable Foundation First**: Start with deterministic, rule-based processing before adding AI layers
2. **AI Enhancement**: Layer intelligent capabilities on top of solid foundations  
3. **Continuous Learning**: Every interaction feeds back to improve the system
4. **Human-AI Amplification**: Augment rather than replace human expertise
5. **Enterprise-Grade**: Built for high reliability, security, and scalability

## Agent Orchestration Guidelines

**CRITICAL**: Always use the `agent-orchestrator` agent to coordinate complex development tasks that require multiple specialized agents. This ensures proper SDLC rigor and architectural adherence.

### Mandatory Agent Orchestration Workflow

For ANY significant development task (new features, major changes, complex implementations):

1. **ALWAYS START with the Agent Orchestrator**:
   ```
   Use the agent-orchestrator to coordinate this multi-phase development task
   ```

2. **The Agent Orchestrator MUST coordinate these specialized agents**:
   - **product-manager**: Requirements gathering, feature specification, acceptance criteria
   - **software-engineer**: Architecture decisions, design patterns, technology choices
   - **test-engineer**: Unit tests, integration tests, regression test suites
   - **user-journey-tester**: End-to-end user workflow validation
   - **Additional domain agents**: As needed for specific expertise

3. **Enforce SDLC Rigor**: The orchestrator must ensure:
   - Requirements are clearly defined before implementation begins
   - Architecture aligns with established patterns (FastAPI + Next.js + LangGraph)
   - No unnecessary new technologies are introduced
   - Comprehensive testing strategy is implemented
   - User experience is validated end-to-end

### Agent Orchestration Pattern

```
agent-orchestrator → product-manager (requirements) → 
                  → software-engineer (implementation) → 
                  → test-engineer (testing strategy) → 
                  → user-journey-tester (validation) → 
                  → back to orchestrator (coordination & quality gates)
```

### Forbidden Practices

- **NEVER** implement features without using the agent-orchestrator first
- **NEVER** skip requirements definition via product-manager agent
- **NEVER** bypass testing phases (test-engineer + user-journey-tester)
- **NEVER** introduce new technology stack without software-engineer agent review
- **NEVER** deploy without comprehensive test coverage validation

## Development Workflow

When implementing features for this system:

1. **MANDATORY**: Start with agent-orchestrator to coordinate the full SDLC
2. Follow the established agent coordination pattern above
3. Adhere to architectural patterns shown in example files
4. Implement rule-based core functionality first
5. Add AI enhancement layers incrementally
6. Include comprehensive error handling and logging
7. Design for the continuous learning feedback loops described in the architecture
8. Focus on the specific sustainability domain expertise (GHG Protocol, TNFD, GRI, etc.)
9. Validate with user-journey-tester before considering complete

## Testing Requirements

The agent-orchestrator must ensure comprehensive testing through:

### test-engineer Responsibilities:
- **Unit Tests**: Individual agent functionality, data models, business logic
- **Integration Tests**: Multi-agent collaboration, API endpoints, database operations
- **Regression Tests**: Prevent breaking existing functionality
- **Performance Tests**: Enterprise-scale processing capabilities
- **Security Tests**: Data protection and compliance validation

### user-journey-tester Responsibilities:
- **End-to-End Workflows**: Complete user scenarios from upload to insights
- **Multi-Agent Interaction Validation**: Ensure seamless agent collaboration from user perspective
- **Error Path Testing**: Validate graceful error handling and recovery
- **Usability Testing**: Confirm intuitive user experience and time-to-value goals

### Quality Gates
The orchestrator must enforce these gates before any deployment:
- All unit tests passing (>95% coverage)
- Integration tests validating multi-agent workflows
- User journey tests confirming end-to-end functionality
- Performance benchmarks meeting enterprise requirements
- Security compliance validation complete