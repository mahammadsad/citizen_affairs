import argparse
import asyncio
import json
from .config import get_settings
from .pipeline import AutomationPipeline


async def run(command: str) -> None:
    pipeline = AutomationPipeline(get_settings())
    if command == "discover":
        result = await pipeline.discover()
        print(json.dumps({"discovered": len(result)}))
        return
    raise SystemExit(f"Unknown command: {command}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["discover"])
    arguments = parser.parse_args()
    asyncio.run(run(arguments.command))
