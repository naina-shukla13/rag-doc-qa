import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage
from app.config import GROQ_API_KEY, VECTORSTORE_DIR

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def process_pdf(file_path: str, doc_id: str):
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    
    # For short docs (<=3 pages), keep each page as one chunk
    if len(pages) <= 3:
        chunks = pages
    else:
        splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=80)
        chunks = splitter.split_documents(pages)

    vectorstore = FAISS.from_documents(chunks, embeddings)
    save_path = os.path.join(VECTORSTORE_DIR, doc_id)
    vectorstore.save_local(save_path)

    return len(pages), len(chunks)

def get_answer(doc_id: str, question: str, chat_history: list):
    save_path = os.path.join(VECTORSTORE_DIR, doc_id)
    if not os.path.exists(save_path):
        raise FileNotFoundError("Document not processed yet.")

    vectorstore = FAISS.load_local(save_path, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 10})    
    llm = ChatGroq(api_key=GROQ_API_KEY, model_name="llama-3.3-70b-versatile", temperature=0.2)

    history_messages = []
    for human, ai in chat_history:
        history_messages.append(HumanMessage(content=human))
        history_messages.append(AIMessage(content=ai))

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful assistant. Answer questions using ONLY the context below.
Read the ENTIRE context carefully before answering — do not stop at the first match.
If asked about projects, list ALL projects you find anywhere in the context.
If asked about skills, list ALL skills. Never say information is missing if it exists in the context.

Context:
{context}"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
            "chat_history": lambda _: history_messages,
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    answer = chain.invoke(question)

    retrieved_docs = retriever.invoke(question)
    sources = []
    for doc in retrieved_docs:
        page = doc.metadata.get("page", 0) + 1
        if page not in sources:
            sources.append(page)

    return answer, sorted(sources)