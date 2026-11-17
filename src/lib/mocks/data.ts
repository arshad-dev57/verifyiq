import type {
  Assessment,
  Session,
  SessionAnalysis,
  TelemetryEvent,
  CodeSnapshot,
  MLModel,
  MLJob,
  VerifiableCredential,
  AuditLog,
  SystemSettings,
  User,
  AssistantSource,
} from '../../types';

const now = Date.now();
const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();

export const mockUsers: User[] = [
  {
    id: 'usr-candidate-01',
    email: 'candidate@demo.com',
    role: 'candidate',
    pseudonym_id: 'CND-7F2A',
    consent_status: true,
    created_at: iso(-30 * 86400000),
  },
  {
    id: 'usr-instructor-01',
    email: 'instructor@demo.com',
    role: 'instructor',
    pseudonym_id: 'INS-A1B2',
    consent_status: true,
    created_at: iso(-60 * 86400000),
  },
  {
    id: 'usr-admin-01',
    email: 'admin@demo.com',
    role: 'admin',
    pseudonym_id: 'ADM-0001',
    consent_status: true,
    created_at: iso(-90 * 86400000),
  },
];

export const mockTasks = [
  {
    id: 'tsk-py-reverse',
    assessment_id: 'asm-py-101',
    title: 'Reverse a String',
    statement:
      'Write a function `reverse_string(s: str) -> str` that returns the reverse of the input string without using built-in reverse helpers.',
    language: 'python' as const,
    starter_code: 'def reverse_string(s: str) -> str:\n    # TODO: implement\n    pass\n',
    test_config: {
      test_cases: [
        {
          id: 'tc-1',
          input: '"hello"',
          expected_output: 'olleh',
          is_hidden: false,
          explanation: 'Basic reverse',
        },
        {
          id: 'tc-2',
          input: '""',
          expected_output: '',
          is_hidden: false,
        },
        {
          id: 'tc-3',
          input: '"VerifyIQ"',
          expected_output: 'QIyfireV',
          is_hidden: true,
        },
      ],
      timeout_ms: 3000,
      memory_limit_mb: 128,
    },
    points: 100,
  },
  {
    id: 'tsk-py-two-sum',
    assessment_id: 'asm-py-102',
    title: 'Two Sum',
    statement:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to target.',
    language: 'python' as const,
    starter_code: 'def two_sum(nums, target):\n    # TODO: implement\n    pass\n',
    test_config: {
      test_cases: [
        {
          id: 'tc-1',
          input: '[2,7,11,15], 9',
          expected_output: '[0, 1]',
          is_hidden: false,
        },
        {
          id: 'tc-2',
          input: '[3,2,4], 6',
          expected_output: '[1, 2]',
          is_hidden: true,
        },
      ],
      timeout_ms: 3000,
      memory_limit_mb: 128,
    },
    points: 100,
  },
];

export let mockAssessments: Assessment[] = [
  {
    id: 'asm-py-101',
    title: 'Python Fundamentals',
    description: 'Core Python coding tasks covering strings, loops, and basic algorithms.',
    duration_minutes: 45,
    difficulty: 'easy',
    randomize_variants: false,
    status: 'published',
    created_by: 'usr-instructor-01',
    created_at: iso(-20 * 86400000),
    tasks_count: 1,
    tasks: [mockTasks[0]],
  },
  {
    id: 'asm-py-102',
    title: 'Algorithmic Thinking',
    description: 'Intermediate problems focused on arrays and hash maps.',
    duration_minutes: 60,
    difficulty: 'medium',
    randomize_variants: true,
    status: 'published',
    created_by: 'usr-instructor-01',
    created_at: iso(-14 * 86400000),
    tasks_count: 1,
    tasks: [mockTasks[1]],
  },
  {
    id: 'asm-py-draft',
    title: 'Draft: Recursion Lab',
    description: 'Unpublished draft for recursion practice.',
    duration_minutes: 50,
    difficulty: 'hard',
    randomize_variants: false,
    status: 'draft',
    created_by: 'usr-instructor-01',
    created_at: iso(-2 * 86400000),
    tasks_count: 0,
    tasks: [],
  },
];

