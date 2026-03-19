import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from utils.groq_client import generate_text


def main() -> None:
    out = generate_text("Explain how LLM resume parsing works in one short paragraph.")
    print(out)


if __name__ == "__main__":
    main()

