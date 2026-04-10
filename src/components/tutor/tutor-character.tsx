"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface TutorCharacterProps {
  isSpeaking: boolean
  className?: string
}

export function TutorCharacter({ isSpeaking, className }: TutorCharacterProps) {
  const [mouthOpen, setMouthOpen] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)

  // Expose analyser setter for parent to connect audio
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0)
      return
    }

    function tick() {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setMouthOpen(Math.min(avg / 80, 1))
      } else if (isSpeaking) {
        // Fallback: fake mouth movement when no analyser connected
        setMouthOpen(Math.random() * 0.6 + 0.2)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isSpeaking])

  // Expose analyser ref for parent
  ;(TutorCharacter as any).analyserRef = analyserRef

  const mouthRy = 2 + mouthOpen * 8 // closed=2, open=10

  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 200 260"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}
      >
        {/* Body */}
        <motion.ellipse
          cx="100"
          cy="210"
          rx="60"
          ry="45"
          fill="#6BB5E0"
          animate={{ ry: isSpeaking ? [45, 46, 45] : [45, 44, 45] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Desk surface */}
        <rect x="20" y="230" width="160" height="30" rx="6" fill="#5C3D2E" />

        {/* Arms */}
        <motion.ellipse
          cx="45"
          cy="205"
          rx="18"
          ry="12"
          fill="#6BB5E0"
          animate={{ rotate: isSpeaking ? [-3, 3, -3] : [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 3, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 205px" }}
        />
        <motion.ellipse
          cx="155"
          cy="205"
          rx="18"
          ry="12"
          fill="#6BB5E0"
          animate={{ rotate: isSpeaking ? [3, -3, 3] : [1, -1, 1] }}
          transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 3, ease: "easeInOut" }}
          style={{ transformOrigin: "140px 205px" }}
        />

        {/* Head */}
        <motion.circle
          cx="100"
          cy="120"
          r="55"
          fill="#6BB5E0"
          animate={{ cy: [120, 118, 120] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Ears */}
        <circle cx="50" cy="90" r="16" fill="#6BB5E0" />
        <circle cx="50" cy="90" r="9" fill="#4A9AC5" />
        <circle cx="150" cy="90" r="16" fill="#6BB5E0" />
        <circle cx="150" cy="90" r="9" fill="#4A9AC5" />

        {/* Face area */}
        <ellipse cx="100" cy="130" rx="35" ry="28" fill="#8ED1F0" />

        {/* Eyes */}
        <motion.g
          animate={{ y: isSpeaking ? [0, -1, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <circle cx="82" cy="112" r="8" fill="white" />
          <circle cx="118" cy="112" r="8" fill="white" />
          <motion.circle
            cx="84"
            cy="112"
            r="4"
            fill="#1a1a1a"
            animate={{ cx: isSpeaking ? [84, 86, 84] : 84 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle
            cx="120"
            cy="112"
            r="4"
            fill="#1a1a1a"
            animate={{ cx: isSpeaking ? [120, 122, 120] : 120 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {/* Eye shine */}
          <circle cx="86" cy="110" r="1.5" fill="white" />
          <circle cx="122" cy="110" r="1.5" fill="white" />
        </motion.g>

        {/* Nose */}
        <ellipse cx="100" cy="125" rx="4" ry="3" fill="#4A9AC5" />

        {/* Mouth */}
        <motion.ellipse
          cx="100"
          cy="138"
          rx="8"
          animate={{ ry: mouthRy }}
          fill={mouthOpen > 0.3 ? "#3D2828" : "#4A9AC5"}
          transition={{ duration: 0.08 }}
        />

        {/* Eyebrows */}
        <motion.line
          x1="74"
          y1="100"
          x2="90"
          y2="102"
          stroke="#4A9AC5"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ y1: isSpeaking ? [100, 98, 100] : 100 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <motion.line
          x1="110"
          y1="102"
          x2="126"
          y2="100"
          stroke="#4A9AC5"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ y2: isSpeaking ? [100, 98, 100] : 100 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </motion.svg>
    </div>
  )
}
