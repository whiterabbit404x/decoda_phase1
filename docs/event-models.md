# Phase 1 Event Models

## Event Design Principles

All domain events must be:

- versioned,
- immutable,
- correlated across services,
- self-describing enough for audit and replay,
- compatible with SQLite storage in Phase 1 and a message bus later.

## Standard Event Envelope

```json
{
  "eventId": "evt_123",
  "eventType": "transfer.requested",
  "version": 1,
  "producer": "api",
  "correlationId": "corr_123",
  "causationId": "req_123",
  "entityType": "token_transfer_request",
  "entityId": "txr_123",
  "occurredAt": "2026-03-18T00:00:00Z",
  "payload": {},
  "provenance": {
    "recordType": "api_request",
    "sourceSystem": "dashboard",
    "sourceId": "request-abc",
    "capturedAt": "2026-03-18T00:00:00Z",
    "observer": "api"
  }
}
```

## Event Families

### 1. Transfer Events

#### `transfer.requested`
Emitted by API after request validation.

Payload:
- `request`
- `sourceWallet`
- `destinationWallet`
- `requestedBy`

#### `transfer.approved`
Emitted when risk, compliance, oracle, and circuit breaker checks pass.

Payload:
- `requestId`
- `riskDecisionId`
- `complianceDecisionId`
- `oracleConsensusId`
- `approvedAt`

#### `transfer.blocked`
Emitted when any control blocks execution.

Payload:
- `requestId`
- `blockingService`
- `reasonCodes`
- `caseId`
- `alertIds`

#### `transfer.executed`
Emitted by Event Watcher after chain confirmation.

Payload:
- `requestId`
- `transactionHash`
- `blockNumber`
- `executedAmount`
- `executedAt`

### 2. Risk Events

#### `risk.assessed`
Payload:
- `requestId`
- `riskDecision`
- `signals`

#### `risk.signal.detected`
Payload:
- `signal`
- `walletId`
- `requestId`

### 3. Oracle Events

#### `oracle.reading.ingested`
Payload:
- `reading`
- `assetSymbol`
- `sourceName`

#### `oracle.consensus.computed`
Payload:
- `consensusDecision`
- `readingIds`

### 4. Compliance Events

#### `compliance.screened`
Payload:
- `requestId`
- `complianceDecision`
- `sanctionsHits`

#### `compliance.hit.detected`
Payload:
- `walletId`
- `sanctionsHit`

### 5. Reconciliation Events

#### `reconciliation.completed`
Payload:
- `requestId`
- `reconciliationEvent`

#### `reconciliation.break_detected`
Payload:
- `requestId`
- `differenceAmount`
- `differenceCurrency`
- `summary`

### 6. Control and Operations Events

#### `circuit_breaker.updated`
Payload:
- `circuitBreakerState`
- `previousState`

#### `alert.created`
Payload:
- `alert`

#### `case.opened`
Payload:
- `investigationCase`

#### `audit.recorded`
Payload:
- `auditLogId`
- `entityType`
- `entityId`
- `action`

## Event Relationships

### Transfer control sequence

```text
transfer.requested
  ├─> oracle.consensus.computed
  ├─> risk.assessed
  ├─> compliance.screened
  ├─> circuit_breaker.updated (optional)
  ├─> transfer.approved | transfer.blocked
  └─> case.opened / alert.created (conditional)
```

### Settlement sequence

```text
transfer.executed
  ├─> reconciliation.completed
  ├─> reconciliation.break_detected (conditional)
  └─> audit.recorded
```

## Event Storage Table

### `domain_events`
- `event_id` TEXT PRIMARY KEY
- `event_type` TEXT NOT NULL
- `version` INTEGER NOT NULL
- `producer` TEXT NOT NULL
- `correlation_id` TEXT
- `causation_id` TEXT
- `entity_type` TEXT NOT NULL
- `entity_id` TEXT NOT NULL
- `occurred_at` TEXT NOT NULL
- `payload_json` TEXT NOT NULL
- `provenance_json` TEXT NOT NULL
- `published_at` TEXT
- `delivery_state` TEXT NOT NULL

## Replay Rules

- Consumers must ignore unknown fields.
- Producers may only make additive changes within the same version.
- Breaking changes require a new event version and dual-read period.
- All event payloads should reference canonical shared models instead of bespoke shapes.
