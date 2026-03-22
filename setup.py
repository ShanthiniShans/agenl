from setuptools import setup, find_packages

setup(
    name="agenl",
    version="0.2.0",
    description="Agent Definition Language — convert natural language into enforced AI agent contracts",
    author="ShanthiniShans",
    packages=find_packages(),
    install_requires=[
        "anthropic",
        "lark",
        "pydantic",
        "rich",
        "python-dotenv",
        "click",
    ],
    entry_points={
        "console_scripts": [
            "agenl=agenl.cli:main",
        ],
    },
    python_requires=">=3.10",
)