export let mockSessions: Session[] = [
  {
    id: 'ses-001',
    user_id: 'usr-candidate-01',
    assessment_id: 'asm-py-101',
    assessment_title: 'Python Fundamentals',
    candidate_name: 'Alex Candidate',
    candidate_email: 'candidate@demo.com',
    pseudonym_id: 'CND-7F2A',
    task_id: 'tsk-py-reverse',
    status: 'reviewed',
    condition: 'normal',
    split: 'train',
    consent_at: iso(-5 * 86400000),
    start_time: iso(-5 * 86400000),
    end_time: iso(-5 * 86400000 + 35 * 60000),
    duration_minutes: 45,
    score: 92,
    tests_passed: 3,
    tests_total: 3,
    final_code:
      'def reverse_string(s: str) -> str:\n    result = ""\n    for ch in s:\n        result = ch + result\n    return result\n',
    anomaly_score: 18,
    category: 'normal',
    review_decision: 'cleared',
    review_notes: 'Typing patterns consistent with human coding.',
    reviewed_at: iso(-4 * 86400000),
    reviewed_by: 'usr-instructor-01',
    credential_eligible: true,
  },
  {
    id: 'ses-002',
    user_id: 'usr-candidate-01',
    assessment_id: 'asm-py-102',
    assessment_title: 'Algorithmic Thinking',
    candidate_name: 'Alex Candidate',
    candidate_email: 'candidate@demo.com',
    pseudonym_id: 'CND-7F2A',
    task_id: 'tsk-py-two-sum',
    status: 'scored',
    condition: 'controlled_ai',
    split: 'val',
    consent_at: iso(-2 * 86400000),
    start_time: iso(-2 * 86400000),
    end_time: iso(-2 * 86400000 + 40 * 60000),
    duration_minutes: 60,
    score: 78,
    tests_passed: 1,
    tests_total: 2,
    final_code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n',
    anomaly_score: 62,
    category: 'review_recommended',
    credential_eligible: false,
  },
  {
    id: 'ses-003',
    user_id: 'usr-cnd-other',
    assessment_id: 'asm-py-101',
    assessment_title: 'Python Fundamentals',
    candidate_name: 'Jordan Lee',
    candidate_email: 'jordan@demo.com',
    pseudonym_id: 'CND-9X1B',
    task_id: 'tsk-py-reverse',
    status: 'scored',
    condition: 'unlabeled',
    split: 'test',
    consent_at: iso(-1 * 86400000),
    start_time: iso(-1 * 86400000),
    end_time: iso(-1 * 86400000 + 20 * 60000),
    duration_minutes: 45,
    score: 55,
    tests_passed: 1,
    tests_total: 3,
    final_code: 'def reverse_string(s: str) -> str:\n    return s[::-1]\n',
    anomaly_score: 84,
    category: 'high_anomaly_signal',
    credential_eligible: false,
  },
];

