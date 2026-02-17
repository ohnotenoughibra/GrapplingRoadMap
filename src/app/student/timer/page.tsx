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

export default function TimerPage() {
  const [roundTime, setRoundTime] = useState(300);
  const [restTime, setRestTime] = useState(60);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
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
    } catch {
      // Audio not available
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for this segment
          if (isRest) {
            // Rest is over, start next round
            playBeep(880, 300);
            setIsRest(false);
            setCurrentRound((r) => r + 1);
            return roundTime;
          } else if (currentRound < totalRounds) {
            // Round over, start rest
            playBeep(440, 500);
            setIsRest(true);
            return restTime;
          } else {
            // All rounds complete
            playBeep(660, 800);
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
        }

        // Warning beeps at 10 seconds
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
    if (isFinished) {
      resetTimer();
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsRest(false);
    setIsFinished(false);
    setCurrentRound(1);
    setTimeLeft(roundTime);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Round Timer</h1>
        <p className="text-mat-400 text-sm mt-1">IBJJF-style timer for training rounds</p>
      </div>

      {/* Presets */}
      <div className="card p-4 mb-6">
        <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-3">Presets</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-mat-800/50 border border-mat-700/30 text-mat-300 hover:text-mat-100 hover:bg-mat-700/50 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="card p-8 mb-6 flex flex-col items-center">
        {/* Status */}
        <div className="text-xs font-semibold uppercase tracking-widest mb-2">
          {isFinished ? (
            <span className="text-green-400">Complete</span>
          ) : isRest ? (
            <span className="text-yellow-400">Rest</span>
          ) : (
            <span className="text-gi-400">Round {currentRound} of {totalRounds}</span>
          )}
        </div>

        {/* Circular Timer */}
        <div className="relative w-64 h-64 mb-6">
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
            <span className={`text-5xl font-mono font-bold tabular-nums ${timerColor} transition-colors`}>
              {formatTime(timeLeft)}
            </span>
            {!isFinished && (
              <span className="text-xs text-mat-500 mt-1">
                {isRest ? "until next round" : `${totalRounds - currentRound} round${totalRounds - currentRound !== 1 ? "s" : ""} left`}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-mat-800 border border-mat-700/50 text-mat-400 hover:text-mat-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-16 h-16 rounded-full bg-gi-500/20 border-2 border-gi-500/50 text-gi-400 flex items-center justify-center hover:bg-gi-500/30 transition-colors"
            >
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => {
              setTimeLeft((prev) => prev + 30);
            }}
            className="w-12 h-12 rounded-full bg-mat-800 border border-mat-700/50 text-mat-400 hover:text-mat-200 flex items-center justify-center transition-colors text-xs font-bold"
          >
            +30s
          </button>
        </div>
      </div>

      {/* Custom Settings */}
      {!isRunning && (
        <div className="card p-4">
          <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-3">Custom</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-mat-400 mb-1">Round (min)</label>
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
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-mat-400 mb-1">Rest (sec)</label>
              <input
                type="number"
                value={restTime}
                onChange={(e) => setRestTime(Number(e.target.value))}
                min={10}
                max={300}
                step={10}
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-mat-400 mb-1">Rounds</label>
              <input
                type="number"
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
