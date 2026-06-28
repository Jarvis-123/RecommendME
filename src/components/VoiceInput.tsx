"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      if (event.results[event.results.length - 1].isFinal) {
        onResult(transcript);
        setListening(false);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-midnight-400 text-center">
        Voice input is not supported in this browser. Try Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        disabled={disabled}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          listening
            ? "bg-cinema-500 animate-pulse-glow"
            : "glass-hover"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {disabled ? (
          <Loader2 className="w-10 h-10 animate-spin text-cinema-400" />
        ) : listening ? (
          <MicOff className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-cinema-400" />
        )}
        {listening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cinema-400"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      <p className="text-sm text-midnight-300 text-center max-w-xs">
        {listening
          ? "Listening... Tell me what kind of movie you want!"
          : "Tap the mic and say something like \"Something funny for pizza night\""}
      </p>
    </div>
  );
}
