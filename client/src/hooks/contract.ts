"use client";

import { useState, useEffect, useCallback } from "react";
import type { Proposal } from "contract";
import {
  getWalletAddress,
  connectWallet,
  createProposal as cp,
  vote as cv,
  closeProposal as ccl,
  getAllProposals,
  getVoteCount,
  isVoted,
  CONTRACT_ADDRESS,
} from "@/lib/contract";

export interface ProposalWithVotes extends Proposal {
  votes: number[];
  userVotedIndex: number | null;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    getWalletAddress().then((addr) => {
      if (addr) setAddress(addr);
    });
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      if (addr) setAddress(addr);
    } finally {
      setConnecting(false);
    }
  }, []);

  return { address, connecting, connect, isContractSet: !!CONTRACT_ADDRESS };
}

export function useProposals(walletAddress: string | null) {
  const [proposals, setProposals] = useState<ProposalWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllProposals();
      const enriched: ProposalWithVotes[] = await Promise.all(
        raw.map(async (p: Proposal) => {
          const votes = await Promise.all(
            p.options.map((_: string, i: number) => getVoteCount(p.id, i))
          );
          let userVotedIndex: number | null = null;
          if (walletAddress) {
            const voted = await isVoted(p.id, walletAddress);
            if (voted) {
              userVotedIndex = -1; // marked as voted
            }
          }
          return { ...p, votes, userVotedIndex };
        })
      );
      setProposals(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProposal = useCallback(
    async (title: string, options: string[]) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      await cp(walletAddress, title, options);
      await refresh();
    },
    [walletAddress, refresh]
  );

  const vote = useCallback(
    async (proposalId: number, optionIndex: number) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      await cv(walletAddress, proposalId, optionIndex);
      await refresh();
    },
    [walletAddress, refresh]
  );

  const closeProposal = useCallback(
    async (proposalId: number) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      await ccl(walletAddress, proposalId);
      await refresh();
    },
    [walletAddress, refresh]
  );

  return {
    proposals,
    loading,
    error,
    refresh,
    createProposal,
    vote,
    closeProposal,
  };
}
