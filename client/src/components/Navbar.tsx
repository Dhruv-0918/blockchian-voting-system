"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/contract";
import { truncateAddress } from "@/lib/utils";

export default function Navbar() {
  const { address, connecting, connect, isContractSet } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            StellarVote
          </span>
          <span className="ml-2 hidden rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-400 sm:inline-block">
            Testnet
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isContractSet && mounted && (
            <span className="text-xs text-amber-400">
              Set NEXT_PUBLIC_CONTRACT_ADDRESS
            </span>
          )}
          {mounted && address ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 font-mono text-sm text-neutral-300">
                {truncateAddress(address)}
              </span>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
            >
              {connecting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                  Connecting
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
