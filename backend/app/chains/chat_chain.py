
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

def get_chat_chain(language: str = "en"):
    llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, temperature=settings.TEMPERATURE)

    if language == "fr":
        prompt_template = """
        Vous êtes un assistant médical IA. Répondez à la question suivante en français.
        Question: {question}
        Réponse:
        """
    else:
        prompt_template = """
        You are a medical AI assistant. Answer the following question in English.
        Question: {question}
        Answer:
        """

    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm
    return chain
