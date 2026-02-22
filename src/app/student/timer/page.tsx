"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type TimerPreset = { label: string; round: number; rest: number; rounds: number };

const PRESETS: TimerPreset[] = [
  { label: "IBJJF White", round: 300, rest: 60, rounds: 1 },
  { label: "IBJJF Blue", round: 360, rest: 60, rounds: 1 },
  { label: "IBJJF Purple", round: 420, rest: 60, rounds: 1 },
  { label: "IBJJF Brown/Black", round: 480, rest: 60, rounds: 1 },
  { label: "5 min Rounds", round: 300, rest: 60, rounds: 5 },
  { label: "6 min Rounds", round: 360, rest: 60, rounds: 5 },
  { label: "8 min Rounds", round: 480, rest: 60, rounds: 3 },
  { label: "Sub Only 10min", round: 600, rest: 120, rounds: 3 },
];

interface TapEvent {
  type: "sub" | "caught" | "sweep" | "pass";
  round: number;
  timeInRound: number;
  timestamp: number;
}

const TAP_BUTTONS = [
  { type: "sub" as const, label: "Sub!", color: "bg-green-500/20 border-green-500/40 text-green-400 active:bg-green-500/40" },
  { type: "caught" as const, label: "Caught", color: "bg-red-500/20 border-red-500/40 text-red-400 active:bg-red-500/40" },
  { type: "sweep" as const, label: "Sweep", color: "bg-nogi-500/20 border-nogi-500/40 text-nogi-400 active:bg-nogi-500/40" },
  { type: "pass" as const, label: "Pass", color: "bg-gi-500/20 border-gi-500/40 text-gi-400 active:bg-gi-500/40" },
];

