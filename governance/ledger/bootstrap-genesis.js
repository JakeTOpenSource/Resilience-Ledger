#!/usr/bin/env node
'use strict';

// Historical, one-shot reproducer for the Work Packet 0.5 genesis events.
// It refuses changed seed records and refuses to overwrite an event file.

const fs = require('fs');
const path = require('path');
const L = require('./lib.js');

const expectedSeedHashes = {
  'governance/authority-map.json': 'cd97d374f3393fad12fb34c0a93b4fb1cf0d1c40d8dd9485e9e362aaed0d8012',
  'governance/artifact-register.json': 'a199024060b71dcf9e41757542687bd79bb02ff9c873f398d228326c15d3a0c0',
  'governance/deployment-receipts/2026-08-11-current-production.json': '950a9af5c154d92a40ab1a77e16147706310689c1fcbda1dff61ebb1931ef458',
  'governance/decision-log/0001-work-packet-0-authority-freeze.md': 'a0e17d3bb1a7b81fc21d44f98341dc7bf158862a8148363870f21b7120bb8e65',
  'governance/data-classification.md': '081b69945e462002e1a4e168c3ff326aee15fd1fc4d1c1e093a960606d93bf78'
};

function bytes(relative) {
  return fs.readFileSync(path.join(L.repoRoot, relative));
}

function record(relative) {
  return JSON.parse(bytes(relative).toString('utf8'));
}

for (const [relative, expected] of Object.entries(expectedSeedHashes)) {
  const actual = L.sha256Bytes(bytes(relative));
  if (actual !== expected) throw new Error(`${relative}: seed digest changed; refuse to rewrite genesis`);
}

function evidence(refId, kind, sha256, sourceLocator) {
  return { ref_id: refId, kind, classification: 'PUBLIC', sha256, source_locator: sourceLocator };
}

function seal(event) {
  event.payload_hash = L.hashValue(event.payload);
  event.event_hash = L.eventHash(event);
  return event;
}

function base(fields) {
  return {
    schema_version: '1.0.0',
    event_id: fields.event_id,
    stream_id: fields.stream_id,
    sequence: 1,
    event_type: fields.event_type,
    occurred_at: fields.occurred_at,
    recorded_at: fields.recorded_at,
    actor: fields.actor,
    classification: 'PUBLIC',
    consequence_class: fields.consequence_class,
    parents: fields.parents,
    prev_event_hash: '',
    payload_hash: '',
    event_hash: '',
    read_set: fields.read_set,
    write_set: fields.write_set,
    precondition_refs: fields.precondition_refs,
    evidence_refs: fields.evidence_refs,
    authority_ref: fields.authority_ref,
    idempotency_key: fields.idempotency_key,
    decision: fields.decision,
    status_axes: fields.status_axes,
    effect: { kind: 'NONE', target: null, reversible: true, recovery_ref: null },
    supersedes: [],
    correction_of: [],
    payload: fields.payload
  };
}

