import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, TypeVar, Any
from functools import partial

T = TypeVar("T")

_worker_executor: ThreadPoolExecutor | None = None

def get_worker_pool(max_workers: int | None = None) -> ThreadPoolExecutor:
    """
    Returns the singleton bounded ThreadPoolExecutor for offloading blocking
    operations (DB queries, JobSpy scraping, synchronous HTTP requests, CPU-bound parsing).
    """
    global _worker_executor
    if _worker_executor is None:
        if max_workers is None:
            # Safe default: 8 workers or 2 * CPU cores (whichever is reasonable)
            cpu_count = os.cpu_count() or 4
            max_workers = min(16, max(4, cpu_count * 2))
        _worker_executor = ThreadPoolExecutor(
            max_workers=max_workers,
            thread_name_prefix="JobHunt-Worker"
        )
    return _worker_executor

async def run_in_worker_thread(func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    """
    Executes a synchronous, blocking function in the dedicated worker thread pool,
    preventing FastAPI's main asyncio event loop from stalling or timing out.
    """
    loop = asyncio.get_running_loop()
    pool = get_worker_pool()
    if kwargs:
        call_fn = partial(func, *args, **kwargs)
        return await loop.run_in_executor(pool, call_fn)
    return await loop.run_in_executor(pool, func, *args)

def shutdown_worker_pool(wait: bool = True):
    """
    Gracefully shuts down the worker thread pool upon application termination.
    """
    global _worker_executor
    if _worker_executor is not None:
        try:
            _worker_executor.shutdown(wait=wait, cancel_futures=True)
        except Exception:
            _worker_executor.shutdown(wait=wait)
        _worker_executor = None
