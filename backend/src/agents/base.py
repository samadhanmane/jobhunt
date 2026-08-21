from src.llm.llm_client import get_llm

class BaseJobAgent:
    def __init__(self, llm=None):
        self.llm = llm if llm is not None else get_llm()
        self.tools = []
