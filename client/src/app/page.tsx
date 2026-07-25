"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CreateProposal from "@/components/CreateProposal";
import ProposalCard from "@/components/ProposalCard";
import { useWallet, useProposals } from "@/hooks/contract";

export default function Home() {
  const { address } = useWallet();
  const {
    proposals,
    loading,
    error,
    refresh,
    createProposal,
    vote,
    closeProposal,
  } = useProposals(address);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  const filtered = proposals.filter((p) => {
    if (filter === "active") return p.active;
    if (filter === "closed") return !p.active;
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-neutral-800">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="glow absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-1.5 text-xs font-medium text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Powered by Soroban Smart Contracts
          </div>

          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Decentralized Voting,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              On-Chain
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            Create proposals, cast votes, and verify results — all recorded
            immutably on the Stellar blockchain.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              Tamper-Proof
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
              Instant Results
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              Wallet Auth
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {/* Actions Bar */}
        <div className="mb-8 space-y-6">
          <CreateProposal onSubmit={createProposal} disabled={!address} />

          {!address && (
            <p className="text-center text-sm text-neutral-500">
              Connect your Stellar wallet to create proposals and vote
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/50 p-1">
            {(["all", "active", "closed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "all" && proposals.length > 0 && (
                  <span className="ml-1.5 text-neutral-600">
                    {proposals.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-violet-500" />
              <p className="text-sm text-neutral-500">
                Loading proposals from chain...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
              <svg
                className="h-8 w-8 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-300">
              {filter === "all"
                ? "No proposals yet"
                : `No ${filter} proposals`}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {filter === "all"
                ? "Be the first to create a proposal on the blockchain"
                : "Try a different filter"}
            </p>
          </div>
        )}

        {/* Proposals Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onVote={vote}
                onClose={closeProposal}
                walletAddress={address}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-neutral-600">
          <span>StellarVote</span>
          <span>
            Built on{" "}
            <a
              href="https://stellar.org"
              className="text-neutral-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stellar
            </a>{" "}
            /{" "}
            <a
              href="https://soroban.stellar.org"
              className="text-neutral-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Soroban
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