export default function TimerPage() {
  const [roundTime, setRoundTime] = useState(300);
  const [restTime, setRestTime] = useState(60);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tapEvents, setTapEvents] = useState<TapEvent[]>([]);
  const [lastTap, setLastTap] = useState<string | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, duration: number) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch { /* Audio not available */ }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isRest) {
            playBeep(880, 300);
            setIsRest(false);
            setCurrentRound((r) => r + 1);
            return roundTime;
          } else if (currentRound < totalRounds) {
            playBeep(440, 500);
            setIsRest(true);
            return restTime;
          } else {
            playBeep(660, 800);
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
        }

        if (prev === 11) playBeep(660, 150);
        if (prev === 6) playBeep(660, 150);
        if (prev === 4) playBeep(660, 150);
        if (prev === 2) playBeep(880, 300);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isRest, currentRound, totalRounds, roundTime, restTime, playBeep]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (isFinished) resetTimer();
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsRest(false);
    setIsFinished(false);
    setCurrentRound(1);
    setTimeLeft(roundTime);
    setTapEvents([]);
    setLastTap(null);
  };

  const applyPreset = (preset: TimerPreset) => {
    setIsRunning(false);
    setIsRest(false);
    setIsFinished(false);
    setRoundTime(preset.round);
    setRestTime(preset.rest);
    setTotalRounds(preset.rounds);
    setCurrentRound(1);
    setTimeLeft(preset.round);
    setTapEvents([]);
    setLastTap(null);
  };

  const handleTap = (type: TapEvent["type"]) => {
    const event: TapEvent = {
      type,
      round: currentRound,
      timeInRound: roundTime - timeLeft,
      timestamp: Date.now(),
    };
    setTapEvents((prev) => [...prev, event]);
    setLastTap(type);
    // Brief haptic feedback visual
    setTimeout(() => setLastTap(null), 600);
  };

  const progress = isRest
    ? ((restTime - timeLeft) / restTime) * 100
    : ((roundTime - timeLeft) / roundTime) * 100;

  const timerColor = isFinished
    ? "text-mat-500"
    : isRest
      ? "text-yellow-400"
      : timeLeft <= 10
        ? "text-red-400"
        : "text-mat-100";

  const ringColor = isRest ? "stroke-yellow-400" : "stroke-gi-500";

  // Tap summary for finished state
  const tapSummary = {
    sub: tapEvents.filter((e) => e.type === "sub").length,
    caught: tapEvents.filter((e) => e.type === "caught").length,
    sweep: tapEvents.filter((e) => e.type === "sweep").length,
    pass: tapEvents.filter((e) => e.type === "pass").length,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Round Timer</h1>
        <p className="text-mat-400 text-sm mt-0.5">Tap events during rounds to track automatically</p>
      </div>

      {/* Presets — compact */}
      {!isRunning && !isFinished && (
        <div className="card p-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-mat-800/50 border border-mat-700/30 text-mat-400 hover:text-mat-200 hover:bg-mat-700/50 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="card p-6 mb-4 flex flex-col items-center">
        {/* Status */}
        <div className="text-xs font-semibold uppercase tracking-widest mb-2">
          {isFinished ? (
            <span className="text-green-400">Complete</span>
          ) : isRest ? (
            <span className="text-yellow-400">Rest</span>
          ) : (
            <span className="text-gi-400">Round {currentRound} / {totalRounds}</span>
          )}
        </div>

        {/* Circular Timer */}
        <div className="relative w-48 h-48 lg:w-56 lg:h-56 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" className="text-mat-800" />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className={`${ringColor} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl lg:text-5xl font-mono font-bold tabular-nums ${timerColor} transition-colors`}>
              {formatTime(timeLeft)}
            </span>
            {!isFinished && (
              <span className="text-[10px] text-mat-500 mt-1">
                {isRest ? "rest" : `${totalRounds - currentRound} left`}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-mat-800 border border-mat-700/50 text-mat-400 hover:text-mat-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-14 h-14 rounded-full bg-gi-500/20 border-2 border-gi-500/50 text-gi-400 flex items-center justify-center hover:bg-gi-500/30 transition-colors"
            >
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setTimeLeft((prev) => prev + 30)}
            className="w-10 h-10 rounded-full bg-mat-800 border border-mat-700/50 text-mat-400 hover:text-mat-200 flex items-center justify-center transition-colors text-[10px] font-bold"
          >
            +30
          </button>
        </div>
      </div>

      {/* ═══ TAP LOGGING — During Rounds ═══ */}
      {(isRunning || (isFinished && tapEvents.length > 0)) && (
        <div className="card p-4 mb-4">
          {isRunning && !isRest && (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-mat-500 mb-2">
                Quick Tap
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TAP_BUTTONS.map((btn) => (
                  <button
                    key={btn.type}
                    onClick={() => handleTap(btn.type)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all active:scale-[0.93] ${btn.color} ${
                      lastTap === btn.type ? "scale-95 opacity-70" : ""
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Tap summary */}
          {tapEvents.length > 0 && (
            <div className={`flex gap-3 ${isRunning && !isRest ? "mt-3 pt-3 border-t border-mat-800/30" : ""}`}>
              {tapSummary.sub > 0 && (
                <span className="text-[10px] text-green-400 font-medium">
                  {tapSummary.sub} sub{tapSummary.sub !== 1 ? "s" : ""}
                </span>
              )}
              {tapSummary.caught > 0 && (
                <span className="text-[10px] text-red-400 font-medium">
                  {tapSummary.caught} caught
                </span>
              )}
              {tapSummary.sweep > 0 && (
                <span className="text-[10px] text-nogi-400 font-medium">
                  {tapSummary.sweep} sweep{tapSummary.sweep !== 1 ? "s" : ""}
                </span>
              )}
              {tapSummary.pass > 0 && (
                <span className="text-[10px] text-gi-400 font-medium">
                  {tapSummary.pass} pass{tapSummary.pass !== 1 ? "es" : ""}
                </span>
              )}
            </div>
          )}

          {/* Post-session: save to sparring log prompt */}
          {isFinished && tapEvents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-mat-800/30">
              <p className="text-xs text-mat-400 mb-2">Save this session to your sparring log?</p>
              <button
                onClick={() => {
                  // Navigate to sparring with pre-filled data
                  const params = new URLSearchParams({
                    rounds: String(totalRounds),
                    subs: String(tapSummary.sub),
                    caught: String(tapSummary.caught),
                  });
                  window.location.href = `/student/sparring?${params.toString()}`;
                }}
                className="btn-primary text-xs w-full"
              >
                Save to Sparring Log
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom settings — compact */}
      {!isRunning && !isFinished && (
        <div className="card p-3">
          <div className="text-[10px] font-medium text-mat-500 uppercase tracking-wider mb-2">Custom</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-mat-500 mb-1">Round (min)</label>
              <input
                type="number"
                value={Math.floor(roundTime / 60)}
                onChange={(e) => {
                  const v = Number(e.target.value) * 60;
                  setRoundTime(v);
                  if (!isRest) setTimeLeft(v);
                }}
                min={1}
                max={30}
                className="w-full px-2 py-1.5 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-mat-500 mb-1">Rest (sec)</label>
              <input
                type="number"
                value={restTime}
                onChange={(e) => setRestTime(Number(e.target.value))}
                min={10}
                max={300}
                step={10}
                className="w-full px-2 py-1.5 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-mat-500 mb-1">Rounds</label>
              <input
                type="number"
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full px-2 py-1.5 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
