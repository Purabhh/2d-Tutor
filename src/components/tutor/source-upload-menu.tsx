"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Image, Globe, Link, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

type SourceUploadMenuProps = {
  open: boolean
  onClose: () => void
  onFileUpload: (files: FileList, type: string) => void
  onUrlSubmit: (url: string) => void
  className?: string
}

const menuItems = [
  { label: "PDF", type: "pdf", icon: FileText, accept: ".pdf" },
  { label: "Image", type: "image", icon: Image, accept: "image/*" },
  { label: "Document", type: "document", icon: Upload, accept: ".doc,.docx,.txt,.md,.csv" },
  { label: "URL", type: "url", icon: Globe, accept: null },
]

export function SourceUploadMenu({ open, onClose, onFileUpload, onUrlSubmit, className }: SourceUploadMenuProps) {
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [url, setUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeType, setActiveType] = useState<string>("")
  const [activeAccept, setActiveAccept] = useState<string>("")

  function handleItemClick(item: typeof menuItems[number]) {
    if (item.accept) {
      setActiveType(item.type)
      setActiveAccept(item.accept)
      setTimeout(() => fileInputRef.current?.click(), 0)
      onClose()
    } else {
      setShowUrlInput(true)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files, activeType)
      e.target.value = ""
    }
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url.trim()) {
      onUrlSubmit(url.trim())
      setUrl("")
      setShowUrlInput(false)
      onClose()
    }
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={activeAccept}
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {open && (
          <div className={cn("relative", className)}>
            {/* URL input */}
            <AnimatePresence>
              {showUrlInput && (
                <motion.div
                  initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute bottom-full mb-2 left-0"
                >
                  <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="glass-input w-64 !h-9 text-sm !rounded-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setShowUrlInput(false)
                        }
                      }}
                    />
                    <button type="submit" className="glass-fab h-9 w-9 shrink-0">
                      <Link className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu items */}
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="absolute bottom-full mb-2 left-0"
            >
              <div className="flex items-center gap-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    onClick={() => handleItemClick(item)}
                    className="glass-fab-pill"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
