
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.models.schemas import AnalysisResponse

def get_analysis_chain(language: str = "en"):
    llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, temperature=settings.TEMPERATURE)
    parser = PydanticOutputParser(pydantic_object=AnalysisResponse)

    if language == "fr":
        prompt_template = """
        Analysez le texte médical suivant et fournissez un résumé, les principales conclusions, les recommandations et les prochaines étapes. Contexte : {context}
        Texte : {text}
        {format_instructions}
        """
    else:
        prompt_template = """
        Analyze the following medical text and provide a summary, key findings, recommendations, and next steps. Context: {context}
        Text: {text}
        {format_instructions}
        """

    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    chain = prompt | llm | parser
    return chain
