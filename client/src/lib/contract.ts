"use client";

import { Client, networks } from "contract";
import * as freighter from "@stellar/freighter-api";
import { TransactionBuilder, rpc } from "@stellar/stellar-sdk";

// ─── Configuration ───────────────────────────────────────────────
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

const RPC_URL = "https://soroban-testnet.stellar.org";
const { networkPassphrase, contractId } = networks.testnet;

// ─── Contract Client ─────────────────────────────────────────────
function getContractClient() {
  if (!CONTRACT_ADDRESS) return null;
  return new Client({
    contractId: CONTRACT_ADDRESS,
    networkPassphrase,
    rpcUrl: RPC_URL,
  });
}

// ─── Wallet Helpers ──────────────────────────────────────────────
export async function getWalletAddress(): Promise<string | null> {
  try {
    const { isConnected } = await freighter.isConnected();
    if (!isConnected) return null;
    const { address } = await freighter.getAddress();
    return address;
  } catch {
    return null;
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    await freighter.requestAccess();
    const { address } = await freighter.getAddress();
    return address;
  } catch {
    return null;
  }
}

async function signAndSend(
  assembledXdr: string
): Promise<{ hash: string; success: boolean }> {
  const { signedTxXdr } = await freighter.signTransaction(assembledXdr, {
    networkPassphrase,
  });
  const tx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
  const server = new rpc.Server(RPC_URL);
  const result = await server.sendTransaction(tx);
  if (result.status !== "PENDING") {
    throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
  }
  let attempts = 0;
  while (attempts < 15) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(result.hash);
    if (txResult.status === "SUCCESS") {
      return { hash: result.hash, success: true };
    }
    if (txResult.status === "FAILED") {
      return { hash: result.hash, success: false };
    }
    attempts++;
  }
  return { hash: result.hash, success: false };
}

// ─── Typed Contract Wrappers ─────────────────────────────────────

export async function createProposal(
  creator: string,
  title: string,
  options: string[]
): Promise<{ hash: string; success: boolean }> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.create_proposal({ creator, title, options });
  return signAndSend(tx.toXDR());
}

export async function vote(
  voter: string,
  proposalId: number,
  optionIndex: number
): Promise<{ hash: string; success: boolean }> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.vote({
    voter,
    proposal_id: proposalId,
    option_index: optionIndex,
  });
  return signAndSend(tx.toXDR());
}

export async function closeProposal(
  caller: string,
  proposalId: number
): Promise<{ hash: string; success: boolean }> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.close_proposal({
    caller,
    proposal_id: proposalId,
  });
  return signAndSend(tx.toXDR());
}

export async function getProposal(proposalId: number) {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.get_proposal({ proposal_id: proposalId });
  return tx.result;
}

export async function getVoteCount(
  proposalId: number,
  optionIndex: number
): Promise<number> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.get_vote_count({
    proposal_id: proposalId,
    option_index: optionIndex,
  });
  return tx.result;
}

export async function isVoted(
  proposalId: number,
  voter: string
): Promise<boolean> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.is_voted({ proposal_id: proposalId, voter });
  return tx.result;
}

export async function getProposalsCount(): Promise<number> {
  const client = getContractClient();
  if (!client) throw new Error("Contract not configured");
  const tx = await client.get_proposals_count();
  return tx.result;
}

export async function getAllProposals() {
  const count = await getProposalsCount();
  const proposals = [];
  for (let i = 0; i < count; i++) {
    try {
      const p = await getProposal(i);
      proposals.push(p);
    } catch {
      // skip broken proposals
    }
  }
  return proposals;
}
