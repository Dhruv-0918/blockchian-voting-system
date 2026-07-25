#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn create_env() -> Env {
    Env::default()
}

fn create_client(env: &Env) -> (Address, ContractClient<'static>) {
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    (admin, client)
}

#[test]
fn test_create_proposal() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Best Framework");
    let opt1 = String::from_str(&env, "React");
    let opt2 = String::from_str(&env, "Vue");
    let opt3 = String::from_str(&env, "Svelte");
    let options = soroban_sdk::vec![&env, opt1, opt2, opt3];

    let id = client.create_proposal(&user, &title, &options);
    assert_eq!(id, 0);

    let proposal = client.get_proposal(&id);
    assert_eq!(proposal.title, title);
    assert_eq!(proposal.options.len(), 3);
    assert_eq!(proposal.creator, user);
    assert!(proposal.active);
    assert_eq!(proposal.total_votes, 0);
}

#[test]
fn test_vote() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Favorite Color");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "Red"),
        String::from_str(&env, "Blue"),
    ];

    let id = client.create_proposal(&user, &title, &options);

    let voter = Address::generate(&env);
    client.vote(&voter, &id, &0);

    assert_eq!(client.get_vote_count(&id, &0), 1);
    assert_eq!(client.get_vote_count(&id, &1), 0);
    assert!(client.is_voted(&id, &voter));
    assert_eq!(client.get_proposal(&id).total_votes, 1);
}

#[test]
fn test_multiple_voters() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Language");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "Rust"),
        String::from_str(&env, "Go"),
    ];

    let id = client.create_proposal(&user, &title, &options);

    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);
    let voter3 = Address::generate(&env);

    client.vote(&voter1, &id, &0);
    client.vote(&voter2, &id, &1);
    client.vote(&voter3, &id, &0);

    assert_eq!(client.get_vote_count(&id, &0), 2);
    assert_eq!(client.get_vote_count(&id, &1), 1);
    assert_eq!(client.get_proposal(&id).total_votes, 3);
}

#[test]
#[should_panic(expected = "already voted")]
fn test_cannot_vote_twice() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Topic");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "A"),
        String::from_str(&env, "B"),
    ];

    let id = client.create_proposal(&user, &title, &options);
    let voter = Address::generate(&env);

    client.vote(&voter, &id, &0);
    client.vote(&voter, &id, &1); // Should panic
}

#[test]
#[should_panic(expected = "proposal not active")]
fn test_cannot_vote_inactive_proposal() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Topic");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "A"),
        String::from_str(&env, "B"),
    ];

    let id = client.create_proposal(&user, &title, &options);
    client.close_proposal(&user, &id);

    let voter = Address::generate(&env);
    client.vote(&voter, &id, &0); // Should panic
}

#[test]
fn test_close_proposal() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Topic");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "A"),
        String::from_str(&env, "B"),
    ];

    let id = client.create_proposal(&user, &title, &options);
    assert!(client.get_proposal(&id).active);

    client.close_proposal(&user, &id);
    assert!(!client.get_proposal(&id).active);
}

#[test]
#[should_panic(expected = "invalid option index")]
fn test_invalid_option() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    let title = String::from_str(&env, "Topic");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "A"),
        String::from_str(&env, "B"),
    ];

    let id = client.create_proposal(&user, &title, &options);

    let voter = Address::generate(&env);
    client.vote(&voter, &id, &5); // Invalid index
}

#[test]
fn test_get_proposals_count() {
    let env = create_env();
    env.mock_all_auths();
    let (user, client) = create_client(&env);

    assert_eq!(client.get_proposals_count(), 0);

    let title1 = String::from_str(&env, "Proposal 1");
    let options = soroban_sdk::vec![
        &env,
        String::from_str(&env, "Yes"),
        String::from_str(&env, "No"),
    ];
    client.create_proposal(&user, &title1, &options);
    assert_eq!(client.get_proposals_count(), 1);

    let title2 = String::from_str(&env, "Proposal 2");
    client.create_proposal(&user, &title2, &options);
    assert_eq!(client.get_proposals_count(), 2);
}
