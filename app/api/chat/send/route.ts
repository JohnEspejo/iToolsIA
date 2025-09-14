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
    const { message, conversationId, settings } = await req.json();

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

    // Get N8N configuration from environment variables
    const n8nBaseUrl = process.env.N8N_BASE_URL;
    const n8nWebhookPath = process.env.N8N_WEBHOOK_PATH;

    if (!n8nBaseUrl || !n8nWebhookPath) {
      return NextResponse.json(
        { error: 'N8N backend configuration is missing' },
        { status: 500 }
      );
    }

    const n8nUrl = `${n8nBaseUrl}${n8nWebhookPath}`;

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
            settings
          }),
        });

        if (!response.ok) {
          throw new Error(`N8N backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Stream the response from N8N
        if (data.message) {
          const words = data.message.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            
            const messageEvent = {
              type: 'message',
              data: {
                content: word,
              },
            };
            
            await writer.write(
              encoder.encode(`data: ${JSON.stringify(messageEvent)}\n\n`)
            );
            
            // Add a small delay between words for streaming effect
            await new Promise((resolve) => setTimeout(resolve, 30));
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
        
        // Send completion event
        const completeEvent = {
          type: 'complete',
        };
        
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`)
        );
      } catch (error) {
        console.error('Error calling N8N backend:', error);
        
        // Send error message to client
        const errorEvent = {
          type: 'error',
          data: {
            message: 'Error al conectar con el backend. Por favor, intenta de nuevo.',
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