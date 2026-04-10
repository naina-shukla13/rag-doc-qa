from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY

llm = ChatGroq(api_key=GROQ_API_KEY, model_name="llama3-8b-8192", temperature=0.2)
result = llm.invoke("say hello")
print(result.content)