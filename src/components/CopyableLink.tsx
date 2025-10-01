"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { motion } from "framer-motion";

type CopyableLinkProps = {
  code: string;
  className?: string;
};

export function CopyableLink({ code, className = "" }: CopyableLinkProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/formular/${code}`;
    }
    return '';
  };

  const handleCopy = async () => {
    const fullUrl = getFullUrl();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--md-sys-color-primary-container)] transition-all touch-manipulation ${className}`}
      title="Vollständigen Link kopieren"
      aria-label={`Link zum Formular kopieren: ${getFullUrl()}`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        key={copied ? "check" : "link"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.1 }}
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
      </motion.span>
      <span className="hidden sm:inline">
        {copied ? "Link kopiert!" : "Link kopieren"}
      </span>
      <span className="sm:hidden">
        {copied ? "Kopiert!" : "Link"}
      </span>
    </motion.button>
  );
}