const authorityId = 'evt_governance_wp0_authority_freeze_0001';
const events = [
  {
    file: 'events/governance/000001-wp0-authority-freeze.json',
    event: base({
      event_id: authorityId,
      stream_id: 'governance',
      event_type: 'governance.authority_freeze_recorded',
      occurred_at: '2026-08-11T16:51:15Z',
      recorded_at: '2026-08-11T16:51:15Z',
      actor: {
        id: 'github:JakeTOpenSource',
        role: 'repository_owner',
        auth_basis: 'Authenticated owner direction recorded in Decision 0001; cryptographic signature not present.'
      },
      consequence_class: 'C2',
      parents: [],
      read_set: [
        'governance/decision-log/0001-work-packet-0-authority-freeze.md',
        'governance/data-classification.md',
        'governance/authority-map.json'
      ],
      write_set: ['governance/authority-map.json'],
      precondition_refs: ['owner-direction:proceed-work-packet-0'],
      evidence_refs: [
        evidence('decision-0001', 'decision_record', expectedSeedHashes['governance/decision-log/0001-work-packet-0-authority-freeze.md'], 'governance/decision-log/0001-work-packet-0-authority-freeze.md'),
        evidence('data-classification-wp0', 'policy_record', expectedSeedHashes['governance/data-classification.md'], 'governance/data-classification.md'),
        evidence('authority-map-pre-ledger-snapshot', 'pre_ledger_snapshot', expectedSeedHashes['governance/authority-map.json'], 'governance/authority-map.json')
      ],
      authority_ref: 'governance/decision-log/0001-work-packet-0-authority-freeze.md',
      idempotency_key: 'wp0.5:governance:genesis:authority-freeze',
      decision: 'ACCEPT_WITH_LIMITS',
      status_axes: {
        evidence: 'VERIFIED', authority: 'UNVERIFIED', preparation: 'PASS', execution: 'PASS',
        observation: 'OBSERVED', acceptance: 'ACCEPT_WITH_LIMITS', outcome: 'UNKNOWN'
      },
      payload: {
        projection: { path: 'governance/authority-map.json', record: record('governance/authority-map.json') },
        limits: [
          'Owner direction is recorded but is not cryptographically signed.',
          'This event records the freeze; it does not publish, deploy, delete, or grant production authority.'
        ]
      }
    })
  },
  {
    file: 'events/research/000001-wp0-artifact-search.json',
    event: base({
      event_id: 'evt_research_wp0_artifact_register_0001',
      stream_id: 'research',
      event_type: 'research.artifact_search_recorded',
      occurred_at: '2026-08-11T16:51:15Z',
      recorded_at: '2026-08-11T16:51:15Z',
      actor: {
        id: 'adapter:codex',
        role: 'agent_observer',
        auth_basis: 'Repository owner directed the bounded Work Packet 0 audit and recording pass.'
      },
      consequence_class: 'C1',
      parents: [authorityId],
      read_set: ['owner-supplied public research artifacts', 'bounded local search scope'],
      write_set: ['governance/artifact-register.json'],
      precondition_refs: ['governance-authority-freeze'],
      evidence_refs: [
        evidence('artifact-register-pre-ledger-snapshot', 'pre_ledger_snapshot', expectedSeedHashes['governance/artifact-register.json'], 'governance/artifact-register.json')
      ],
      authority_ref: 'evt_governance_wp0_authority_freeze_0001',
      idempotency_key: 'wp0.5:research:genesis:artifact-search',
      decision: 'DEFER',
      status_axes: {
        evidence: 'VERIFIED', authority: 'UNVERIFIED', preparation: 'PASS', execution: 'PASS',
        observation: 'OBSERVED', acceptance: 'DEFER', outcome: 'UNKNOWN'
      },
      payload: {
        projection: { path: 'governance/artifact-register.json', record: record('governance/artifact-register.json') },
        negative_space: {
          inspected: ['owner Downloads tree', '2026-08-09 research workspace'],
          files_hashed: 452,
          read_errors: 0,
          not_inspected: ['unavailable devices', 'unconnected accounts', 'unprovided remote storage'],
          claim_ceiling: 'No exact match was found inside the bounded inspected scope; global absence is not claimed.'
        }
      }
    })
  },
  {
    file: 'events/deployment/000001-wp0-production-observation.json',
    event: base({
      event_id: 'evt_deployment_wp0_production_observation_0001',
      stream_id: 'deployment',
      event_type: 'deployment.production_observed',
      occurred_at: '2026-08-11T16:51:15Z',
      recorded_at: '2026-08-11T16:51:15Z',
      actor: {
        id: 'adapter:codex',
        role: 'agent_observer',
        auth_basis: 'Repository owner directed a read-only comparison of public source and observed production.'
      },
      consequence_class: 'C1',
      parents: [authorityId],
      read_set: ['public repository deployable paths', 'public Cloudflare Pages deployment'],
      write_set: ['governance/deployment-receipts/2026-08-11-current-production.json'],
      precondition_refs: ['read-only-production-audit'],
      evidence_refs: [
        evidence('production-receipt-pre-ledger-snapshot', 'pre_ledger_snapshot', expectedSeedHashes['governance/deployment-receipts/2026-08-11-current-production.json'], 'governance/deployment-receipts/2026-08-11-current-production.json')
      ],
      authority_ref: 'evt_governance_wp0_authority_freeze_0001',
      idempotency_key: 'wp0.5:deployment:genesis:production-observation',
      decision: 'DEFER',
      status_axes: {
        evidence: 'VERIFIED', authority: 'UNVERIFIED', preparation: 'UNKNOWN', execution: 'PASS',
        observation: 'FAIL', acceptance: 'DEFER', outcome: 'UNKNOWN'
      },
      payload: {
        projection: {
          path: 'governance/deployment-receipts/2026-08-11-current-production.json',
          record: record('governance/deployment-receipts/2026-08-11-current-production.json')
        },
        claim_ceiling: 'Provider success and HTTP reachability do not establish source identity, semantic equivalence, acceptance, or outcome.'
      }
    })
  },
  {
    file: 'events/feedback/000001-public-researcher-comment.json',
    event: base({
      event_id: 'evt_feedback_public_researcher_comment_0001',
      stream_id: 'feedback',
      event_type: 'feedback.external_comment_observed',
      occurred_at: null,
      recorded_at: '2026-08-11T17:18:41Z',
      actor: {
        id: 'adapter:codex',
        role: 'agent_observer',
        auth_basis: 'Repository owner supplied a screenshot and directed that the public feedback be taken into account.'
      },
      consequence_class: 'C0',
      parents: [authorityId],
      read_set: ['owner-supplied screenshot of a public professional-network comment'],
      write_set: ['governance/external-feedback.json'],
      precondition_refs: ['public-comment-visible-in-owner-supplied-capture'],
      evidence_refs: [
        evidence('public-linkedin-comment-2026-08', 'public_source_locator', null, 'https://www.linkedin.com/feed/update/urn:li:activity:7492563640110227456/')
      ],
      authority_ref: 'evt_governance_wp0_authority_freeze_0001',
      idempotency_key: 'wp0.5:feedback:genesis:public-researcher-comment',
      decision: 'OBSERVE',
      status_axes: {
        evidence: 'VERIFIED', authority: 'UNVERIFIED', preparation: 'NOT_APPLICABLE', execution: 'NOT_APPLICABLE',
        observation: 'OBSERVED', acceptance: 'NOT_APPLICABLE', outcome: 'UNKNOWN'
      },
      payload: {
        projection: {
          path: 'governance/external-feedback.json',
          record: {
            schema_version: '0.1.0',
            register_id: 'delta-atlas-external-feedback-2026-08-11',
            recorded_at: '2026-08-11T17:18:41Z',
            observations: [
              {
                feedback_id: 'public-researcher-comment-0001',
                classification: 'PUBLIC',
                source_type: 'public_professional_network_comment',
                source_locator: 'https://www.linkedin.com/feed/update/urn:li:activity:7492563640110227456/',
                source_time: null,
                source_time_precision: 'The supplied capture displayed a relative age of one day; an exact timestamp was not established.',
                public_attribution: {
                  display_name: 'Nicolai Hyllested',
                  displayed_scope: 'AI Security; measuring LLM behavior, drift, and manipulation'
                },
                verbatim_feedback: 'Very cool piece of work :)',
                interpretation: 'Positive qualitative feedback from a researcher working in an adjacent field.',
                independent_validation: 'NOT_OBSERVED',
                methodological_review: 'NOT_OBSERVED',
                endorsement: 'NOT_OBSERVED',
                limits: [
                  'A positive comment is not evidence that the protocol was independently reproduced or validated.',
                  'The supplied screenshot, local path, account chrome, and analytics were deliberately excluded from the public ledger.'
                ]
              }
            ]
          }
        },
        claim_ceiling: 'This event establishes that public positive feedback was observed; it does not establish independent validation, endorsement, or representative user sentiment.'
      }
    })
  }
];

for (const item of events) {
  const target = path.join(L.ledgerRoot, item.file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, L.pretty(seal(item.event)), { encoding: 'utf8', flag: 'wx' });
  console.log(`created ${path.relative(L.repoRoot, target).split(path.sep).join('/')}`);
}
