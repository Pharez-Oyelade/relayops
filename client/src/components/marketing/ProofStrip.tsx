"use client";

import { motion } from "motion/react";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/stagger-children";

export default function ProofStrip() {
  const brands = [
    {
      name: "KINETICS",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 18L10 6L14 12L20 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "VERTEX",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="12,3 21,19 3,19"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="12,9 17,19 7,19" fill="currentColor" opacity="0.3" />
        </svg>
      ),
    },
    {
      name: "HYPERSCALE",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 8H20M4 16H20M12 4V20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      name: "NEXUS",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4"
            y="4"
            width="7"
            height="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="4"
            width="7"
            height="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="4"
            y="13"
            width="7"
            height="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="13"
            width="7"
            height="7"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "SYNDICATE",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="9"
            cy="12"
            r="5"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle
            cx="15"
            cy="12"
            r="5"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      ),
    },
    {
      name: "AURA",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "PULSE",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H7L10 4L14 20L17 12H21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        <StaggerChildren
          className="flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-10 md:gap-12"
          staggerDelay={0.06}
        >
          {brands.map((brand) => (
            <StaggerItem key={brand.name}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 text-muted-foreground/80 hover:text-foreground transition-colors duration-150 cursor-default group"
              >
                {brand.icon}
                <span className="font-bold tracking-wider text-xs sm:text-sm">
                  {brand.name}
                </span>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
