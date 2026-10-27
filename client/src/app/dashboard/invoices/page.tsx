"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  X,
  Trash2,
  FileText,
  DollarSign,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface LineItem {
  description: string;
  amount: number; // minor units
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  projectId: {
    _id: string;
    name: string;
    key: string;
    clientName: string;
  };
  deliverableId?: {
    _id: string;
    code: string;
    title: string;
  };
  lineItems: LineItem[];
  totalAmount: number;
  currency: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  paidAt?: string;
  paystackRef?: string;
  createdAt: string;
}

interface ProjectOption {
  _id: string;
  name: string;
  key: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { activeTenantId, activeWorkspace } = useTenantStore();
  const { user } = useAuthStore();
  const isClient = activeWorkspace?.role === "CLIENT_VIEWER";

  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // New Invoice Form
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [items, setItems] = useState<Array<{ description: string; amount: string }>>([
    { description: "Milestone Delivery", amount: "2500" },
  ]);
  const [dueDateDays, setDueDateDays] = useState("14");

  // Load Paystack Inline JS dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setPaystackLoaded(true);
      document.body.appendChild(script);
    } else if (window.PaystackPop) {
      setPaystackLoaded(true);
    }
  }, []);

  // Fetch Invoices (Backend automatically suppresses DRAFTs for CLIENT_VIEWER)
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/invoices");
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  // Fetch Projects for create modal
  const { data: projects = [] } = useQuery<ProjectOption[]>({
    queryKey: ["projects-dropdown", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data?.data || [];
    },
    enabled: !isClient && isCreateModalOpen,
  });

  // Create Invoice Mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const formattedLineItems = items.map((i) => ({
        description: i.description,
        amount: Math.round(parseFloat(i.amount) * 100), // convert to minor units
      }));

      const res = await api.post("/invoices", {
        projectId: selectedProjectId,
        lineItems: formattedLineItems,
        dueDate: new Date(Date.now() + parseInt(dueDateDays) * 24 * 60 * 60 * 1000),
        status: "DRAFT",
      });
      return res.data?.data;
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeTenantId] });
      setIsCreateModalOpen(false);
      setItems([{ description: "Milestone Delivery", amount: "2500" }]);
      toast.success(`Invoice ${invoice.invoiceNumber} created as Draft`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create invoice.");
    },
  });

  // Send Invoice Notice
  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await api.post(`/invoices/${invoiceId}/send`);
      return res.data?.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeTenantId] });
      setSelectedInvoice(updated);
      toast.success("Invoice notice sent to client via Resend email!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send invoice.");
    },
  });

  // Verify Paystack Payment Callback
  const verifyPaystackMutation = useMutation({
    mutationFn: async ({
      invoiceId,
      reference,
    }: {
      invoiceId: string;
      reference: string;
    }) => {
      const res = await api.post(`/invoices/${invoiceId}/verify-paystack`, {
        reference,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeTenantId] });
      setSelectedInvoice(null);
      toast.success("Payment verified! Receipt generated & marked PAID.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Verification failed");
    },
  });

  // PaystackPop Inline Trigger
  const handlePaystackCheckout = (invoice: Invoice) => {
    if (typeof window === "undefined" || !window.PaystackPop) {
      toast.error("Paystack checkout gateway is still loading. Please retry in a moment.");
      return;
    }

    const paystackKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key";

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: user?.email || "billing@client.com",
      amount: invoice.totalAmount, // in minor units
      currency: invoice.currency || "NGN",
      ref: `REL-${Date.now()}-${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        custom_fields: [
          { display_name: "Invoice", variable_name: "invoice_number", value: invoice.invoiceNumber },
        ],
      },
      callback: (response: { reference: string }) => {
        toast.info("Verifying transaction with Paystack servers...");
        verifyPaystackMutation.mutate({
          invoiceId: invoice._id,
          reference: response.reference,
        });
      },
      onClose: () => {
        toast.info("Checkout modal closed");
      },
    });

    handler.openIframe();
  };

  const statusStyles: Record<Invoice["status"], string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    SENT: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    OVERDUE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectId?.clientName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isClient ? "My Invoices & Receipts" : "Invoices & Revenue"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isClient
              ? "Review billable milestones, pay with Paystack, and download receipts"
              : "Generate itemized invoices, monitor Paystack webhooks, and manage client drafts"}
          </p>
        </div>

        {!isClient && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, project, or client..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Project / Deliverable</th>
                <th className="py-3 px-4">Client Organization</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv._id}
                  onClick={() => setSelectedInvoice(inv)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                      {inv.invoiceNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-foreground">
                      {inv.projectId?.name || "Project Engagement"}
                    </span>
                    {inv.deliverableId && (
                      <span className="block text-[11px] text-muted-foreground font-mono">
                        {inv.deliverableId.code}: {inv.deliverableId.title}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground">
                    {inv.projectId?.clientName || "—"}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {formatDate(inv.dueDate)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium",
                        statusStyles[inv.status],
                      )}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs text-primary font-medium group-hover:underline">
                      View Details →
                    </span>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/50 stroke-[1.5] mb-2" />
                    <p className="text-xs font-semibold text-foreground">No invoices found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isClient
                        ? "You have no outstanding invoices awaiting payment."
                        : "Create your first invoice or approve a billable deliverable to trigger billing."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail & Paystack Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg border-l border-border bg-card p-6 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoice Breakdown
                </span>
                <h2 className="text-base font-bold font-mono text-foreground">
                  {selectedInvoice.invoiceNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Status Header Box */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={cn(
                      "ml-2 inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-medium",
                      statusStyles[selectedInvoice.status],
                    )}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Due: </span>
                  <span className="font-mono text-foreground font-semibold">
                    {formatDate(selectedInvoice.dueDate)}
                  </span>
                </div>
              </div>

              {/* Engagement Meta */}
              <div className="rounded-lg border border-border bg-background/50 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-semibold text-foreground">
                    {selectedInvoice.projectId?.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project:</span>
                  <span className="text-foreground">
                    {selectedInvoice.projectId?.name} ({selectedInvoice.projectId?.key})
                  </span>
                </div>
                {selectedInvoice.paystackRef && (
                  <div className="flex justify-between pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Paystack Ref:</span>
                    <span className="font-mono text-emerald-600 font-bold">
                      {selectedInvoice.paystackRef}
                    </span>
                  </div>
                )}
              </div>

              {/* Itemized Line Items */}
              <div>
                <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-2">
                  Itemized Line Items
                </label>
                <div className="divide-y divide-border/60 rounded-lg border border-border bg-background/50 overflow-hidden">
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 text-xs">
                      <span className="text-foreground">{item.description}</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(item.amount, selectedInvoice.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3.5 bg-muted/30 text-xs font-bold border-t border-border">
                    <span>Total Due</span>
                    <span className="font-mono text-base text-primary">
                      {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-border space-y-2.5">
              {/* Pay Online with Paystack (If invoice is SENT and unpaid) */}
              {selectedInvoice.status === "SENT" && (
                <Button
                  variant="emerald"
                  size="lg"
                  className="w-full"
                  onClick={() => handlePaystackCheckout(selectedInvoice)}
                >
                  <CreditCard className="mr-2 h-4 w-4 stroke-[2]" />
                  <span>Pay with Paystack ({formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)})</span>
                </Button>
              )}

              {/* Admin Send Invoice Notice */}
              {!isClient && selectedInvoice.status === "DRAFT" && (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => sendInvoiceMutation.mutate(selectedInvoice._id)}
                  disabled={sendInvoiceMutation.isPending}
                  isLoading={sendInvoiceMutation.isPending}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Send Invoice to Client</span>
                </Button>
              )}

              {selectedInvoice.status === "PAID" && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                  <span>Invoice Paid & Verified via Paystack</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Create Itemized Invoice
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createInvoiceMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Target Project
                </label>
                <Select
                  value={selectedProjectId}
                  disabled={createInvoiceMutation.isPending}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Itemized Deliverables & Charges
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-[11px]"
                    onClick={() =>
                      setItems([...items, { description: "Additional Scope", amount: "500" }])
                    }
                    disabled={createInvoiceMutation.isPending}
                  >
                    + Add Item
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="text"
                        disabled={createInvoiceMutation.isPending}
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Description..."
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        disabled={createInvoiceMutation.isPending}
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].amount = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Amount"
                        className="w-24 font-mono"
                      />
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={createInvoiceMutation.isPending}
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Payment Due Window
                </label>
                <Select
                  value={dueDateDays}
                  disabled={createInvoiceMutation.isPending}
                  onChange={(e) => setDueDateDays(e.target.value)}
                >
                  <option value="7">7 Days</option>
                  <option value="14">14 Days (Default)</option>
                  <option value="30">30 Days</option>
                </Select>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createInvoiceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createInvoiceMutation.mutate()}
                disabled={!selectedProjectId || createInvoiceMutation.isPending}
                isLoading={createInvoiceMutation.isPending}
              >
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
