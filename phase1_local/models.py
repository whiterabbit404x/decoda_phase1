"""Shared Phase 1 domain models for Python services."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Identifier = str
Timestamp = str
DecimalString = str
MetadataValue = str | int | float | bool | None
MetadataMap = dict[str, MetadataValue]

DecisionOutcome = Literal['approve', 'review', 'block']
RiskSeverity = Literal['low', 'medium', 'high', 'critical']
AlertSeverity = Literal['info', 'warning', 'high', 'critical']
AlertStatus = Literal['open', 'acknowledged', 'resolved']
CasePriority = Literal['low', 'medium', 'high', 'critical']
CaseStatus = Literal['open', 'in_review', 'escalated', 'closed']
CircuitBreakerMode = Literal['closed', 'open', 'half_open']
CircuitBreakerScope = Literal['global', 'asset', 'wallet', 'jurisdiction', 'service']
OracleConsensusStatus = Literal['accepted', 'stale', 'divergent', 'insufficient_sources']
ReconciliationStatus = Literal['matched', 'pending', 'break', 'resolved']
WalletType = Literal['treasury', 'customer', 'counterparty', 'issuer', 'exchange']
CustodyType = Literal['self_custody', 'qualified_custodian', 'smart_contract']
ScreeningState = Literal['clear', 'pending_review', 'hit', 'blocked']
ReadingType = Literal['price', 'yield', 'fx_rate', 'nav']
SanctionsReviewStatus = Literal['new', 'confirmed', 'dismissed']
TransferStatus = Literal['draft', 'pending_controls', 'requires_review', 'approved_for_execution', 'blocked', 'executed', 'settled']


@dataclass(slots=True)
class Wallet:
    wallet_id: Identifier
    address: str
    chain_id: int
    wallet_type: WalletType
    owner_entity_id: Identifier
    owner_entity_type: str
    custody_type: CustodyType
    jurisdiction: str | None
    risk_tier: RiskSeverity
    sanctions_screening_state: ScreeningState
    enabled: bool
    metadata: MetadataMap = field(default_factory=dict)
    created_at: Timestamp = ''
    updated_at: Timestamp = ''


@dataclass(slots=True)
class TokenTransferRequest:
    request_id: Identifier
    idempotency_key: str
    asset_symbol: str
    chain_id: int
    amount: DecimalString
    currency: str
    source_wallet_id: Identifier
    destination_wallet_id: Identifier
    requested_by: str
    status: TransferStatus
    asset_address: str | None = None
    purpose: str | None = None
    client_reference: str | None = None
    metadata: MetadataMap = field(default_factory=dict)
    created_at: Timestamp = ''
    updated_at: Timestamp = ''


@dataclass(slots=True)
class RiskSignal:
    signal_id: Identifier
    signal_type: str
    severity: RiskSeverity
    score: float
    source: str
    summary: str
    detected_at: Timestamp
    request_id: Identifier | None = None
    wallet_id: Identifier | None = None
    evidence: MetadataMap = field(default_factory=dict)
    expires_at: Timestamp | None = None


@dataclass(slots=True)
class OracleReading:
    reading_id: Identifier
    asset_symbol: str
    source_name: str
    reading_type: ReadingType
    value: float
    unit: str
    as_of: Timestamp
    confidence: float
    deviation_bps: int | None = None
    metadata: MetadataMap = field(default_factory=dict)


@dataclass(slots=True)
class OracleConsensusDecision:
    consensus_id: Identifier
    asset_symbol: str
    decision: OracleConsensusStatus
    allowed_deviation_bps: int
    observed_spread_bps: int
    minimum_sources: int
    participating_sources: list[str] = field(default_factory=list)
    rejected_sources: list[str] = field(default_factory=list)
    stale: bool = False
    created_at: Timestamp = ''
    consensus_value: float | None = None


@dataclass(slots=True)
class ProvenanceRecord:
    provenance_record_id: Identifier
    record_type: str
    source_system: str
    source_id: str
    captured_at: Timestamp
    observer: str
    metadata: MetadataMap = field(default_factory=dict)
    hash: str | None = None
    uri: str | None = None


@dataclass(slots=True)
class ComplianceDecision:
    compliance_decision_id: Identifier
    request_id: Identifier
    decision: DecisionOutcome
    review_required: bool
    policy_version: str
    reasons: list[str] = field(default_factory=list)
    sanctions_hit_ids: list[Identifier] = field(default_factory=list)
    created_at: Timestamp = ''
    jurisdiction: str | None = None


@dataclass(slots=True)
class SanctionsHit:
    hit_id: Identifier
    wallet_id: Identifier
    provider: str
    match_score: float
    matched_name: str
    list_name: str
    review_status: SanctionsReviewStatus
    detected_at: Timestamp
    evidence: MetadataMap = field(default_factory=dict)


@dataclass(slots=True)
class ReconciliationEvent:
    reconciliation_event_id: Identifier
    ledger_reference: str
    status: ReconciliationStatus
    summary: str
    recorded_at: Timestamp
    request_id: Identifier | None = None
    chain_reference: str | None = None
    difference_amount: DecimalString | None = None
    difference_currency: str | None = None
    metadata: MetadataMap = field(default_factory=dict)


@dataclass(slots=True)
class CircuitBreakerState:
    circuit_breaker_id: Identifier
    scope: CircuitBreakerScope
    scope_reference: str
    state: CircuitBreakerMode
    reason: str
    triggered_by: str
    threshold_key: str
    manual_override: bool
    updated_at: Timestamp
    trigger_value: float | None = None
    reset_at: Timestamp | None = None


@dataclass(slots=True)
class Alert:
    alert_id: Identifier
    category: str
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: str
    entity_type: str
    entity_id: Identifier
    service_name: str
    created_at: Timestamp
    correlation_id: Identifier | None = None
    acknowledged_at: Timestamp | None = None
    metadata: MetadataMap = field(default_factory=dict)


@dataclass(slots=True)
class InvestigationCase:
    case_id: Identifier
    case_type: str
    status: CaseStatus
    priority: CasePriority
    subject_entity_type: str
    subject_entity_id: Identifier
    opened_by: str
    summary: str
    alert_ids: list[Identifier] = field(default_factory=list)
    decision_refs: list[Identifier] = field(default_factory=list)
    opened_at: Timestamp = ''
    assigned_to: str | None = None
    closed_at: Timestamp | None = None
