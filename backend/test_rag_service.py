import requests
import json

# Test the health endpoint
def test_health():
    response = requests.get('http://localhost:5001/health')
    print("Health check:", response.json())

# Test building a chatbot (you'll need to provide a PDF file)
def test_build_chatbot(pdf_file_path):
    with open(pdf_file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post('http://localhost:5001/build_chatbot', files=files)
        print("Build chatbot:", response.json())
        return response.json().get('chatbot_id')

# Test asking a question to a chatbot
def test_ask_chatbot(chatbot_id, question):
    data = {'question': question}
    response = requests.post(f'http://localhost:5001/ask_chatbot/{chatbot_id}', json=data)
    print("Ask chatbot:", response.json())

# Test getting chatbot status
def test_chatbot_status(chatbot_id):
    response = requests.get(f'http://localhost:5001/chatbot_status/{chatbot_id}')
    print("Chatbot status:", response.json())

if __name__ == '__main__':
    # Test health endpoint
    test_health()
    
    # Note: To test the full functionality, you would need to:
    # 1. Start the RAG service: python rag_service.py
    # 2. Provide a PDF file path to test_build_chatbot
    # 3. Use the returned chatbot_id to test_ask_chatbot
    # 
    # Example usage (uncomment and modify as needed):
    # chatbot_id = test_build_chatbot('path/to/your/document.pdf')
    # test_ask_chatbot(chatbot_id, 'What is this document about?')
    # test_chatbot_status(chatbot_id)
    pass