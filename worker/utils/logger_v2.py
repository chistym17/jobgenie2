import logging
import os


def get_v2_logger(name: str = "resume_v2_worker") -> logging.Logger:
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


