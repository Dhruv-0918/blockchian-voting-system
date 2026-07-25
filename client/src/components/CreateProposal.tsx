"use client";

import { useState } from "react";

interface CreateProposalProps {
  onSubmit: (title: string, options: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function CreateProposal({
  onSubmit,
  disabled,
}: CreateProposalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 8) setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSubmit = async () => {
    if (!title.trim() || options.some((o) => !o.trim())) return;
    setSubmitting(true);
    try {
      await onSubmit(title.trim(), options.map((o) => o.trim()));
      setTitle("");
      setOptions(["", ""]);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="group flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-900 disabled:opacity-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-400 transition-colors group-hover:border-neutral-600 group-hover:text-white">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-300">
            Create New Proposal
          </p>
          <p className="text-xs text-neutral-500">
            Start a new vote on the blockchain
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">New Proposal</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-neutral-500 hover:text-neutral-300"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-400">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What should we vote on?"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-400">
            Options
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-500">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-neutral-500"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-500 transition-colors hover:border-red-800 hover:text-red-400"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 8 && (
            <button
              onClick={addOption}
              className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add option
            </button>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            submitting || !title.trim() || options.some((o) => !o.trim())
          }
          className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
              Creating on-chain...
            </span>
          ) : (
            "Create Proposal"
          )}
        </button>
      </div>
    </div>
  );
}
