
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash-preview-09-2025", // or any OpenRouter-supported model
        messages,
        stream: true, // enable streaming
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // optional
          "X-Title": "My Next.js App", // optional
        },
        responseType: "stream", // important for streaming
      }
    );

    const stream = response.data;

// Return as a web stream so frontend can consume
const encoder = new TextEncoder();

const readable = new ReadableStream({
  async start(controller) {
    let closed = false;
    const safeClose = () => {
      if (!closed) {
        closed = true;
        try { controller.close(); } catch {}
      }
    };

    const onData = (chunk: any) => {
      const payloads = chunk.toString().split("\n\n");
      for (const payload of payloads) {
        if (payload.includes("[DONE]")) {
          safeClose();
          return;
        }
        if (payload.startsWith("data:")) {
          try {
            const data = JSON.parse(payload.replace("data:", ""));
            const text = data.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch (err) {
            console.error("Error parsing stream", err);
          }
        }
      }
    };

    const onEnd = () => {
      safeClose();
    };

    const onError = (err: any) => {
      console.error("Stream error", err);
      if (!closed) {
        try { controller.error(err); } catch {}
        closed = true;
      }
    };

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
},
});

return new NextResponse(readable, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
  },
});
} catch (error: any) {
  // Surface upstream errors (e.g., 402 Payment Required from OpenRouter)
  const status = error?.response?.status ?? 500;
  const upstream = error?.response?.data;
  const message =
    (typeof upstream === 'object' && (upstream?.error?.message || upstream?.message)) ||
    (typeof upstream === 'string' ? upstream : undefined) ||
    error?.message ||
    'Upstream error';
  console.error('API error:', { status, message });
  return NextResponse.json({ error: message }, { status });
}
}
