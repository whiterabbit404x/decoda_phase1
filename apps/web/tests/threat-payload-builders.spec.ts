import { expect, test } from '@playwright/test';

import { threatDefaults } from '../app/policy-builders';
import {
  buildTransactionPayload,
  suggestedThreatAnalysisType,
  validateAnalysisCombination,
  type ThreatTarget,
} from '../app/threat-payload-builders';

test('wallet target defaults to transaction analysis', async () => {
  const target: ThreatTarget = {
    id: 't-1',
    name: 'Ops wallet',
    target_type: 'wallet',
    chain_network: 'ethereum',
    enabled: true,
    wallet_address: '0x1111111111111111111111111111111111111111',
  };

  expect(suggestedThreatAnalysisType(target)).toBe('transaction');
  expect(validateAnalysisCombination(target, 'contract')).toContain('Wallet targets should run transaction analysis');
});

test('contract target defaults to contract analysis', async () => {
  const target: ThreatTarget = {
    id: 't-2',
    name: 'Router',
    target_type: 'contract',
    chain_network: 'ethereum',
    enabled: true,
    contract_identifier: '0x2222222222222222222222222222222222222222',
  };

  expect(suggestedThreatAnalysisType(target)).toBe('contract');
});

test('transaction payload builder includes target metadata and module policy', async () => {
  const target: ThreatTarget = {
    id: 't-3',
    name: 'Treasury wallet',
    target_type: 'wallet',
    chain_network: 'ethereum',
    enabled: true,
    wallet_address: '0x3333333333333333333333333333333333333333',
    owner_notes: 'critical wallet',
    severity_preference: 'high',
    tags: ['treasury', 'hot-wallet'],
  };

  const payload = buildTransactionPayload(target, threatDefaults, {
    wallet: target.wallet_address!,
    actor: 'treasury-ops',
    action_type: 'settlement',
    protocol: 'TreasurySettlement',
    amount: 125000,
    asset: 'USTB',
    call_sequence: ['validateInvoice', 'settleTreasuryTransfer'],
    flags: { contains_flash_loan: false, unexpected_admin_call: false, untrusted_contract: false, rapid_drain_indicator: false },
    counterparty_reputation: 90,
    actor_role: 'treasury-operator',
    expected_actor_roles: ['treasury-operator'],
    burst_actions_last_5m: 1,
  });

  expect(payload.metadata.target_id).toBe('t-3');
  expect(payload.metadata.owner_notes).toBe('critical wallet');
  expect(payload.metadata.module_config.large_transfer_threshold).toBe(threatDefaults.large_transfer_threshold);
});
