"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Building, Mail, User, DollarSign, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface InquirePageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default function PublicInquirePage({ params }: InquirePageProps) {
  const { tenantSlug } = use(params);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState("Web Development");
  const [budgetRange, setBudgetRange] = useState("$5,000 - $10,000");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post(`/leads/public/${tenantSlug}`, {
        name,
        email,
        company,
        projectType,
        budgetRange,
        message,
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit your inquiry. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm tracking-tight border border-border shadow-xs">
              RO
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Start a Project with @{tenantSlug}
          </h1>
          <p className="text-xs text-muted-foreground">
            Tell us about your timeline, project requirements, and estimated budget
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-6 w-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Inquiry Received!
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thank you for reaching out. The team at <span className="font-mono text-foreground font-medium">@{tenantSlug}</span> will review your requirements and follow up with a proposal shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 stroke-[1.5]" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                    <Input
                      type="text"
                      required
                      disabled={loading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                    <Input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                    <Input
                      type="text"
                      required
                      disabled={loading}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Health"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Estimated Budget
                  </label>
                  <Select
                    value={budgetRange}
                    disabled={loading}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  >
                    <option value="Under $5,000">Under $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000+">$25,000+</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Project Brief & Requirements
                </label>
                <Textarea
                  required
                  rows={4}
                  disabled={loading}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're looking to build, expected deliverables, and target timeline..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="w-full h-10"
              >
                <span>Send Project Inquiry</span>
                <Send className="ml-1.5 h-3.5 w-3.5 stroke-[1.5]" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
