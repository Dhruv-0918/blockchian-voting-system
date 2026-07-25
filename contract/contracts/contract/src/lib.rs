#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proposal {
    pub id: u32,
    pub title: String,
    pub options: Vec<String>,
    pub creator: Address,
    pub active: bool,
    pub total_votes: u32,
}

#[contracttype]
pub enum DataKey {
    Proposal(u32),
    VoteCount(u32, u32), // (proposal_id, option_index) -> count
    Voted(u32, Address), // (proposal_id, voter) -> bool
    NextId,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn create_proposal(
        env: Env,
        creator: Address,
        title: String,
        options: Vec<String>,
    ) -> u32 {
        creator.require_auth();
        assert!(options.len() >= 2, "need at least 2 options");

        let id: u32 = env
            .storage()
            .instance()
            .get::<_, u32>(&DataKey::NextId)
            .unwrap_or(0);

        let proposal = Proposal {
            id,
            title,
            options,
            creator,
            active: true,
            total_votes: 0,
        };

        env.storage().instance().set(&DataKey::Proposal(id), &proposal);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        id
    }

    pub fn vote(env: Env, voter: Address, proposal_id: u32, option_index: u32) {
        voter.require_auth();

        let mut proposal: Proposal = env
            .storage()
            .instance()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found");

        assert!(proposal.active, "proposal not active");
        assert!(
            option_index < proposal.options.len(),
            "invalid option index"
        );
        assert!(
            !env.storage()
                .instance()
                .has(&DataKey::Voted(proposal_id, voter.clone())),
            "already voted"
        );

        let key = DataKey::VoteCount(proposal_id, option_index);
        let count: u32 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(count + 1));

        proposal.total_votes += 1;
        env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);
        env.storage().instance().set(&DataKey::Voted(proposal_id, voter), &true);
    }

    pub fn close_proposal(env: Env, caller: Address, proposal_id: u32) {
        caller.require_auth();

        let mut proposal: Proposal = env
            .storage()
            .instance()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found");

        assert!(proposal.creator == caller, "only creator can close");
        proposal.active = false;

        env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);
    }

    pub fn get_proposal(env: Env, proposal_id: u32) -> Proposal {
        env.storage()
            .instance()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found")
    }

    pub fn get_vote_count(env: Env, proposal_id: u32, option_index: u32) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::VoteCount(proposal_id, option_index))
            .unwrap_or(0)
    }

    pub fn is_voted(env: Env, proposal_id: u32, voter: Address) -> bool {
        env.storage()
            .instance()
            .has(&DataKey::Voted(proposal_id, voter))
    }

    pub fn get_proposals_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get::<_, u32>(&DataKey::NextId)
            .unwrap_or(0)
    }
}

mod test;
