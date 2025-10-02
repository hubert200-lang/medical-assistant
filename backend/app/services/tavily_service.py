
from tavily import TavilyClient
from app.config import settings

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

def research(query: str, max_results: int = 5) -> list:
    response = tavily.search(query=query, search_depth="advanced", max_results=max_results)
    return response['results']
