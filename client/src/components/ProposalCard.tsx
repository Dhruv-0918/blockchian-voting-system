"use client";

import { useState } from "react";
import type { ProposalWithVotes } from "@/hooks/contract";
import { truncateAddress } from "@/lib/utils";

interface ProposalCardProps {
  proposal: ProposalWithVotes;
  onVote: (proposalId: number, optionIndex: number) => Promise<void>;
  onClose: (proposalId: number) => Promise<void>;
  walletAddress: string | null;
}

export default function ProposalCard({
  proposal,
  onVote,
  onClose,
  walletAddress,
}: ProposalCardProps) {
  const [votingIndex, setVotingIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  const totalVotes = proposal.votes.reduce((a, b) => a + b, 0);
  const isCreator = walletAddress === proposal.creator;
  const hasVoted = proposal.userVotedIndex !== null;

  const handleVote = async (idx: number) => {
    setVotingIndex(idx);
    try {
      await onVote(proposal.id, idx);
    } catch (e) {
      console.error(e);
    } finally {
      setVotingIndex(null);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await onClose(proposal.id);
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(false);
    }
  };

  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getWinnerIndex = () => {
    if (totalVotes === 0) return -1;
    let max = 0;
    let idx = 0;
    proposal.votes.forEach((v, i) => {
      if (v > max) {
        max = v;
        idx = i;
      }
    });
    return max > 0 ? idx : -1;
  };

  const winnerIdx = getWinnerIndex();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-neutral-700">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">
              #{proposal.id}
            </span>
            {!proposal.active && (
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-400">
                Closed
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
          <p className="mt-1 text-xs text-neutral-500">
            by {truncateAddress(proposal.creator)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalVotes}</p>
          <p className="text-xs text-neutral-500">
            {totalVotes === 1 ? "vote" : "votes"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {proposal.options.map((option, idx) => {
          const pct = getPercentage(proposal.votes[idx]);
          const isWinner = idx === winnerIdx;
          const isVoting = votingIndex === idx;

          return (
            <div key={idx} className="relative">
              {proposal.active && !hasVoted ? (
                <button
                  onClick={() => handleVote(idx)}
                  disabled={votingIndex !== null || !walletAddress}
                  className="group relative w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-left transition-all hover:border-neutral-600 disabled:opacity-50"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 transition-all group-hover:from-violet-500/20 group-hover:to-indigo-500/20"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">
                      {option}
                    </span>
                    {isVoting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
                    ) : (
                      <span className="text-xs text-neutral-500">
                        {pct > 0 ? `${pct}%` : "Vote"}
                      </span>
                    )}
                  </div>
                </button>
              ) : (
                <div
                  className={`relative w-full overflow-hidden rounded-lg border p-3 ${
                    isWinner && totalVotes > 0
                      ? "border-violet-500/30 bg-violet-500/5"
                      : "border-neutral-800 bg-neutral-800/30"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-neutral-700/20 to-neutral-700/5 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isWinner && totalVotes > 0 && (
                        <svg
                          className="h-4 w-4 text-violet-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isWinner && totalVotes > 0
                            ? "text-violet-300"
                            : "text-neutral-300"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        {proposal.votes[idx]}
                      </span>
                      <span className="text-xs text-neutral-500">{pct}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCreator && proposal.active && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClose}
            disabled={closing}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-red-800 hover:text-red-400"
          >
            {closing ? "Closing..." : "Close Proposal"}
          </button>
        </div>
      )}
    </div>
  );
}