export const mockAnalysisBySession: Record<string, SessionAnalysis> = {
  'ses-001': {
    session_id: 'ses-001',
    anomaly_score: 18,
    category: 'normal',
    model_used: 'xgboost',
    model_version: '1.2.0',
    threshold_version: 'th-v3',
    threshold_review: 45,
    threshold_high: 75,
    top_features: [
      {
        feature_name: 'paste_ratio',
        contribution: -0.12,
        observed_value: 0.02,
        reference_min: 0,
        reference_max: 0.15,
        rank: 1,
        label: 'Paste ratio',
        deviation_type: 'normal',
      },
      {
        feature_name: 'typing_speed_mean',
        contribution: 0.08,
        observed_value: 4.2,
        reference_min: 2.5,
        reference_max: 6.0,
        rank: 2,
        unit: 'keys/s',
        label: 'Typing speed',
        deviation_type: 'normal',
      },
    ],
    triggered_rules: [],
    summary_text:
      'Behavioral telemetry aligns with typical human problem-solving. Low paste activity and steady keystroke timing support a normal classification.',
    features: {
      mean_inter_key_ms: 180,
      std_inter_key_ms: 45,
      typing_speed_mean: 4.2,
      typing_speed_cv: 0.22,
      burstiness: 0.3,
      backspace_ratio: 0.08,
      paste_count: 1,
      paste_ratio: 0.02,
      tab_switch_count: 2,
      tab_switch_rate: 0.04,
      focus_loss_seconds: 12,
      mouse_distance: 4200,
      click_rate: 0.3,
      idle_ratio: 0.15,
      edit_run_ratio: 0.4,
      time_to_first_run: 90,
      run_count: 4,
      failed_run_ratio: 0.25,
      revision_count: 6,
      total_duration: 2100,
    },
    reference_stats: {
      paste_ratio: { mean: 0.05, std: 0.04, min: 0, max: 0.2 },
      typing_speed_mean: { mean: 4.0, std: 0.8, min: 2.0, max: 7.0 },
    },
  },
  'ses-002': {
    session_id: 'ses-002',
    anomaly_score: 62,
    category: 'review_recommended',
    model_used: 'xgboost',
    model_version: '1.2.0',
    threshold_version: 'th-v3',
    threshold_review: 45,
    threshold_high: 75,
    top_features: [
      {
        feature_name: 'paste_ratio',
        contribution: 0.35,
        observed_value: 0.28,
        reference_min: 0,
        reference_max: 0.15,
        rank: 1,
        label: 'Paste ratio',
        deviation_type: 'elevated',
      },
      {
        feature_name: 'tab_switch_rate',
        contribution: 0.22,
        observed_value: 0.18,
        reference_min: 0,
        reference_max: 0.1,
        rank: 2,
        label: 'Tab switch rate',
        deviation_type: 'elevated',
      },
    ],
    triggered_rules: [
      {
        rule_id: 'rule-paste-burst',
        name: 'Elevated paste activity',
        description: 'Paste ratio exceeded the review threshold for this assessment cohort.',
        severity: 'medium',
        observed_metric: 'paste_ratio=0.28',
        threshold_condition: 'paste_ratio > 0.15',
      },
    ],
    summary_text:
      'Moderate behavioral variance detected. Elevated paste ratio and tab switching suggest possible external reference use. Manual review recommended.',
    features: {
      mean_inter_key_ms: 95,
      std_inter_key_ms: 80,
      typing_speed_mean: 6.1,
      typing_speed_cv: 0.45,
      burstiness: 0.7,
      backspace_ratio: 0.04,
      paste_count: 8,
      paste_ratio: 0.28,
      tab_switch_count: 14,
      tab_switch_rate: 0.18,
      focus_loss_seconds: 95,
      mouse_distance: 2100,
      click_rate: 0.2,
      idle_ratio: 0.08,
      edit_run_ratio: 0.2,
      time_to_first_run: 25,
      run_count: 2,
      failed_run_ratio: 0.5,
      revision_count: 3,
      total_duration: 2400,
    },
    reference_stats: {
      paste_ratio: { mean: 0.05, std: 0.04, min: 0, max: 0.2 },
      tab_switch_rate: { mean: 0.05, std: 0.03, min: 0, max: 0.12 },
    },
  },
  'ses-003': {
    session_id: 'ses-003',
    anomaly_score: 84,
    category: 'high_anomaly_signal',
    model_used: 'xgboost',
    model_version: '1.2.0',
    threshold_version: 'th-v3',
    threshold_review: 45,
    threshold_high: 75,
    top_features: [
      {
        feature_name: 'paste_ratio',
        contribution: 0.48,
        observed_value: 0.55,
        reference_min: 0,
        reference_max: 0.15,
        rank: 1,
        label: 'Paste ratio',
        deviation_type: 'elevated',
      },
      {
        feature_name: 'time_to_first_run',
        contribution: 0.3,
        observed_value: 8,
        reference_min: 40,
        reference_max: 180,
        rank: 2,
        unit: 's',
        label: 'Time to first run',
        deviation_type: 'suppressed',
      },
    ],
    triggered_rules: [
      {
        rule_id: 'rule-high-paste',
        name: 'High paste dominance',
        description: 'Majority of code appears via paste events.',
        severity: 'high',
        observed_metric: 'paste_ratio=0.55',
        threshold_condition: 'paste_ratio > 0.4',
      },
    ],
    summary_text:
      'Strong anomaly signal. Rapid first run combined with heavy paste activity is inconsistent with gradual human editing. Escalate for follow-up.',
    features: {
      mean_inter_key_ms: 40,
      std_inter_key_ms: 120,
      typing_speed_mean: 8.5,
      typing_speed_cv: 0.7,
      burstiness: 0.9,
      backspace_ratio: 0.01,
      paste_count: 12,
      paste_ratio: 0.55,
      tab_switch_count: 22,
      tab_switch_rate: 0.35,
      focus_loss_seconds: 180,
      mouse_distance: 900,
      click_rate: 0.1,
      idle_ratio: 0.05,
      edit_run_ratio: 0.1,
      time_to_first_run: 8,
      run_count: 1,
      failed_run_ratio: 0,
      revision_count: 1,
      total_duration: 1200,
    },
    reference_stats: {
      paste_ratio: { mean: 0.05, std: 0.04, min: 0, max: 0.2 },
      time_to_first_run: { mean: 90, std: 40, min: 20, max: 300 },
    },
  },
};

