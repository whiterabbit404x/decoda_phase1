export type Identifier = string;
export type Timestamp = string;
export type DecimalString = string;

export type DecisionOutcome = "approve" | "review" | "block";
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type AlertSeverity = "info" | "warning" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type CasePriority = "low" | "medium" | "high" | "critical";
export type CaseStatus = "open" | "in_review" | "escalated" | "closed";
export type CircuitBreakerMode = "closed" | "open" | "half_open";
export type CircuitBreakerScope = "global" | "asset" | "wallet" | "jurisdiction" | "service";
export type OracleConsensusStatus = "accepted" | "stale" | "divergent" | "insufficient_sources";
export type ReconciliationStatus = "matched" | "pending" | "break" | "resolved";
export type WalletType = "treasury" | "customer" | "counterparty" | "issuer" | "exchange";
export type CustodyType = "self_custody" | "qualified_custodian" | "smart_contract";
export type ScreeningState = "clear" | "pending_review" | "hit" | "blocked";

export interface Wallet {
  walletId: Identifier;
  address: string;
  chainId: number;
  walletType: WalletType;
  ownerEntityId: Identifier;
  ownerEntityType: string;
  custodyType: CustodyType;
  jurisdiction?: string;
  riskTier: RiskSeverity;
  sanctionsScreeningState: ScreeningState;
  enabled: boolean;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TokenTransferRequest {
  requestId: Identifier;
  idempotencyKey: string;
  assetSymbol: string;
  assetAddress?: string;
  chainId: number;
  amount: DecimalString;
  currency: string;
  sourceWalletId: Identifier;
  destinationWalletId: Identifier;
  requestedBy: string;
  purpose?: string;
  clientReference?: string;
  status:
    | "draft"
    | "pending_controls"
    | "requires_review"
    | "approved_for_execution"
    | "blocked"
    | "executed"
    | "settled";
  metadata: Record<string, string | number | boolean | null>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RiskSignal {
  signalId: Identifier;
  requestId?: Identifier;
  walletId?: Identifier;
  signalType: string;
  severity: RiskSeverity;
  score: number;
  source: string;
  summary: string;
  evidence: Record<string, string | number | boolean | null>;
  detectedAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface OracleReading {
  readingId: Identifier;
  assetSymbol: string;
  sourceName: string;
  readingType: "price" | "yield" | "fx_rate" | "nav";
  value: number;
  unit: string;
  asOf: Timestamp;
  confidence: number;
  deviationBps?: number;
  metadata: Record<string, string | number | boolean | null>;
}

export interface OracleConsensusDecision {
  consensusId: Identifier;
  assetSymbol: string;
  decision: OracleConsensusStatus;
  consensusValue?: number;
  allowedDeviationBps: number;
  observedSpreadBps: number;
  minimumSources: number;
  participatingSources: string[];
  rejectedSources: string[];
  stale: boolean;
  createdAt: Timestamp;
}

export interface ProvenanceRecord {
  provenanceRecordId: Identifier;
  recordType: string;
  sourceSystem: string;
  sourceId: string;
  hash?: string;
  uri?: string;
  capturedAt: Timestamp;
  observer: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface ComplianceDecision {
  complianceDecisionId: Identifier;
  requestId: Identifier;
  decision: DecisionOutcome;
  reviewRequired: boolean;
  policyVersion: string;
  jurisdiction?: string;
  reasons: string[];
  sanctionsHitIds: Identifier[];
  createdAt: Timestamp;
}

export interface SanctionsHit {
  hitId: Identifier;
  walletId: Identifier;
  provider: string;
  matchScore: number;
  matchedName: string;
  listName: string;
  reviewStatus: "new" | "confirmed" | "dismissed";
  evidence: Record<string, string | number | boolean | null>;
  detectedAt: Timestamp;
}

export interface ReconciliationEvent {
  reconciliationEventId: Identifier;
  requestId?: Identifier;
  ledgerReference: string;
  chainReference?: string;
  status: ReconciliationStatus;
  differenceAmount?: DecimalString;
  differenceCurrency?: string;
  summary: string;
  recordedAt: Timestamp;
  metadata: Record<string, string | number | boolean | null>;
}

export interface CircuitBreakerState {
  circuitBreakerId: Identifier;
  scope: CircuitBreakerScope;
  scopeReference: string;
  state: CircuitBreakerMode;
  reason: string;
  triggeredBy: string;
  thresholdKey: string;
  triggerValue?: number;
  resetAt?: Timestamp;
  manualOverride: boolean;
  updatedAt: Timestamp;
}

export interface Alert {
  alertId: Identifier;
  category: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  entityType: string;
  entityId: Identifier;
  serviceName: string;
  correlationId?: Identifier;
  createdAt: Timestamp;
  acknowledgedAt?: Timestamp;
  metadata: Record<string, string | number | boolean | null>;
}

export interface InvestigationCase {
  caseId: Identifier;
  caseType: string;
  status: CaseStatus;
  priority: CasePriority;
  subjectEntityType: string;
  subjectEntityId: Identifier;
  openedBy: string;
  assignedTo?: string;
  summary: string;
  alertIds: Identifier[];
  decisionRefs: Identifier[];
  openedAt: Timestamp;
  closedAt?: Timestamp;
}
