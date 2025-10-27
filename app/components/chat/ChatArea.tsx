'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Paperclip, HardDrive, Cloud } from 'lucide-react';
import MessageList from './MessageList';

interface ChatAreaProps {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
  onConversationUpdated?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  file?: {
    name: string;
    type: string;
    url?: string;
  };
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}

// Counter for generating temporary IDs
let messageIdCounter = 0;
const generateTempId = () => `temp-${++messageIdCounter}`;

export default function ChatArea({ conversationId, onConversationCreated, onConversationUpdated }: ChatAreaProps) {
  const t = useTranslations('chat');
  const [selectedModel, setSelectedModel] = useState('openai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load saved AI model from localStorage
  useEffect(() => {
    const loadSelectedModel = () => {
      const savedSettings = localStorage.getItem('chatSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSelectedModel(parsedSettings.aiModel || 'openai');
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }
    };

    // Load the model initially
    loadSelectedModel();

    // Create a custom event handler to listen for model changes
    const handleModelChange = () => {
      loadSelectedModel();
    };

    // Listen for custom model change events
    window.addEventListener('modelChange', handleModelChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('modelChange', handleModelChange);
    };
  }, []);
  
  // Add logging to see when messages state changes
  useEffect(() => {
    // console.log('Messages state updated:', messages);
  }, [messages]);

  // Load messages when conversationId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (response.ok) {
          const loadedMessages = await response.json();
          // Convert createdAt strings to Date objects
          const messagesWithDates = loadedMessages.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt)
          }));
          setMessages(messagesWithDates);
        } else {
          console.error('Failed to load messages:', response.statusText);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [conversationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PDF or Word document
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setShowUploadOptions(false);
      } else {
        alert('Solo se permiten archivos PDF o Word');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDriveUpload = () => {
    // Placeholder for Google Drive integration
    alert('Funcionalidad de Google Drive será implementada en una actualización futura');
    setShowUploadOptions(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    // If there's no conversationId, create a new conversation first
    let currentConversationId = conversationId;
    if (!conversationId) {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: input.trim() || 'Nueva conversación' }),
        });
        
        if (response.ok) {
          const newConversation = await response.json();
          currentConversationId = newConversation.id;
          // Notify parent component that a new conversation was created
          if (onConversationCreated) {
            await onConversationCreated(newConversation.id);
          }
        } else {
          console.error('Failed to create conversation');
          return;
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }

    let userMessage: Message = {
      id: generateTempId(), // Use temporary ID
      role: 'user' as const,
      content: input,
      createdAt: new Date(),
    };

    // Add file info to message if a file is selected
    if (selectedFile) {
      userMessage = {
        ...userMessage,
        file: {
          name: selectedFile.name,
          type: selectedFile.type,
        },
      };
    }

    // Save user message to server
    if (currentConversationId) {
      try {
        const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userMessage),
        });
        // console.log('Save user message response:', response.status, response.statusText);
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setShowUploadOptions(false);
    setIsLoading(true);
    setStreamingMessage('');
    setSources([]);

    try {
      // If we have a file, we need to upload it first
      let fileUrl = '';
      if (selectedFile && currentConversationId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('conversationId', currentConversationId);

        const uploadResponse = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await uploadResponse.json();
        fileUrl = uploadResult.fileUrl;
        
        // Log successful file upload
        // console.log('File uploaded successfully:', uploadResult);
      }

      // Only send message to AI if there's text content
      if (input.trim()) {
        // Show notification about the agent being used
        const getModelName = (model: string) => {
          switch (model) {
            case 'openai':
              return 'OpenAI';
            case 'gemini':
              return 'Gemini';
            case 'python':
              return 'Python RAG';
            default:
              return model;
          }
        };
        
        // Use the global toast notification system
        const showToast = (window as any).showToast || (window as any).appToast;
        if (typeof showToast === 'function') {
          showToast(`Cambiaste al agente ${getModelName(selectedModel)}`, 'success');
        }

        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            conversationId: currentConversationId,
            fileUrl: fileUrl,
            fileName: selectedFile?.name,
            fileType: selectedFile?.type,
            aiModel: selectedModel,
            settings: {
              topK: 5,
              temperature: 0.7,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Failed to read response');
        }

        let done = false;
        let completeMessage = '';
        let messageAdded = false;
        let lastUpdateTime = 0;
        let isFirstMessage = messages.length === 0; // Check if this is the first message

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.substring(6));

                  if (eventData.type === 'message') {
                    // Instead of appending, we replace the content to ensure we have the complete message
                    // Throttle updates to improve performance
                    const now = Date.now();
                    if (now - lastUpdateTime > 50) { // Update at most every 50ms
                      setStreamingMessage(eventData.data.content);
                      lastUpdateTime = now;
                    }
                    // Also accumulate the complete message
                    completeMessage = eventData.data.content;
                  } else if (eventData.type === 'sources') {
                    setSources(eventData.data.sources);
                  } else if (eventData.type === 'error') {
                    // Handle error from backend
                    completeMessage = eventData.data.message;
                    setStreamingMessage(completeMessage);
                  } else if (eventData.type === 'complete') {
                    // Message is complete, add it to the messages list
                    const assistantMessage = {
                      id: generateTempId(), // Use temporary ID
                      role: 'assistant' as const,
                      content: completeMessage,
                      createdAt: new Date(),
                    };

                    console.log('Complete message:', completeMessage);

                    // Save assistant message to server
                    if (currentConversationId) {
                      try {
                        const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(assistantMessage),
                        });
                        // console.log('Save assistant message response:', response.status, response.statusText);
                      } catch (error) {
                        console.error('Failed to save assistant message:', error);
                      }
                    }

                    setMessages((prev) => {
                      const newMessages = [...prev, assistantMessage];
                      // console.log('Adding assistant message:', assistantMessage);
                      // console.log('Updated messages:', newMessages);
                      return newMessages;
                    });
                    setStreamingMessage('');
                    // Set a flag to prevent the fallback code from adding the message again
                    messageAdded = true;
                    // Don't set isLoading to false here, let the finally block handle it
                  }
                } catch (e) {
                  console.error('Error parsing SSE message:', e);
                }
              }
            }
          }
        }

        // Add the assistant message to the list (fallback in case complete event wasn't received)
        // Only add if not already added by the 'complete' event handler
        if (completeMessage && streamingMessage === '' && !messageAdded) {
          const assistantMessage = {
            id: generateTempId(), // Use temporary ID
            role: 'assistant' as const,
            content: completeMessage,
            createdAt: new Date(),
          };

          // Save assistant message to server
          if (currentConversationId) {
            try {
              await fetch(`/api/conversations/${currentConversationId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(assistantMessage),
              });
            } catch (error) {
              console.error('Failed to save assistant message:', error);
            }
          }

          setMessages((prev) => [...prev, assistantMessage]);
        }

        // If this was the first message, notify parent to refresh conversations to update the title
        if (isFirstMessage && onConversationUpdated) {
          onConversationUpdated();
        }
      } else {
        // If only a file was uploaded without text, add a simple confirmation message
        const assistantMessage = {
          id: generateTempId(), // Use temporary ID
          role: 'assistant' as const,
          content: 'Archivo recibido y procesado correctamente.',
          createdAt: new Date(),
        };

        // Save assistant message to server
        if (currentConversationId) {
          try {
            await fetch(`/api/conversations/${currentConversationId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(assistantMessage),
            });
          } catch (error) {
            console.error('Failed to save assistant message:', error);
          }
        }

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage = {
        id: generateTempId(), // Use temporary ID
        role: 'assistant' as const,
        content: 'Lo sentimos, ocurrió un error al procesar su solicitud. Por favor, inténtelo de nuevo.',
        createdAt: new Date(),
      };

      // Save error message to server
      if (currentConversationId) {
        try {
          await fetch(`/api/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorMessage),
          });
        } catch (saveError) {
          console.error('Failed to save error message:', saveError);
        }
      }

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        streamingMessage={streamingMessage} 
        sources={sources}
      />
      
      <div className="border-t border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/20">
        {/* File preview */}
        {selectedFile && (
          <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between bg-purple-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center">
              <Paperclip className="text-purple-600 dark:text-purple-300 mr-2" size={20} />
              <span className="text-purple-800 dark:text-purple-200 text-sm font-medium">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100">
              ×
            </button>
          </div>
        )}
        
        {/* Upload options dropdown */}
        {showUploadOptions && (
          <div className="max-w-4xl mx-auto mb-4 relative">
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-purple-200 dark:border-gray-700 py-2 z-20">
              <button
                onClick={triggerFileInput}
                className="flex items-center w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <HardDrive className="text-purple-600 dark:text-purple-300 mr-3" size={20} />
                <span className="text-gray-800 dark:text-purple-200">Subir desde archivos</span>
              </button>
              <button
                onClick={handleDriveUpload}
                className="flex items-center w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <Cloud className="text-purple-600 dark:text-purple-300 mr-3" size={20} />
                <span className="text-gray-800 dark:text-purple-200">Subir desde Drive</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <textarea
              ref={inputRef}
              data-testid="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder={t('interface.placeholder')}
              className="w-full p-4 pr-12 border border-purple-200/50 dark:border-purple-600/50 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-purple-100 placeholder-gray-900 dark:placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 group-focus-within:shadow-xl group-focus-within:shadow-purple-500/10"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {/* Input decoration */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-violet-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
          
          {/* File upload button */}
          <button
            type="button"
            onClick={() => setShowUploadOptions(!showUploadOptions)}
            className="p-4 bg-white dark:bg-gray-800 border border-purple-200 dark:border-gray-600 rounded-2xl text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 flex items-center justify-center min-w-[56px] h-14"
            aria-label="Upload file">
            <Paperclip size={20} />
          </button>
          
          <button
            type="submit"
            data-testid="send-button"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="p-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:shadow-none flex items-center justify-center min-w-[56px] h-14">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send size={20} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
            )}
            <span className="sr-only">{t('interface.send')}</span>
          </button>
        </form>
        
        {/* Input helper text */}
        <div className="flex justify-center mt-3">
          <p className="text-xs text-purple-400 dark:text-purple-500">
            Presiona <kbd className="px-2 py-1 bg-purple-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-300 font-mono text-xs">Enter</kbd> para enviar, <kbd className="px-2 py-1 bg-purple-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-300 font-mono text-xs">Shift + Enter</kbd> para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}