export const mockEventsBySession: Record<string, TelemetryEvent[]> = {
  'ses-001': [
    { session_id: 'ses-001', event_type: 'key_interval', ts_ms: 1000, seq: 1, metadata: { inter_key_ms: 160, key_class: 'char' } },
    { session_id: 'ses-001', event_type: 'paste', ts_ms: 5000, seq: 2, metadata: { paste_length: 12 } },
    { session_id: 'ses-001', event_type: 'run_test', ts_ms: 90000, seq: 3, metadata: { test_run_index: 1, test_passed: false } },
    { session_id: 'ses-001', event_type: 'run_test', ts_ms: 150000, seq: 4, metadata: { test_run_index: 2, test_passed: true } },
    { session_id: 'ses-001', event_type: 'submit_attempt', ts_ms: 2100000, seq: 5, metadata: {} },
  ],
  'ses-002': [
    { session_id: 'ses-002', event_type: 'paste', ts_ms: 2000, seq: 1, metadata: { paste_length: 180 } },
    { session_id: 'ses-002', event_type: 'visibility_change', ts_ms: 8000, seq: 2, metadata: { reason: 'hidden' } },
    { session_id: 'ses-002', event_type: 'run_test', ts_ms: 25000, seq: 3, metadata: { test_run_index: 1, test_passed: true } },
  ],
  'ses-003': [
    { session_id: 'ses-003', event_type: 'paste', ts_ms: 1500, seq: 1, metadata: { paste_length: 320 } },
    { session_id: 'ses-003', event_type: 'run_test', ts_ms: 8000, seq: 2, metadata: { test_run_index: 1, test_passed: true } },
    { session_id: 'ses-003', event_type: 'submit_attempt', ts_ms: 1200000, seq: 3, metadata: {} },
  ],
};

export const mockCodeHistoryBySession: Record<string, CodeSnapshot[]> = {
  'ses-001': [
    {
      id: 'snap-001-1',
      session_id: 'ses-001',
      ts_ms: 10000,
      seq: 1,
      code: 'def reverse_string(s: str) -> str:\n    pass\n',
      action_label: 'starter',
    },
    {
      id: 'snap-001-2',
      session_id: 'ses-001',
      ts_ms: 120000,
      seq: 2,
      code: 'def reverse_string(s: str) -> str:\n    result = ""\n    for ch in s:\n        result = ch + result\n    return result\n',
      action_label: 'edit',
    },
  ],
  'ses-002': [
    {
      id: 'snap-002-1',
      session_id: 'ses-002',
      ts_ms: 5000,
      seq: 1,
      code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n',
      action_label: 'paste',
    },
  ],
  'ses-003': [
    {
      id: 'snap-003-1',
      session_id: 'ses-003',
      ts_ms: 3000,
      seq: 1,
      code: 'def reverse_string(s: str) -> str:\n    return s[::-1]\n',
      action_label: 'paste',
    },
  ],
};

