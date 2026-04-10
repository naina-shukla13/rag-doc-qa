from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("uploads/d8b1f290-b41b-4288-b381-fda65c5dccf6.pdf")
pages = loader.load()
for i, page in enumerate(pages):
    print(f"--- PAGE {i+1} ---")
    print(page.page_content)
    print(f"Length: {len(page.page_content)} chars")