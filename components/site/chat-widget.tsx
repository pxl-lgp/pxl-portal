"use client";

import { useMutation } from "@tanstack/react-query";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { askAssistant } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string };

const greeting: ChatMessage = {
  role: "assistant",
  text: "Hi! I'm PXL's assistant. Tell me about your business and what you'd like to grow, and I'll point you in the right direction.",
};

/** Public lead-gen chatbot (Workflow Study §11). Talks to the unauthenticated /assistant/chat endpoint. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => askAssistant(message),
    onSuccess: (data) => {
      setMessages((current) => [...current, { role: "assistant", text: data.output }]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || mutation.isPending) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    mutation.mutate(trimmed);
  }

  return (
    <>
      <button
        aria-label={open ? "Close chat" : "Chat with PXL"}
        className="fixed bottom-5 left-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 left-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
        role="dialog"
        aria-label="PXL assistant"
      >
        <div className="flex items-center gap-2 border-b border-border bg-primary/5 p-4">
          <span className="grid size-9 place-items-center rounded-full bg-primary/10">
            <Bot className="size-5 text-primary" />
          </span>
          <div>
            <div className="text-sm font-bold">PXL Assistant</div>
            <div className="text-xs text-muted-foreground">Typically replies instantly</div>
          </div>
        </div>

        <div className="flex max-h-80 min-h-56 flex-col gap-3 overflow-y-auto p-4" ref={scrollRef}>
          {messages.map((message, index) => (
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                message.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-muted text-foreground",
              )}
              key={index}
            >
              {message.text}
            </div>
          ))}
          {mutation.isPending ? (
            <div className="self-start rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">Typing…</div>
          ) : null}
          {mutation.isError ? (
            <div className="self-start rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(mutation.error, "Something went wrong. Please try again.")}
            </div>
          ) : null}
        </div>

        <form className="flex items-center gap-2 border-t border-border p-3" onSubmit={submit}>
          <input
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about growing your business…"
            value={input}
          />
          <button
            aria-label="Send message"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
            disabled={!input.trim() || mutation.isPending}
            type="submit"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}
