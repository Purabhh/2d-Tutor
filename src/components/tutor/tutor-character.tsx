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
        setMouthOpen(Math.random() * 0.6 + 0.2)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isSpeaking])

  ;(TutorCharacter as any).analyserRef = analyserRef

  const mouthRy = 2 + mouthOpen * 8

  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 300 250"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax meet"
        style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.4))" }}
      >
        {/* Body — wide torso, bottom clipped by desk */}
        <motion.ellipse
          cx="150"
          cy="220"
          rx="90"
          ry="65"
          fill="#6BB5E0"
          animate={{ ry: isSpeaking ? [65, 66, 65] : [65, 64, 65] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Arms — resting on desk */}
        <motion.ellipse
          cx="55"
          cy="215"
          rx="28"
          ry="16"
          fill="#6BB5E0"
          animate={{ rotate: isSpeaking ? [-4, 4, -4] : [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 3, ease: "easeInOut" }}
          style={{ transformOrigin: "80px 215px" }}
        />
        <motion.ellipse
          cx="245"
          cy="215"
          rx="28"
          ry="16"
          fill="#6BB5E0"
          animate={{ rotate: isSpeaking ? [4, -4, 4] : [1, -1, 1] }}
          transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 3, ease: "easeInOut" }}
          style={{ transformOrigin: "220px 215px" }}
        />

        {/* Hands */}
        <circle cx="30" cy="218" r="10" fill="#6BB5E0" />
        <circle cx="270" cy="218" r="10" fill="#6BB5E0" />

        {/* Head */}
        <motion.circle
          cx="150"
          cy="105"
          r="75"
          fill="#6BB5E0"
          animate={{ cy: [105, 102, 105] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Ears */}
        <circle cx="80" cy="70" r="22" fill="#6BB5E0" />
        <circle cx="80" cy="70" r="13" fill="#4A9AC5" />
        <circle cx="220" cy="70" r="22" fill="#6BB5E0" />
        <circle cx="220" cy="70" r="13" fill="#4A9AC5" />

        {/* Face area */}
        <ellipse cx="150" cy="118" rx="48" ry="38" fill="#8ED1F0" />

        {/* Eyes */}
        <motion.g
          animate={{ y: isSpeaking ? [0, -1.5, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <circle cx="125" cy="98" r="11" fill="white" />
          <circle cx="175" cy="98" r="11" fill="white" />
          <motion.circle
            cx="127"
            cy="98"
            r="5.5"
            fill="#1a1a1a"
            animate={{ cx: isSpeaking ? [127, 130, 127] : 127 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle
            cx="177"
            cy="98"
            r="5.5"
            fill="#1a1a1a"
            animate={{ cx: isSpeaking ? [177, 180, 177] : 177 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {/* Eye shine */}
          <circle cx="130" cy="95" r="2.5" fill="white" />
          <circle cx="180" cy="95" r="2.5" fill="white" />
        </motion.g>

        {/* Eyebrows */}
        <motion.line
          x1="112" y1="82" x2="135" y2="85"
          stroke="#4A9AC5" strokeWidth="3" strokeLinecap="round"
          animate={{ y1: isSpeaking ? [82, 79, 82] : 82 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <motion.line
          x1="165" y1="85" x2="188" y2="82"
          stroke="#4A9AC5" strokeWidth="3" strokeLinecap="round"
          animate={{ y2: isSpeaking ? [82, 79, 82] : 82 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Nose */}
        <ellipse cx="150" cy="112" rx="5" ry="4" fill="#4A9AC5" />

        {/* Mouth */}
        <motion.ellipse
          cx="150"
          cy="128"
          rx="10"
          animate={{ ry: mouthRy }}
          fill={mouthOpen > 0.3 ? "#3D2828" : "#4A9AC5"}
          transition={{ duration: 0.08 }}
        />

        {/* TTS speech bubble indicator */}
        {isSpeaking && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <rect x="185" y="45" width="60" height="24" rx="12" fill="rgba(255,255,255,0.08)" />
            {/* Sound waves */}
            <motion.path
              d="M200 53 v8 M207 50 v14 M214 53 v8 M221 51 v12 M228 54 v6"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
          </motion.g>
        )}
      </motion.svg>
    </div>
  )
}
