import { NextRequest, NextResponse } from 'next/server';

type StreamingTextResponseOptions = {
  headers?: Record<string, string>;
  status?: number;
};

class StreamingTextResponse extends Response {
  constructor(
    body: ReadableStream,
    options: StreamingTextResponseOptions = {}
  ) {
    super(body, {
      ...options,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...options.headers,
      },
    });
  }
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, settings, aiModel } = await req.json();

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message and conversationId are required' },
        { status: 400 }
      );
    }

    // Update conversation title based on first message
    try {
      await fetch(`${req.nextUrl.origin}/api/conversations/${conversationId}/update-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.log('Could not update conversation title:', error);
    }

    // Determine the N8N webhook URL based on the selected AI model
    let n8nUrl = '';
    
    if (aiModel === 'gemini') {
      // Use the new production Gemini webhook URL
      n8nUrl = 'https://sswebhookss.joaobr.site/webhook/fd3da80e-250d-4887-b822-0c3f0b149934';
    } else if (aiModel === 'openai') {
      // Use the new production OpenAI webhook URL
      n8nUrl = 'https://sswebhookss.joaobr.site/webhook/a9ac359b-ae8a-4611-96b8-eb302ce6b0ca';
    } else {
      // Use the default webhook URL from environment variables
      const n8nBaseUrl = process.env.N8N_BASE_URL;
      const n8nWebhookPath = process.env.N8N_WEBHOOK_PATH;
      
      if (!n8nBaseUrl || !n8nWebhookPath) {
        return NextResponse.json(
          { error: 'N8N backend configuration is missing' },
          { status: 500 }
        );
      }
      
      n8nUrl = `${n8nBaseUrl}${n8nWebhookPath}`;
    }
    
    // Log the URL we're trying to call
    console.log(`Calling N8N webhook for ${aiModel || 'default'} at:`, n8nUrl);

    // Create a text encoder to convert strings to Uint8Array
    const encoder = new TextEncoder();

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendStreamingResponse = async () => {
      try {
        // Send request to N8N backend
        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId,
            settings,
            aiModel
          }),
        });

        console.log('N8N response status:', response.status);
        console.log('N8N response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
          // Try to get the error response body
          let errorBody = '';
          try {
            errorBody = await response.text();
            console.log('N8N error response body:', errorBody);
          } catch (e) {
            console.log('Could not read error response body:', e);
          }
          
          throw new Error(`N8N backend responded with status: ${response.status}, body: ${errorBody}`);
        }

        // Check if the response is a stream or a regular JSON response
        const contentType = response.headers.get('content-type');
        console.log('N8N response content-type:', contentType);
        
        if (contentType && contentType.includes('text/event-stream')) {
          // Handle streaming response from n8n
          const reader = response.body?.getReader();
          
          if (reader) {
            let done = false;
            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              
              if (value) {
                await writer.write(value);
              }
            }
          }
        } else {
          // Handle regular JSON response from n8n
          const data = await response.json();
          console.log('N8N response data:', data);
          
          // Stream the response from N8N
          // Updated to handle both 'message' and 'output' fields from N8N
          const messageContent = data.message || data.output || '';
          if (messageContent) {
            // Split by spaces but preserve line breaks
            const words = messageContent.split(/(\s+)/).filter((word: string) => word !== '');
            
            let accumulatedContent = '';
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              accumulatedContent += word;
              
              const messageEvent = {
                type: 'message',
                data: {
                  content: accumulatedContent,
                },
              };
              
              await writer.write(
                encoder.encode(`data: ${JSON.stringify(messageEvent)}\n\n`)
              );
              
              // Add a small delay between chunks for streaming effect
              await new Promise((resolve) => setTimeout(resolve, 20));
            }
          }
          
          // Include sources if provided by N8N
          if (data.sources && data.sources.length > 0) {
            const sourcesEvent = {
              type: 'sources',
              data: {
                sources: data.sources,
              },
            };
            
            await writer.write(
              encoder.encode(`data: ${JSON.stringify(sourcesEvent)}\n\n`)
            );
          }
        }
        
        // Send completion event
        const completeEvent = {
          type: 'complete',
        };
        
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`)
        );
      } catch (error: any) {
        console.error('Error calling N8N backend:', error);
        
        // Send error message to client
        const errorEvent = {
          type: 'error',
          data: {
            message: `Error al conectar con el backend: ${error.message || error}. Por favor, intenta de nuevo.`,
          },
        };
        
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
        );
      } finally {
        await writer.close();
      }
    };

    // Start the streaming process
    sendStreamingResponse();

    // Return a streaming response
    return new StreamingTextResponse(stream.readable);
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}