export let mockModels: MLModel[] = [
  {
    id: 'mdl-xgb-01',
    name: 'xgboost',
    displayName: 'XGBoost Anomaly Classifier',
    version: '1.2.0',
    file_path: '/models/xgb_v1_2.pkl',
    params: { max_depth: 6, learning_rate: 0.1, n_estimators: 200 },
    trained_on: {
      train_count: 420,
      val_count: 80,
      features_count: 20,
      dataset_version: 'ds-2024-10',
    },
    threshold_review: 45,
    threshold_high: 75,
    threshold_version: 'th-v3',
    is_active: true,
    created_at: iso(-10 * 86400000),
    metrics: {
      val: {
        accuracy: 0.92,
        precision: 0.88,
        recall: 0.85,
        f1: 0.86,
        fpr: 0.04,
        confusion_matrix: { tp: 28, fp: 2, tn: 32, fn: 4 },
        roc: [
          { fpr: 0, tpr: 0, threshold: 1.0 },
          { fpr: 0.04, tpr: 0.85, threshold: 0.5 },
          { fpr: 1, tpr: 1, threshold: 0.0 },
        ],
        feature_importance: [
          { feature: 'paste_ratio', importance: 0.32, rank: 1 },
          { feature: 'std_inter_key_ms', importance: 0.24, rank: 2 },
          { feature: 'tab_switch_rate', importance: 0.2, rank: 3 },
          { feature: 'edit_run_ratio', importance: 0.14, rank: 4 },
        ],
      },
      test: {
        accuracy: 0.9,
        precision: 0.86,
        recall: 0.83,
        f1: 0.84,
        fpr: 0.05,
        confusion_matrix: { tp: 25, fp: 3, tn: 30, fn: 5 },
        roc: [
          { fpr: 0, tpr: 0, threshold: 1.0 },
          { fpr: 0.05, tpr: 0.83, threshold: 0.5 },
          { fpr: 1, tpr: 1, threshold: 0.0 },
        ],
        feature_importance: [
          { feature: 'paste_ratio', importance: 0.3, rank: 1 },
          { feature: 'tab_switch_rate', importance: 0.22, rank: 2 },
          { feature: 'std_inter_key_ms', importance: 0.2, rank: 3 },
        ],
      },
    },
  },
  {
    id: 'mdl-rf-01',
    name: 'random_forest',
    displayName: 'Random Forest Baseline',
    version: '1.0.1',
    file_path: '/models/rf_v1.pkl',
    params: { n_estimators: 100, max_depth: 8 },
    trained_on: {
      train_count: 420,
      val_count: 80,
      features_count: 20,
      dataset_version: 'ds-2024-10',
    },
    threshold_review: 50,
    threshold_high: 80,
    threshold_version: 'th-v2',
    is_active: false,
    created_at: iso(-25 * 86400000),
    metrics: {
      val: {
        accuracy: 0.87,
        precision: 0.82,
        recall: 0.8,
        f1: 0.81,
        fpr: 0.07,
      },
    },
  },
];

export let mockJobs: MLJob[] = [];

export let mockCredentials: VerifiableCredential[] = [
  {
    id: 'cred-001',
    session_id: 'ses-001',
    candidate_name: 'Alex Candidate',
    pseudonym_id: 'CND-7F2A',
    assessment_title: 'Python Fundamentals',
    skill: 'Python Programming',
    score: 92,
    tests_passed: 3,
    tests_total: 3,
    status: 'valid',
    issued_at: iso(-4 * 86400000),
    issuer: {
      id: 'did:verifyiq:issuer',
      name: 'VerifyIQ',
      publicKey: 'ed25519:MOCK_PUBLIC_KEY_ABC123',
    },
    credential_json: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'cred-001',
      type: ['VerifiableCredential', 'SkillCredential'],
      issuer: 'did:verifyiq:issuer',
      issuanceDate: iso(-4 * 86400000),
      credentialSubject: {
        id: 'did:verifyiq:CND-7F2A',
        pseudonymId: 'CND-7F2A',
        skillAssessment: 'Python Fundamentals',
        score: 92,
        verificationLevel: 'behavioral',
      },
    },
    signature: {
      type: 'Ed25519Signature2020',
      created: iso(-4 * 86400000),
      verificationMethod: 'did:verifyiq:issuer#key-1',
      proofValue: 'zMockProofValue1234567890',
    },
    qr_url: '/verify/cred-001',
  },
];

export let mockSettings: SystemSettings = {
  raw_events_retention_days: 90,
  default_threshold_review: 45,
  default_threshold_high: 75,
  consent_version: 'v1.2',
  consent_text:
    'I consent to behavioral telemetry collection during this assessment for integrity analysis. Raw keystroke content is not stored.',
  allow_candidate_retry: false,
  enable_ed25519_credentials: true,
  llm_evidence_model: 'gpt-4o-mini',
};

export let mockAuditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    actor_id: 'usr-instructor-01',
    actor_email: 'instructor@demo.com',
    action: 'session.review',
    resource_type: 'session',
    resource_id: 'ses-001',
    ip: '127.0.0.1',
    ts: iso(-4 * 86400000),
    details: { decision: 'cleared' },
  },
  {
    id: 'aud-002',
    actor_id: 'usr-instructor-01',
    actor_email: 'instructor@demo.com',
    action: 'credential.issue',
    resource_type: 'credential',
    resource_id: 'cred-001',
    ip: '127.0.0.1',
    ts: iso(-4 * 86400000 + 60000),
  },
  {
    id: 'aud-003',
    actor_id: 'usr-admin-01',
    actor_email: 'admin@demo.com',
    action: 'settings.update',
    resource_type: 'settings',
    resource_id: 'system',
    ip: '127.0.0.1',
    ts: iso(-3 * 86400000),
    details: { field: 'default_threshold_review' },
  },
];

