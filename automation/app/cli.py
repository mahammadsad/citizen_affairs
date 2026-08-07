import argparse
import asyncio
import json

from .config import get_settings
from .pipeline import AutomationPipeline


async def run(command: str) -> None:
    pipeline = AutomationPipeline(get_settings())
    if command == "discover":
        result = await pipeline.discover_candidates()
        print(json.dumps({"discovered": len(result)}, ensure_ascii=False))
        return
    if command == "generate-drafts":
        result = await pipeline.generate_drafts()
        print(json.dumps(result, ensure_ascii=False))
        return
    raise SystemExit(f"Unknown command: {command}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["discover", "generate-drafts"])
    arguments = parser.parse_args()
    asyncio.run(run(arguments.command))
