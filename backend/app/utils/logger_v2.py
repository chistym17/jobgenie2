import logging
import os


def get_v2_logger(name: str = "resume_v2") -> logging.Logger:
    """
    Lightweight logger for the v2 resume upload flow.

    Uses standard logging with a simple prefix and INFO level by default.
    """
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    level = os.getenv("V2_LOG_LEVEL", "INFO").upper()
    logger.setLevel(level)

    handler = logging.StreamHandler()
    fmt = "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
    handler.setFormatter(logging.Formatter(fmt))
    logger.addHandler(handler)

    logger.propagate = False
    return logger


