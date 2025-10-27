import os
import uuid
import logging
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from embeddings import create_embeddings, get_documents
from llm import query_llm

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# In-memory storage for chatbot status (in production, use a database)
chatbot_status = {}

@app.route('/build_chatbot', methods=['POST'])
def build_chatbot():
    """Create a new chatbot with embeddings from an uploaded PDF file."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file found'}), 400

        file = request.files['file']
        if file and file.filename:
            # Ensure pdf_files directory exists
            pdf_dir = 'pdf_files'
            if not os.path.exists(pdf_dir):
                os.makedirs(pdf_dir)
            
            file_path = os.path.join(pdf_dir, file.filename)
            file.save(file_path)
            logger.info(f"Saved file: {file_path}")

            # Create chatbot ID and start embedding process
            chatbot_id = str(uuid.uuid4())
            chatbot_status[chatbot_id] = {'status': 'Creating embeddings'}
            
            # Create embeddings for the document
            create_embeddings(chatbot_id, file.filename)
            
            # Update status
            chatbot_status[chatbot_id] = {'status': 'Embeddings ready'}
            logger.info(f"Chatbot {chatbot_id} created successfully")
            
            return jsonify({'chatbot_id': chatbot_id}), 201
        else:
            return jsonify({'error': 'No file found'}), 400
    except Exception as e:
        logger.error(f"Error building chatbot: {str(e)}")
        return jsonify({'error': f'Failed to build chatbot: {str(e)}'}), 500

@app.route('/ask_chatbot/<string:chatbot_id>', methods=['POST'])
def ask_chatbot(chatbot_id):
    """Ask a question to a specific chatbot."""
    try:
        # Check if chatbot exists
        if chatbot_id not in chatbot_status:
            return jsonify({'error': 'Chatbot not found'}), 404

        # Get question from request
        data = request.get_json()
        if 'question' not in data:
            return jsonify({'error': 'Missing "question" in the request body'}), 400

        question = data['question']
        logger.info(f"Asking chatbot {chatbot_id}: {question}")

        # Get relevant documents from embeddings
        relevant_documents = get_documents(chatbot_id, question)
        
        # Query LLM with the question and relevant documents
        answer = query_llm(question, relevant_documents)

        return jsonify({'answer': answer}), 200
    except Exception as e:
        logger.error(f"Error asking chatbot: {str(e)}")
        return jsonify({'error': f'Failed to ask chatbot: {str(e)}'}), 500

@app.route('/chatbot_status/<string:chatbot_id>', methods=['GET'])
def get_chatbot_status(chatbot_id):
    """Get the status of a chatbot."""
    if chatbot_id in chatbot_status:
        return jsonify(chatbot_status[chatbot_id]), 200
    else:
        return jsonify({'error': 'Chatbot not found'}), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)