# Phase 1 API Specification

## Purpose

The API Gateway is the control-plane entry point for operators and dashboard clients. In Phase 1 the implementation can remain lightweight, but the contract should already reflect the future multi-service workflow.

## Conventions

- Base URL: `/`
- Content type: `application/json`
- Timestamps: ISO 8601 UTC strings
- IDs: opaque strings
- Monetary/token amounts: decimal strings to preserve precision
- Idempotent write endpoints should require `Idempotency-Key`
- Every mutating request should return `correlationId`

## Existing Operational Endpoints

### `GET /health`
Returns service health metadata.

Response:
```json
{
  "status": "ok",
  "service": "api",
  "port": 8000,
  "app_mode": "local",
  "database_url": "sqlite:////workspace/decoda_phase1/.data/phase1.db",
  "redis_enabled": false
}
```

### `GET /services`
Returns registered service status and metrics.

### `GET /dashboard`
Returns dashboard cards and service summaries.

## Proposed Control Plane Endpoints

### `POST /v1/transfers`
Create a token transfer request.

Headers:
- `Idempotency-Key: <value>`

Request body:
```json
{
  "assetSymbol": "USTB",
  "assetAddress": "0xasset",
  "chainId": 1,
  "amount": "1000000.00",
  "currency": "USD",
  "sourceWalletId": "wal_src",
  "destinationWalletId": "wal_dst",
  "requestedBy": "operator@example.com",
  "purpose": "primary issuance",
  "clientReference": "ticket-42",
  "metadata": {
    "channel": "dashboard"
  }
}
```

Successful response:
```json
{
  "requestId": "txr_123",
  "status": "pending_controls",
  "correlationId": "corr_123",
  "createdAt": "2026-03-18T00:00:00Z"
}
```

### `GET /v1/transfers/{requestId}`
Return transfer status and attached decisions.

Response includes:
- `TokenTransferRequest`
- `RiskSignal[]`
- `OracleConsensusDecision`
- `ComplianceDecision`
- `CircuitBreakerState`
- `Alert[]`

### `POST /v1/transfers/{requestId}/approve`
Operator approval for requests requiring manual review.

### `POST /v1/transfers/{requestId}/reject`
Operator rejection with reason.

### `GET /v1/wallets/{walletId}`
Return wallet profile and current compliance/risk posture.

### `GET /v1/alerts`
Filter alerts by severity, category, entity, and status.

### `GET /v1/cases/{caseId}`
Return investigation case details and linked evidence.

### `GET /v1/audit-logs`
Query append-only audit records by entity, actor, or correlation ID.

## Service-to-Service APIs

### Risk Engine

#### `POST /internal/risk/evaluate`
Request:
- `transferRequest`
- `sourceWallet`
- `destinationWallet`
- `oracleConsensus`

Response:
```json
{
  "decision": {
    "riskDecisionId": "rk_123",
    "requestId": "txr_123",
    "decision": "review",
    "aggregatedScore": 72.5,
    "maxSignalSeverity": "high",
    "recommendedAction": "step_up_review",
    "policyVersion": "risk-policy-v1",
    "reasons": ["velocity breach"],
    "signals": ["sig_1"],
    "createdAt": "2026-03-18T00:00:00Z"
  },
  "signals": []
}
```

### Oracle Service

#### `POST /internal/oracle/consensus`
Request:
- `assetSymbol`
- `chainId`
- `requestedAt`

Response:
- `OracleConsensusDecision`
- `OracleReading[]`

### Compliance Service

#### `POST /internal/compliance/screen`
Request:
- `transferRequest`
- `sourceWallet`
- `destinationWallet`
- `provenance`

Response:
- `ComplianceDecision`
- `SanctionsHit[]`

### Reconciliation Service

#### `POST /internal/reconciliation/check`
Request:
- `requestId`
- `transactionHash`
- `ledgerReference`

Response:
- `ReconciliationEvent`

### Event Watcher

#### `POST /internal/events/ingest`
Request:
- raw event payload
- source metadata

Response:
- normalized provenance reference

## Decision Semantics

### Risk decision values
- `approve`: proceed automatically.
- `review`: halt for operator review.
- `block`: reject and optionally freeze wallet/scope.

### Compliance decision values
- `approve`: policy checks pass.
- `review`: requires analyst review.
- `block`: sanctions or policy block.

### Oracle consensus values
- `accepted`: readings meet quorum and deviation policy.
- `stale`: data too old for transfer approval.
- `divergent`: spread across sources exceeds policy.
- `insufficient_sources`: not enough healthy sources.

### Circuit breaker states
- `closed`: normal operation.
- `open`: transfer execution blocked.
- `half_open`: limited recovery mode with increased scrutiny.

## Error Envelope

```json
{
  "error": {
    "code": "transfer_blocked",
    "message": "Transfer blocked by compliance decision.",
    "correlationId": "corr_123",
    "details": {
      "requestId": "txr_123",
      "complianceDecisionId": "cmp_123"
    }
  }
}
```

## Shared Model Mapping

The following shared models are canonical for request/response bodies and event payloads:

- `Wallet`
- `TokenTransferRequest`
- `RiskSignal`
- `OracleReading`
- `OracleConsensusDecision`
- `ProvenanceRecord`
- `ComplianceDecision`
- `SanctionsHit`
- `ReconciliationEvent`
- `CircuitBreakerState`
- `Alert`
- `InvestigationCase`

TypeScript definitions live in `packages/shared-types`, and Python equivalents live in `phase1_local` for service imports.
