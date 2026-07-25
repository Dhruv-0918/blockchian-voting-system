import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA5KOK6YYFCCOKTBJUO5VYNHLAGXFQT5YXLYS77JJDQ6MWH3Y7QHFKVG",
  }
} as const

export type DataKey = {tag: "Proposal", values: readonly [u32]} | {tag: "VoteCount", values: readonly [u32, u32]} | {tag: "Voted", values: readonly [u32, string]} | {tag: "NextId", values: void};


export interface Proposal {
  active: boolean;
  creator: string;
  id: u32;
  options: Array<string>;
  title: string;
  total_votes: u32;
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({voter, proposal_id, option_index}: {voter: string, proposal_id: u32, option_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a is_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_voted: ({proposal_id, voter}: {proposal_id: u32, voter: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposal: ({proposal_id}: {proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Proposal>>

  /**
   * Construct and simulate a close_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_proposal: ({caller, proposal_id}: {caller: string, proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_vote_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_vote_count: ({proposal_id, option_index}: {proposal_id: u32, option_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_proposal: ({creator, title, options}: {creator: string, title: string, options: Array<string>}, methodOptions?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_proposals_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposals_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAACFByb3Bvc2FsAAAAAQAAAAQAAAABAAAAAAAAAAlWb3RlQ291bnQAAAAAAAACAAAABAAAAAQAAAABAAAAAAAAAAVWb3RlZAAAAAAAAAIAAAAEAAAAEwAAAAAAAAAAAAAABk5leHRJZAAA",
        "AAAAAQAAAAAAAAAAAAAACFByb3Bvc2FsAAAABgAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAdvcHRpb25zAAAAA+oAAAAQAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAC3RvdGFsX3ZvdGVzAAAAAAQ=",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAAAAAAMb3B0aW9uX2luZGV4AAAABAAAAAA=",
        "AAAAAAAAAAAAAAAIaXNfdm90ZWQAAAACAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAEAAAAAAAAAAV2b3RlcgAAAAAAABMAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb3Bvc2FsAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAfQAAAACFByb3Bvc2Fs",
        "AAAAAAAAAAAAAAAOY2xvc2VfcHJvcG9zYWwAAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAOZ2V0X3ZvdGVfY291bnQAAAAAAAIAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAQAAAAAAAAADG9wdGlvbl9pbmRleAAAAAQAAAABAAAABA==",
        "AAAAAAAAAAAAAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAdvcHRpb25zAAAAA+oAAAAQAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAATZ2V0X3Byb3Bvc2Fsc19jb3VudAAAAAAAAAAAAQAAAAQ=" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<null>,
        is_voted: this.txFromJSON<boolean>,
        get_proposal: this.txFromJSON<Proposal>,
        close_proposal: this.txFromJSON<null>,
        get_vote_count: this.txFromJSON<u32>,
        create_proposal: this.txFromJSON<u32>,
        get_proposals_count: this.txFromJSON<u32>
  }
}