export const mockAssistantSources: AssistantSource[] = [
  {
    type: 'session',
    id: 'ses-002',
    label: 'Session ses-002 — Algorithmic Thinking',
    snippet: 'Anomaly score 62, review recommended due to elevated paste ratio.',
    anomaly_score: 62,
    category: 'review_recommended',
  },
  {
    type: 'feature',
    id: 'paste_ratio',
    label: 'Feature: paste_ratio',
    snippet: 'Observed 0.28 vs cohort mean 0.05.',
  },
  {
    type: 'model',
    id: 'mdl-xgb-01',
    label: 'Active model: XGBoost 1.2.0',
    snippet: 'Thresholds review=45, high=75.',
  },
];

export const mockAssistantAnswer =
  'Based on the available session evidence, the elevated paste ratio and tab-switch rate on ses-002 are the primary drivers of the review_recommended classification. ' +
  'Compared with the active XGBoost model thresholds (review 45 / high 75), an anomaly score of 62 sits in the manual-review band. ' +
  'I recommend inspecting the code timeline and paste events before issuing a credential.';

export function getCandidateDashboardPayload() {
  const candidateSessions = mockSessions.filter((s) => s.user_id === 'usr-candidate-01');
  const published = mockAssessments.filter((a) => a.status === 'published');
  return {
    user: {
      name: 'Alex Candidate',
      email: 'candidate@demo.com',
      pseudonym_id: 'CND-7F2A',
    },
    available_assessments: published,
    active_assessment: published[0] || null,
    recent_sessions: candidateSessions,
    credentials: mockCredentials.filter((c) => c.pseudonym_id === 'CND-7F2A'),
  };
}

export function getAdminDashboardPayload() {
  const flagged = mockSessions.filter((s) => s.category && s.category !== 'normal');
  return {
    stats: {
      total_sessions: mockSessions.length,
      total_candidates: 2,
      total_assessments: mockAssessments.filter((a) => a.status === 'published').length,
      credentials_issued: mockCredentials.filter((c) => c.status === 'valid').length,
      review_recommended_count: mockSessions.filter((s) => s.category === 'review_recommended').length,
      high_anomaly_count: mockSessions.filter((s) => s.category === 'high_anomaly_signal').length,
      normal_percentage: Math.round(
        (mockSessions.filter((s) => s.category === 'normal').length / Math.max(mockSessions.length, 1)) * 100
      ),
      active_model: mockModels.find((m) => m.is_active)?.name ?? 'xgboost',
    },
    kpis: {
      total_sessions: mockSessions.length,
      total_candidates: 2,
      total_assessments: mockAssessments.filter((a) => a.status === 'published').length,
      total_credentials: mockCredentials.filter((c) => c.status === 'valid').length,
    },
    category_breakdown: {
      normal: mockSessions.filter((s) => s.category === 'normal').length,
      review_recommended: mockSessions.filter((s) => s.category === 'review_recommended').length,
      high_anomaly_signal: mockSessions.filter((s) => s.category === 'high_anomaly_signal').length,
    },
    active_model: mockModels.find((m) => m.is_active),
    distribution: [
      { bin: '0-20', count: 0 },
      { bin: '20-40', count: 0 },
      { bin: '40-60', count: 1 },
      { bin: '60-80', count: 1 },
      { bin: '80-100', count: 1 },
    ],
    recent_flagged: flagged,
  };
}

export function getDatasetPayload() {
  const labeled = mockSessions.map((s) => ({
    id: s.id,
    assessment_title: s.assessment_title,
    pseudonym_id: s.pseudonym_id,
    condition: s.condition || 'unlabeled',
    split: s.split || 'none',
    anomaly_score: s.anomaly_score,
    category: s.category,
    score: s.score,
  }));
  return {
    sessions: labeled,
    total: labeled.length,
    splits: {
      train: labeled.filter((s) => s.split === 'train').length,
      val: labeled.filter((s) => s.split === 'val').length,
      test: labeled.filter((s) => s.split === 'test').length,
    },
  };
}
