"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { School, Building2, FileCheck, ArrowRight, Sparkles } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section with Animated Gradient */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-[var(--md-sys-shape-corner-xlarge)] mb-8 md:mb-12 p-8 md:p-12 lg:p-16 animated-gradient"
        aria-label="Hero-Bereich"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              aria-hidden="true"
            >
              <Sparkles className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--md-sys-color-on-primary-container)]">
              NRW Zielvereinbarung Digital
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--md-sys-color-on-primary-container)] max-w-2xl"
          >
            Plattform für digitale Zielvereinbarungen zwischen Schulen und Schulämtern.
          </motion.p>
        </div>
        
        {/* Decorative floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-10 opacity-20"
          aria-hidden="true"
        >
          <FileCheck className="w-32 h-32" />
        </motion.div>
      </motion.section>

      {/* Feature Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:gap-8 lg:grid-cols-2"
      >
        <motion.div variants={item}>
          <Link
            href="/login"
            className="group block h-full"
            aria-label="Anmeldung für Schulämter - Formulare verwalten und genehmigen"
          >
            <article className="relative h-full p-8 md-surface rounded-[var(--md-sys-shape-corner-large)] md-elevation-2 hover:md-elevation-4 overflow-hidden transition-all duration-300">
              {/* Icon container with animated background */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0 w-16 h-16 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Building2 className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" aria-hidden="true" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
                    Für Schulämter
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    </motion.div>
                  </h3>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                    Schule suchen, Formulare anlegen, Zielvereinbarungen prüfen und freigeben.
                    Vollständige Übersicht und Verwaltung aller Prozesse.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  Verwaltung
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                  Genehmigung
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  Export
                </span>
              </div>

              {/* Hover effect gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--md-sys-color-primary)] to-transparent opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                aria-hidden="true"
              />
            </article>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            href="/formular"
            className="group block h-full"
            aria-label="Zugangscode eingeben - Zielvereinbarung für Schulen ausfüllen"
          >
            <article className="relative h-full p-8 md-surface rounded-[var(--md-sys-shape-corner-large)] md-elevation-2 hover:md-elevation-4 overflow-hidden transition-all duration-300">
              {/* Icon container with animated background */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="flex-shrink-0 w-16 h-16 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-tertiary-container)] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <School className="w-8 h-8 text-[var(--md-sys-color-on-tertiary-container)]" aria-hidden="true" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
                    Für Schulen
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />
                    </motion.div>
                  </h3>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                    Per Zugangscode Formulare öffnen, Zielvereinbarungen ausfüllen und digital absenden.
                    Einfach und sicher.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                  Zugangscode
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  Bearbeiten
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                  Absenden
                </span>
              </div>

              {/* Hover effect gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--md-sys-color-tertiary)] to-transparent opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                aria-hidden="true"
              />
            </article>
          </Link>
        </motion.div>
      </motion.div>

    </div>
  );
}
