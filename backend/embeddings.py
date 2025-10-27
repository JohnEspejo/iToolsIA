import os
import uuid
import PyPDF2
import chromadb
from document import Document

def create_embeddings(chatbot_id, file_name):
    #extraer el texto del pdf
    with open(os.path.join('pdf_files', file_name), 'rb') as pdf_file:
        pdf_reader = PyPDF2.PdfReader(pdf_file)

        documents = []
        for page_num, page in enumerate(pdf_reader.pages):
            document = Document(
                doc_id=str(uuid.uuid4()),
                content=page.extract_text(),
                metadata={'page_number': str(page_num)}
            )
            documents.append(document)


    #crear embeddings y guardar
    client = chromadb.Client()
    collection = client.create_collection(chatbot_id)
    for doc in documents:
        collection.add(
            documents=doc.content,
            ids=doc.id,
            metadatas=doc.metadata
        )

def get_documents(chatbot_id, question):
    client = chromadb.Client()
    collection = client.get_collection(chatbot_id)
    result = collection.query(query_texts=question, n_results=3, include=["metadatas", "documents"])
    
    # Check if result is valid and contains the expected data
    if not result or 'ids' not in result or not result['ids']:
        return []
    
    relevant_docs = []
    # Ensure we have valid data before accessing
    if result['ids'] and len(result['ids']) > 0:
        index = 0
        for doc_id in result['ids'][0]:
            # Check bounds and data existence
            if (result['documents'] and len(result['documents']) > 0 and 
                len(result['documents'][0]) > index and
                result['metadatas'] and len(result['metadatas']) > 0 and 
                len(result['metadatas'][0]) > index):
                
                relevant_docs.append(
                    Document(
                        doc_id=doc_id,
                        content=result['documents'][0][index],
                        metadata=result['metadatas'][0][index],
                    )
                )
            index += 1
    return relevant_docs