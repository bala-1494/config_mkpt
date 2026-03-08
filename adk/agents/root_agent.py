"""
Root agent — top-level Google ADK agent.
Add sub-agents and tools here as the project grows.
"""

from google.adk.agents import Agent  # type: ignore


root_agent = Agent(
    name="config_mkpt_agent",
    model="gemini-2.0-flash-exp",
    description="Root agent for the Config MKPT project.",
    instruction=(
        "You are a helpful assistant for the Config MKPT application. "
        "Answer user questions accurately and concisely."
    ),
    tools=[],
)
