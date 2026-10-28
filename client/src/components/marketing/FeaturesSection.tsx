"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench,
  GripVertical,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

/* ------------------------------------------------------------------ */
/*  UI Fragment — Kanban Column                                        */
/* ------------------------------------------------------------------ */

function KanbanFragment() {
  const [cards, setCards] = useState([
    {
      id: 1,
      title: "Homepage Redesign",
      status: "In Progress",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      dot: "bg-indigo-500",
    },
    {
      id: 2,
      title: "Brand Guidelines",
      status: "In Review",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
    },
    {
      id: 3,
      title: "Social Assets",
      status: "Approved",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
    },
  ]);

  const toggleCard = (id: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === "In Progress") {
          return {
            ...c,
            status: "In Review",
            color: "text-amber-600 bg-amber-50 border-amber-200",
            dot: "bg-amber-500",
          };
        }
        if (c.status === "In Review") {
          return {
            ...c,
            status: "Approved",
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            dot: "bg-emerald-500",
          };
        }
        return {
          ...c,
          status: "In Progress",
          color: "text-indigo-600 bg-indigo-50 border-indigo-200",
          dot: "bg-indigo-500",
        };
      }),
    );
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      data-ui="kanban-fragment"
      className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white shadow-xs transition-colors duration-150 hover:border-zinc-300"
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            Deliverables
          </span>
          <span className="text-[11px] font-medium text-zinc-400">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
          <GripVertical className="h-4 w-4 text-zinc-300 stroke-[1.5]" />
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 p-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => toggleCard(card.id)}
            className="w-full text-left rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-3 transition-all duration-150 hover:border-primary/40 hover:bg-zinc-100/70 active:scale-[0.99] cursor-pointer"
          >
            <p className="text-sm font-medium text-zinc-900 mb-2">
              {card.title}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold ${card.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${card.dot}`} />
              {card.status}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  UI Fragment — Approval Card                                        */
/* ------------------------------------------------------------------ */

type ApprovalStatus =
  | "idle"
  | "approving"
  | "approved"
  | "requesting"
  | "requested";

function ApprovalFragment() {
  const [status, setStatus] = useState<ApprovalStatus>("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleApprove = () => {
    if (status !== "idle") return;
    setStatus("approving");

    timerRef.current = setTimeout(() => {
      setStatus("approved");
      timerRef.current = setTimeout(() => {
        setStatus("idle");
      }, 3500);
    }, 450);
  };

  const handleRequestChanges = () => {
    if (status !== "idle") return;
    setStatus("requesting");

    timerRef.current = setTimeout(() => {
      setStatus("requested");
      timerRef.current = setTimeout(() => {
        setStatus("idle");
      }, 3500);
    }, 450);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      data-ui="approval-fragment"
      className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white shadow-xs transition-colors duration-150 hover:border-zinc-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-900">
          Deliverable Review
        </span>

        {status === "idle" && (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        )}

        {(status === "approving" || status === "approved") && (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved ✓
          </span>
        )}

        {(status === "requesting" || status === "requested") && (
          <span className="inline-flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Changes Requested
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3.5">
        {/* File preview */}
        <div
          className={`flex items-center gap-3 rounded-lg border p-3 transition-colors duration-200 ${
            status === "approved"
              ? "border-emerald-200 bg-emerald-50/50"
              : status === "requested"
                ? "border-rose-200 bg-rose-50/50"
                : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ${
              status === "approved"
                ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                : status === "requested"
                  ? "bg-rose-100 border-rose-200 text-rose-700"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600"
            }`}
          >
            {status === "approved" ? (
              <Check className="h-4 w-4 stroke-[2]" />
            ) : status === "requested" ? (
              <AlertCircle className="h-4 w-4 stroke-[2]" />
            ) : (
              <FileText className="h-4 w-4 stroke-[1.5]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              Brand_Guidelines_v2.pdf
            </p>
            <p className="text-[11px] text-zinc-500">2.4 MB · Uploaded today</p>
          </div>
        </div>

        {/* Comment */}
        <div className="flex items-start gap-2 text-[13px] text-zinc-600">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-zinc-400 stroke-[1.5] shrink-0" />
          <p className="leading-relaxed">
            "Ready for your final sign-off. All revisions from round 2 are
            incorporated."
          </p>
        </div>

        {/* Actions / Interactive states */}
        <div className="pt-1 min-h-[38px] flex items-center">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 w-full"
              >
                <button
                  type="button"
                  onClick={handleApprove}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-all duration-150 active:scale-[0.98] hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2]" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={handleRequestChanges}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all duration-150 active:scale-[0.98] hover:bg-zinc-50 cursor-pointer"
                >
                  Request Changes
                </button>
              </motion.div>
            )}

            {status === "approving" && (
              <motion.div
                key="approving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-primary"
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Recording sign-off...</span>
              </motion.div>
            )}

            {status === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Sign-off recorded!</span>
                </div>
              </motion.div>
            )}

            {status === "requesting" && (
              <motion.div
                key="requesting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-rose-600"
              >
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                <span>Submitting feedback...</span>
              </motion.div>
            )}

            {status === "requested" && (
              <motion.div
                key="requested"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800"
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Revision request sent!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  UI Fragment — Invoice Card                                         */
/* ------------------------------------------------------------------ */

type PaymentStatus = "idle" | "processing" | "paid";

function InvoiceFragment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePay = () => {
    if (status !== "idle") return;
    setStatus("processing");

    timerRef.current = setTimeout(() => {
      setStatus("paid");
      timerRef.current = setTimeout(() => {
        setStatus("idle");
      }, 3500);
    }, 550);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      data-ui="invoice-fragment"
      className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white shadow-xs transition-colors duration-150 hover:border-zinc-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <span className="font-mono text-sm font-semibold text-zinc-900">
          INV-0042
        </span>

        {status === "paid" ? (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid ✓
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Sent
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3.5">
        {/* Line items */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Homepage Redesign</span>
            <span className="font-medium text-zinc-900">$3,200.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Brand Guidelines</span>
            <span className="font-medium text-zinc-900">$1,800.00</span>
          </div>
          <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
            <span className="font-semibold text-zinc-900">Total</span>
            <span
              className={`font-semibold transition-colors duration-200 ${
                status === "paid"
                  ? "text-emerald-600 font-mono"
                  : "text-zinc-900"
              }`}
            >
              $5,000.00
            </span>
          </div>
        </div>

        {/* Meta / Settlement notice */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 min-h-[16px]">
          {status === "paid" ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              ✓ Settled via Paystack
            </span>
          ) : (
            <>
              <span>Due: Nov 15, 2026</span>
              <span>Net 14</span>
            </>
          )}
        </div>

        {/* CTA / Success State */}
        <div className="pt-1 min-h-[38px] flex items-center">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.button
                key="pay-btn"
                type="button"
                onClick={handlePay}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all duration-150 active:scale-[0.98] hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                Pay Now
              </motion.button>
            )}

            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/90 px-4 py-2.5 text-xs font-semibold text-white"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing Paystack checkout...</span>
              </motion.div>
            )}

            {status === "paid" && (
              <motion.div
                key="paid"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Payment Complete</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Block                                                      */
/* ------------------------------------------------------------------ */

interface FeatureBlockProps {
  title: string;
  description: string;
  fragment: React.ReactNode;
  reverse?: boolean;
  delay?: number;
}

function FeatureBlock({
  title,
  description,
  fragment,
  reverse = false,
  delay = 0,
}: FeatureBlockProps) {
  return (
    <MotionWrapper variant="fadeUp" delay={delay} className="w-full">
      <div
        className={`flex flex-col ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        } items-center gap-10 md:gap-16`}
      >
        {/* Text side */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
            {title}
          </h3>
          <p className="text-base text-zinc-600 leading-relaxed max-w-lg">
            {description}
          </p>
        </div>

        {/* UI fragment side */}
        <div className="flex-1 min-w-0 flex justify-center">{fragment}</div>
      </div>
    </MotionWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Features Section                                                   */
/* ------------------------------------------------------------------ */

export default function FeaturesSection() {
  return (
    <section className="w-full bg-[#f8f9fa] py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <Wrench className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
            }
            className="mb-6"
          >
            Built for Your Workflow
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.18] text-center">
            Every tool your team reaches for, in one workspace
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            Stop juggling five tabs. RelayOps brings project management, client
            communication, and billing into a single view.
          </p>
        </MotionWrapper>

        {/* Feature Blocks */}
        <div className="mt-16 sm:mt-20 w-full space-y-16 sm:space-y-24">
          {/* Feature 1 — Project & Deliverable Management */}
          <FeatureBlock
            title="From backlog to done, nothing gets lost"
            description="Kanban boards, milestone tracking, and file management all connected to your client's view. Every status update syncs automatically."
            fragment={<KanbanFragment />}
            delay={0.1}
          />

          {/* Feature 2 — Client Portal & Approval Workflow */}
          <FeatureBlock
            title="Clients approve work, not chase updates"
            description="Every client gets their own portal. They see project progress, review deliverables, and approve with one click."
            fragment={<ApprovalFragment />}
            reverse
            delay={0.1}
          />

          {/* Feature 3 — Invoicing & Payment */}
          <FeatureBlock
            title="Approved today, invoiced today"
            description="Invoices generate automatically from approved milestones. Clients pay through their portal. No more billing lag."
            fragment={<InvoiceFragment />}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
