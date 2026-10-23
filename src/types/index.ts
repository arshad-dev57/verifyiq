// =========================================
// VerifyIQ Type Definitions
// =========================================

export type UserRole = 'candidate' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  email_hash?: string;
  role: UserRole;
  pseudonym_id: string;
  consent_status: boolean;
  created_at: string;
}

export type AssessmentStatus = 'draft' | 'published';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

export interface Task {
  id: string;
  assessment_id: string;
  title: string;
  statement: string;
  language: 'python' | 'javascript';
  starter_code: string;
  test_config: {
    test_cases: TestCase[];
    timeout_ms: number;
    memory_limit_mb: number;
  };
  points: number;
  variant_group?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: DifficultyLevel;
  randomize_variants: boolean;
  status: AssessmentStatus;
  created_by: string;
  created_at: string;
  tasks_count?: number;
  tasks?: Task[];
}

export type SessionStatus = 'in_progress' | 'submitted' | 'processing' | 'scored' | 'reviewed';
export type SessionCondition = 'normal' | 'controlled_ai' | 'repeat_mixed' | 'unlabeled';
export type DatasetSplit = 'train' | 'val' | 'test' | 'none';
export type AnomalyCategory = 'normal' | 'review_recommended' | 'high_anomaly_signal';
export type ReviewDecision = 'cleared' | 'needs_followup';

export interface Session {
  id: string;
  user_id: string;
  assessment_id: string;
  assessment_title?: string;
  candidate_name?: string;
  candidate_email?: string;
  pseudonym_id: string;
  task_id: string;
  status: SessionStatus;
  condition: SessionCondition;
  split: DatasetSplit;
  consent_at?: string;
  start_time: string;
  end_time?: string;
  score?: number;
  tests_passed?: number;
  tests_total?: number;
  final_code?: string;
  anomaly_score?: number; // 0-100
  category?: AnomalyCategory;
  review_decision?: ReviewDecision;
  review_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// 19 Behavioral Features
export interface BehavioralFeatures {
  mean_inter_key_ms: number;
  std_inter_key_ms: number;
  typing_speed_cv: number;
  burstiness: number;
  backspace_ratio: number;
  paste_count: number;
  paste_ratio: number;
  tab_switch_count: number;
  tab_switch_rate: number;
  focus_loss_seconds: number;
  mouse_distance: number;
  click_rate: number;
  idle_ratio: number;
  edit_run_ratio: number;
  time_to_first_run: number;
  run_count: number;
  failed_run_ratio: number;
  revision_count: number;
  total_duration: number;
}

export interface FeatureExplanation {
  feature_name: keyof BehavioralFeatures | string;
  contribution: number; // SHAP value or deviation weight
  observed_value: number;
  reference_min: number;
  reference_max: number;
  rank: number;
  unit?: string;
  label: string;
  deviation_type: 'normal' | 'elevated' | 'suppressed';
}

export interface TriggeredRule {
  rule_id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  observed_metric: string;
  threshold_condition: string;
}

export interface AISummary {
  id: string;
  prediction_id: string;
  summary_text: string;
  llm_model: string;
  prompt_version: string;
  created_at: string;
}

export interface SessionAnalysis {
  session_id: string;
  anomaly_score: number; // 0-100
  category: AnomalyCategory;
  model_used: string;
  model_version: string;
  threshold_version: string;
  threshold_review: number;
  threshold_high: number;
  top_features: FeatureExplanation[];
  triggered_rules: TriggeredRule[];
  summary_text: string;
  features: BehavioralFeatures;
  reference_stats: Record<string, { mean: number; std: number; min: number; max: number }>;
}

export type EventType =
  | 'key_interval'
  | 'paste'
  | 'cut'
  | 'focus'
  | 'blur'
  | 'visibility_change'
  | 'mouse_move_summary'
  | 'click'
  | 'scroll'
  | 'idle_start'
  | 'idle_end'
  | 'code_change'
  | 'run_test'
  | 'submit_attempt';

export interface TelemetryEvent {
  id?: number | string;
  session_id: string;
  event_type: EventType;
  ts_ms: number;
  metadata: {
    inter_key_ms?: number;
    paste_length?: number;
    cut_length?: number;
    duration_ms?: number;
    distance_px?: number;
    click_target?: string;
    chars_added?: number;
    chars_removed?: number;
    cursor_pos?: number;
    code_length?: number;
    test_run_index?: number;
    test_passed?: boolean;
    reason?: string;
  };
}

export interface CodeSnapshot {
  id: string;
  session_id: string;
  ts_ms: number;
  seq: number;
  code: string;
  code_diff?: string;
  action_label?: string;
}

export type ModelType = 'rule_based' | 'random_forest' | 'xgboost' | 'isolation_forest';

export interface MLModel {
  id: string;
  name: ModelType;
  displayName: string;
  version: string;
  file_path: string;
  params: Record<string, any>;
  trained_on: {
    train_count: number;
    val_count: number;
    features_count: number;
    dataset_version: string;
  };
  threshold_review: number;
  threshold_high: number;
  threshold_version: string;
  is_active: boolean;
  created_at: string;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    fpr: number;
  };
}

export interface MLMetrics {
  id: string;
  model_id: string;
  split: 'val' | 'test';
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  confusion_matrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  roc: Array<{ fpr: number; tpr: number; threshold: number }>;
  feature_importance: Array<{ feature: string; importance: number; rank: number }>;
}

export interface MLJob {
  id: string;
  type: 'train' | 'feature_extraction' | 'evaluate';
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  result?: any;
  created_at: string;
}

export interface VerifiableCredential {
  id: string;
  session_id: string;
  candidate_name: string;
  pseudonym_id: string;
  assessment_title: string;
  skill: string;
  score: number;
  tests_passed: number;
  tests_total: number;
  status: 'valid' | 'revoked';
  issued_at: string;
  revoked_at?: string;
  issuer: {
    id: string;
    name: string;
    publicKey: string;
  };
  credential_json: {
    '@context': string[];
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    credentialSubject: {
      id: string;
      pseudonymId: string;
      skillAssessment: string;
      score: number;
      verificationLevel: string;
    };
  };
  signature: {
    type: 'Ed25519Signature2020';
    created: string;
    verificationMethod: string;
    proofValue: string;
  };
  qr_url: string;
}

export interface AssistantSource {
  type: 'session' | 'feature' | 'event' | 'model' | 'rule';
  id: string;
  label: string;
  url?: string;
  snippet?: string;
  anomaly_score?: number;
  category?: AnomalyCategory;
}

export interface AssistantAnswer {
  id: string;
  query: string;
  answer_chunks: string;
  sources: AssistantSource[];
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip: string;
  ts: string;
  details?: Record<string, any>;
}

export interface SystemSettings {
  raw_events_retention_days: number;
  default_threshold_review: number;
  default_threshold_high: number;
  consent_version: string;
  consent_text: string;
  allow_candidate_retry: boolean;
  enable_ed25519_credentials: boolean;
  llm_evidence_model: string;
}
