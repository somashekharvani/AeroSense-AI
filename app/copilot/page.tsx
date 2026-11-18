'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  User,
  Clock,
  Tag,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFallback?: boolean;
  citedFactIds?: string[];
}

const SAMPLE_CHIPS = [
  'Is it safe for my child to exercise outdoors today?',
  'Should we ventilate or seal windows right now?',
  'What purifier CADR is needed for a 60m³ bedroom?',
  'Compare my 15km scooter commute with the Metro.',
];

export default function CopilotPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();
  const { data: snapshot } = useSnapshot();

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Welcome to AeroSense AI Copilot for ${location.name}. I plan and explain environmental air quality routines using deterministic scientific facts. Ask me anything about exposure mitigation, window ventilation, or clean alternatives.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [selectedFactId, setSelectedFactId] = React.useState<string | null>(null);
  const [latestFactsUsed, setLatestFactsUsed] = React.useState<any>({});

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          city: location.name,
          userQuery: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLatestFactsUsed(data.factsUsed || {});

        const replyContent = `${data.plan.summary}\n\n• Recommendation: ${
          data.plan.recommendations[0]?.action || 'Maintain air filtration.'
        }\n• Clean Air Window: ${data.plan.cleanAirWindow?.startHour} - ${
          data.plan.cleanAirWindow?.endHour
        } (${data.plan.cleanAirWindow?.reason})`;

        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: data.isFallback,
          citedFactIds: data.plan.cleanAirWindow?.citedFactIds || ['FACT-AQI-VALUE'],
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          content: 'I encountered an error connecting to the planning service. All local engines and dashboard data remain fully operational.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('copilot')} — Clean-Air AI Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini plans and explains based on verified scientific engine facts. Strict zero number fabrication guard.
          </p>
        </div>

        <div className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Deterministic Facts Grounded • No Invented Numbers
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <Card className="border-slate-800/80 bg-slate-900/60 min-h-[420px] flex flex-col justify-between">
        <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                    <div className="flex gap-1 flex-wrap">
                      {msg.citedFactIds?.map((id) => (
                        <button
                          key={id}
                          onClick={() => setSelectedFactId(id)}
                          className="font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700"
                        >
                          #{id}
                        </button>
                      ))}
                    </div>

                    {msg.isFallback && (
                      <span className="text-amber-400">Offline Template Fallback</span>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin">
                <RefreshCw className="h-3.5 w-3.5" />
              </div>
              <span>Consulting deterministic engines and verifying facts...</span>
            </div>
          )}
        </CardContent>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask AeroSense AI Copilot about your air quality routine..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 rounded-xl"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Fact Citation Modal */}
      {selectedFactId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-white">{selectedFactId}</h3>
              </div>
              <button
                onClick={() => setSelectedFactId(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            {latestFactsUsed[selectedFactId] ? (
              <div className="space-y-2 text-xs">
                <div className="text-slate-400">Label: <span className="text-white font-medium">{latestFactsUsed[selectedFactId].label}</span></div>
                <div className="text-slate-400">
                  Value:{' '}
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {latestFactsUsed[selectedFactId].value} {latestFactsUsed[selectedFactId].unit || ''}
                  </span>
                </div>
                <div className="text-slate-400">Source: <span className="font-mono text-slate-300">{latestFactsUsed[selectedFactId].source}</span></div>
                <div className="text-slate-400 text-[10px]">Timestamp: {latestFactsUsed[selectedFactId].timestamp}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Fact details not found in active facts registry.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
