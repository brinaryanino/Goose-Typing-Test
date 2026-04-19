"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings as SettingsIcon, User, Palette, RotateCcw, Globe, X } from "lucide-react";
import { getRandomWords, LanguageType, LANGUAGES } from "@/lib/words";
import { motion, AnimatePresence } from "framer-motion";

const TEST_DURATION = 60;
const GOAL_WPM = 60;

export default function TypingTest() {
  const [language, setLanguage] = useState<LanguageType>("english");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom Words State
  const [customWordInput, setCustomWordInput] = useState("");
  const [activeCustomWords, setActiveCustomWords] = useState<string[]>([]);
  
  // Precise stats
  const [correctChars, setCorrectChars] = useState(0);
  const [totalKeyStrokes, setTotalKeyStrokes] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load persistence on mount
  useEffect(() => {
    const saved = localStorage.getItem("goose_custom_words");
    if (saved) {
      setCustomWordInput(saved);
      const parsed = saved.split('|').map(w => w.trim()).filter(w => w !== "");
      setActiveCustomWords(parsed);
      // Wait for state to settle then init
      setTimeout(() => initTest(language, parsed), 50);
    }
  }, []); // Run once on mount

  const initTest = useCallback((lang: LanguageType = language, customWordsOverride?: string[]) => {
    const customToUse = customWordsOverride !== undefined ? customWordsOverride : activeCustomWords;
    
    if (customToUse && customToUse.length > 0) {
      // Use custom words
      const shuffled = [...customToUse].sort(() => Math.random() - 0.5);
      const repeated = [];
      while (repeated.length < 100) repeated.push(...shuffled);
      setWords(repeated.slice(0, 100));
    } else {
      setWords(getRandomWords(100, lang));
    }
    
    setCurrentWordIndex(0);
    setUserInput("");
    setTimeLeft(TEST_DURATION);
    setIsActive(false);
    setIsFinished(false);
    setCorrectChars(0);
    setTotalKeyStrokes(0);
    setHasError(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!showSettings) setTimeout(() => inputRef.current?.focus(), 100);
  }, [language, activeCustomWords, showSettings]);

  // Initial load effect
  useEffect(() => {
    initTest();
  }, []); // Run once

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || showSettings) return;
    
    const value = e.target.value;
    
    if (!isActive && value.length > 0) {
      setIsActive(true);
    }

    setTotalKeyStrokes(prev => prev + 1);

    if (value.endsWith(" ")) {
      if (value.trim().length === 0) return;

      const trimmedValue = value.trim();
      const currentWord = words[currentWordIndex];
      
      let wordHits = 0;
      for (let i = 0; i < Math.min(trimmedValue.length, (currentWord?.length || 0)); i++) {
        if (trimmedValue[i] === currentWord[i]) wordHits++;
      }
      
      if (trimmedValue === currentWord) wordHits++; 

      setCorrectChars(prev => prev + wordHits);
      setCurrentWordIndex(prev => prev + 1);
      setUserInput("");
      setHasError(false);
      
      if (currentWordIndex > words.length - 15) {
        if (activeCustomWords.length > 0) {
            const shuffled = [...activeCustomWords].sort(() => Math.random() - 0.5);
            setWords(prev => [...prev, ...shuffled.slice(0, 50)]);
        } else {
            setWords(prev => [...prev, ...getRandomWords(50, language)]);
        }
      }
    } else {
      const currentWord = words[currentWordIndex];
      const isError = value.length > 0 && (value.length > (currentWord?.length || 0) || value[value.length - 1] !== currentWord[value.length - 1]);
      setHasError(isError);
      setUserInput(value);
    }
  };

  const calculateWPM = () => {
    const minutes = TEST_DURATION / 60;
    let currentHits = 0;
    const currentWord = words[currentWordIndex];
    if (currentWord) {
        for (let i = 0; i < Math.min(userInput.length, currentWord.length); i++) {
            if (userInput[i] === currentWord[i]) currentHits++;
        }
    }
    const totalHits = correctChars + currentHits;
    return Math.round((totalHits / 5) / minutes);
  };

  const calculateAccuracy = () => {
    if (totalKeyStrokes === 0) return 0;
    let currentHits = 0;
    const currentWord = words[currentWordIndex];
    if (currentWord) {
        for (let i = 0; i < Math.min(userInput.length, currentWord.length); i++) {
            if (userInput[i] === currentWord[i]) currentHits++;
        }
    }
    const totalHits = correctChars + currentHits;
    return Math.round((totalHits / totalKeyStrokes) * 100);
  };

  const changeLanguage = (lang: LanguageType) => {
    setLanguage(lang);
    setActiveCustomWords([]); // Clear custom when switching back to default
    initTest(lang, []);
  };

  const handleSaveCustomWords = () => {
    localStorage.setItem("goose_custom_words", customWordInput);
    const parsed = customWordInput.split('|').map(w => w.trim()).filter(w => w !== "");
    setActiveCustomWords(parsed);
    setShowSettings(false);
    initTest(language, parsed);
  };

  const handleResetCustomWords = () => {
    setCustomWordInput("");
    setActiveCustomWords([]);
    localStorage.removeItem("goose_custom_words");
    setShowSettings(false);
    initTest();
  };

  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();

  return (
    <div 
      className={`
        relative flex flex-col min-h-screen bg-black text-white font-sans transition-colors duration-300 items-center justify-center overflow-hidden
        ${hasError && isActive ? "bg-red-950/10" : "bg-black"}
      `}
      onClick={() => !showSettings && inputRef.current?.focus()}
    >
      {/* Header - Pinned to Top */}
      <header className="absolute top-0 left-0 w-full flex justify-between p-8 md:p-12 items-center animate-in fade-in duration-1000 z-10">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">GooseTyping</h1>
        <div className="flex gap-6 md:gap-8 items-center text-white/20">
            <Globe size={18} className="hover:text-white transition-colors cursor-pointer" />
            <Palette size={18} className="hover:text-white transition-colors cursor-pointer" />
            <SettingsIcon 
                size={18} 
                className="hover:text-white transition-colors cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
            />
        </div>
      </header>

      {/* Main Central Block */}
      <main className="max-w-4xl w-full px-8 flex flex-col items-center justify-center gap-y-16 text-center">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-y-16"
            >
              <div className="text-7xl font-mono tabular-nums text-white/10 select-none tracking-widest">
                {timeLeft}
              </div>

              <div className="relative w-full min-h-[200px]">
                <input
                  ref={inputRef}
                  type="text"
                  className="absolute inset-0 opacity-0 cursor-default"
                  value={userInput}
                  onChange={handleInputChange}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 text-3xl md:text-5xl leading-relaxed select-none">
                  {words.slice(currentWordIndex, currentWordIndex + 10).map((word, wIdx) => {
                    const isCurrent = wIdx === 0;
                    return (
                      <div key={wIdx} className="relative flex whitespace-nowrap">
                        {word?.split("").map((char, cIdx) => {
                          let status = "faded";
                          if (isCurrent && cIdx < userInput.length) {
                             status = userInput[cIdx] === char ? "correct" : "incorrect";
                          }
                          return (
                            <span 
                              key={cIdx} 
                              className={`
                                transition-all duration-150
                                ${status === "faded" ? "text-white/20" : ""}
                                ${status === "correct" ? "text-white" : ""}
                                ${status === "incorrect" ? "text-red-500 underline decoration-2 underline-offset-[12px]" : ""}
                              `}
                            >
                              {char}
                            </span>
                          );
                        })}
                        {isCurrent && userInput.length > (word?.length || 0) && (
                             userInput.slice(word?.length || 0).split("").map((char, i) => (
                                <span key={i} className="text-red-500 underline decoration-2 underline-offset-[12px] opacity-70">
                                    {char}
                                </span>
                             ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center gap-y-8">
                   <button 
                    onClick={(e) => { e.stopPropagation(); initTest(); }}
                    className="text-white/20 hover:text-white transform hover:rotate-180 transition-all duration-700 p-4"
                    title="Restart"
                  >
                    <RotateCcw size={32} />
                  </button>
                  
                  <div className="flex gap-6">
                    <button 
                        onClick={(e) => { e.stopPropagation(); changeLanguage("english"); }}
                        className={`text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-2 border ${language === 'english' && activeCustomWords.length === 0 ? 'border-white text-white' : 'border-white/10 text-white/20'} hover:border-white transition-all`}
                    >
                        English
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); changeLanguage("indonesian"); }}
                        className={`text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-2 border ${language === 'indonesian' && activeCustomWords.length === 0 ? 'border-white text-white' : 'border-white/10 text-white/20'} hover:border-white transition-all`}
                    >
                        Bahasa
                    </button>
                    {activeCustomWords.length > 0 && (
                        <span className="text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-2 border border-white text-white bg-white/5">
                            Custom Active
                        </span>
                    )}
                  </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full gap-y-20"
            >
              <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-center justify-center">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6 font-black">WPM</span>
                  <div className="text-[14rem] md:text-[18rem] font-black leading-none tracking-tighter">
                    {wpm}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start pt-12">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6 font-black">Accuracy</span>
                  <div className="text-9xl md:text-[11rem] font-black leading-none tracking-tighter opacity-80">
                    {accuracy}%
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-y-12">
                <div className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-mono">
                   {wpm >= GOAL_WPM ? "Goal Reached: Exceptional" : `Target: ${GOAL_WPM} WPM`}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); initTest(); }}
                    className="group flex flex-col items-center gap-y-4 transition-all"
                >
                    <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <RotateCcw size={28} />
                    </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-2xl w-full flex flex-col gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Settings</h2>
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="text-white/20 hover:text-white transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Custom Word Set</label>
                            <span className="text-[9px] text-white/20 font-mono">Separate by |</span>
                        </div>
                        <textarea 
                            value={customWordInput}
                            onChange={(e) => setCustomWordInput(e.target.value)}
                            placeholder="apple|banana|cherry|..."
                            className="w-full h-48 bg-white/5 border border-white/10 p-6 text-sm font-mono text-white focus:outline-none focus:border-white/40 transition-all resize-none scrollbar-hide"
                        />
                        <p className="text-[9px] text-white/20 leading-relaxed tracking-widest text-right">
                           Input words separated by | (e.g., word1|word2|word3)
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={handleSaveCustomWords}
                            className="flex-1 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] py-4 hover:bg-white/90 transition-all"
                        >
                            Save & Apply
                        </button>
                        <button 
                            onClick={handleResetCustomWords}
                            className="flex-1 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-[0.3em] py-4 hover:border-white hover:text-white transition-all"
                        >
                            Reset to Default
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Pinned to Bottom */}
      <footer className="absolute bottom-0 left-0 w-full flex justify-between p-8 md:p-12 items-center text-[9px] uppercase tracking-[0.6em] text-white/10 select-none">
        <div>GooseTyping v2.0</div>
        <div className="flex gap-8">
            <span className="text-white/30">Focus Mode</span>
            <span className={language === 'indonesian' && activeCustomWords.length === 0 ? "text-white" : ""}>ID</span>
            <span className={language === 'english' && activeCustomWords.length === 0 ? "text-white" : ""}>EN</span>
            {activeCustomWords.length > 0 && <span className="text-white">CUSTOM</span>}
        </div>
      </footer>
    </div>
  );
}
