"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

const FAQS = [
  {
    question: "Do I need to be an agency to use RelayOps?",
    answer:
      "Not at all. RelayOps is built for anyone delivering client work — solo freelancers, creative studios, consultants, and agencies. If you hand off deliverables, request client feedback, or invoice for milestones, RelayOps eliminates the friction.",
  },
  {
    question: "Can clients see internal project notes and discussions?",
    answer:
      "Never. The client portal strictly surfaces what you explicitly share: milestone deliverables ready for review, approved assets, and sent invoices. Team assignments, internal discussions, and backlog items remain strictly private to your team.",
  },
  {
    question: "How does payment processing work?",
    answer:
      "RelayOps integrates directly with Paystack for seamless, secure checkout. Clients pay invoices directly inside their portal via card, bank transfer, or USSD. Funds settle directly into your connected account — RelayOps never holds your money.",
  },
  {
    question: "What happens when my free trial ends?",
    answer:
      "Your workspace, deliverables, and client data remain completely intact. You won't lose access to existing records, but you will need to choose a plan before initiating new projects or dispatching new invoices.",
  },
  {
    question: "Can I invite external clients without them creating an account?",
    answer:
      "Yes! Each client receives a secure, tokenized magic link directly to their dedicated portal. They can review work, leave annotated comments, approve milestones, and pay invoices without remembering another password.",
  },
  {
    question: "How do team roles and access permissions work?",
    answer:
      "Workspaces support OWNER, ADMIN, and MEMBER roles. Owners and admins can manage billing and view audit logs, while members focus on deliverable execution. Client viewers are automatically restricted to their assigned projects.",
  },
  {
    question: "Is there a limit on file uploads and storage?",
    answer:
      "Starter plans include 5 GB of secure file storage. Pro and Agency plans include 50 GB and 200 GB respectively, with generous bandwidth suitable for high-res design assets, video cuts, and client deliverable archives.",
  },
] as const;

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full bg-[#f8f9fa] py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <HelpCircle className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
            }
            className="mb-6 bg-white border-zinc-200 text-zinc-900"
          >
            Common Questions
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 text-center">
            Clear the last hurdle
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            Everything you need to know about setting up your workspace and
            streamlining your handoffs.
          </p>
        </MotionWrapper>

        {/* FAQ Accordion List */}
        <div className="mt-12 sm:mt-16 w-full divide-y divide-zinc-200 border-y border-zinc-200">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={faq.question} className="py-2">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between py-4 text-left font-semibold text-zinc-900 hover:text-primary transition-colors duration-150 cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg leading-snug">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-zinc-400"
                  >
                    <ChevronDown className="h-5 w-5 stroke-[1.5]" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pt-1 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-3xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
