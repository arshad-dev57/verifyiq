import type {
  Assessment,
  Session,
  TelemetryEvent,
  MLModel,
  MLMetrics,
  MLJob,
  VerifiableCredential,
  SystemSettings,
  User,
  AssistantSource,
  ReviewDecision,
  SessionAnalysis,
} from '../types';
import * as db from './mocks/data';

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

function persistAuth(user: User, access = 'mock-access-token', refresh = 'mock-refresh-token') {
  localStorage.setItem('verifyiq_access_token', access);
  localStorage.setItem('verifyiq_refresh_token', refresh);
  localStorage.setItem('verifyiq_current_user', JSON.stringify(user));
}

function roleFromEmail(email: string): User['role'] {
  const e = email.toLowerCase();
  if (e.includes('admin')) return 'admin';
  if (e.includes('instructor') || e.includes('teacher')) return 'instructor';
  return 'candidate';
}

function makeUser(email: string, role?: User['role']): User {
  const resolved = role || roleFromEmail(email);
  const existing = db.mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return { ...existing, role: resolved };

  const user: User = {
    id: `usr-mock-${Date.now()}`,
    email,
    role: resolved,
    pseudonym_id:
      resolved === 'admin'
        ? 'ADM-MOCK'
        : resolved === 'instructor'
          ? 'INS-MOCK'
          : `CND-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    consent_status: true,
    created_at: new Date().toISOString(),
  };
  db.mockUsers.push(user);
  return user;
}

function defaultAnalysis(sessionId: string): SessionAnalysis {
  return {
    session_id: sessionId,
    anomaly_score: 25,
    category: 'normal',
    model_used: 'xgboost',
    model_version: '1.2.0',
    threshold_version: 'th-v3',
    threshold_review: 45,
    threshold_high: 75,
    top_features: [],
    triggered_rules: [],
    summary_text:
      'Mock analysis: insufficient telemetry for a strong signal. Classified as normal by default.',
    features: {
      mean_inter_key_ms: 160,
      std_inter_key_ms: 40,
      typing_speed_mean: 4,
      typing_speed_cv: 0.2,
      burstiness: 0.3,
      backspace_ratio: 0.08,
      paste_count: 0,
      paste_ratio: 0,
      tab_switch_count: 0,
      tab_switch_rate: 0,
      focus_loss_seconds: 0,
      mouse_distance: 1000,
      click_rate: 0.2,
      idle_ratio: 0.1,
      edit_run_ratio: 0.3,
      time_to_first_run: 60,
      run_count: 1,
      failed_run_ratio: 0,
      revision_count: 2,
      total_duration: 600,
    },
    reference_stats: {},
  };
}

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  login: async (
    email: string,
    _password?: string
  ): Promise<{ access_token: string; refresh_token: string; user: User }> => {
    await delay();
    if (!email?.trim()) throw new Error('Email is required');
    const user = makeUser(email.trim());
    const access_token = 'mock-access-token';
    const refresh_token = 'mock-refresh-token';
    persistAuth(user, access_token, refresh_token);
    return { access_token, refresh_token, user };
  },

  register: async (data: {
    email: string;
    password: string;
    role?: User['role'];
  }): Promise<{ access_token: string; refresh_token: string; user: User }> => {
    await delay();
    if (!data.email?.trim()) throw new Error('Email is required');
    const user = makeUser(data.email.trim(), data.role || roleFromEmail(data.email));
    const access_token = 'mock-access-token';
    const refresh_token = 'mock-refresh-token';
    persistAuth(user, access_token, refresh_token);
    return { access_token, refresh_token, user };
  },

  getMe: async (): Promise<User> => {
    await delay(150);
    const raw = localStorage.getItem('verifyiq_current_user');
    if (!raw) throw new Error('Not authenticated');
    return JSON.parse(raw) as User;
  },
};

// ==========================================
// ASSESSMENTS API
// ==========================================
export const assessmentsApi = {
  getAssessments: async (): Promise<Assessment[]> => {
    await delay();
    return [...db.mockAssessments];
  },

  getAssessment: async (id: string): Promise<Assessment> => {
    await delay();
    const found = db.mockAssessments.find((a) => a.id === id);
    if (!found) throw new Error(`Assessment ${id} not found`);
    return { ...found };
  },

  createAssessment: async (data: Partial<Assessment>): Promise<Assessment> => {
    await delay();
    const created: Assessment = {
      id: `asm-${Date.now()}`,
      title: data.title || 'Untitled Assessment',
      description: data.description || '',
      duration_minutes: data.duration_minutes ?? 45,
      difficulty: data.difficulty || 'medium',
      randomize_variants: data.randomize_variants ?? false,
      status: data.status || 'draft',
      created_by: 'usr-instructor-01',
      created_at: new Date().toISOString(),
      tasks_count: data.tasks?.length ?? 0,
      tasks: data.tasks || [],
    };
    db.mockAssessments.unshift(created);
    return created;
  },

  updateAssessment: async (id: string, data: Partial<Assessment>): Promise<Assessment> => {
    await delay();
    const idx = db.mockAssessments.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error(`Assessment ${id} not found`);
    db.mockAssessments[idx] = { ...db.mockAssessments[idx], ...data, id };
    return { ...db.mockAssessments[idx] };
  },

  deleteAssessment: async (id: string): Promise<{ success: boolean }> => {
    await delay();
    const idx = db.mockAssessments.findIndex((a) => a.id === id);
    if (idx >= 0) db.mockAssessments.splice(idx, 1);
    return { success: true };
  },
};

// ==========================================
// SESSIONS API
// ==========================================
export const sessionsApi = {
  createSession: async (data: { assessment_id: string; consent: boolean }): Promise<Session> => {
    await delay();
    const assessment = db.mockAssessments.find((a) => a.id === data.assessment_id) || db.mockAssessments[0];
    const task = assessment?.tasks?.[0] || db.mockTasks[0];
    const raw = localStorage.getItem('verifyiq_current_user');
    const user = raw ? (JSON.parse(raw) as User) : db.mockUsers[0];
    const endsAt = new Date(Date.now() + (assessment?.duration_minutes || 45) * 60000).toISOString();

    const session: Session = {
      id: `ses-${Date.now()}`,
      user_id: user.id,
      assessment_id: assessment.id,
      assessment_title: assessment.title,
      candidate_name: user.email.split('@')[0],
      candidate_email: user.email,
      pseudonym_id: user.pseudonym_id,
      task_id: task.id,
      status: 'in_progress',
      condition: 'unlabeled',
      split: 'none',
      consent_at: new Date().toISOString(),
      start_time: new Date().toISOString(),
      ends_at: endsAt,
      remaining_seconds: (assessment?.duration_minutes || 45) * 60,
      duration_minutes: assessment?.duration_minutes || 45,
      final_code: task.starter_code,
    };
    db.mockSessions.unshift(session);
    return { ...session };
  },

  getSessions: async (params?: {
    status?: string;
    category?: string;
    condition?: string;
    assessment_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: Session[]; total: number; page: number; limit: number }> => {
    await delay();
    let list = [...db.mockSessions];
    if (params?.status && params.status !== 'all') {
      list = list.filter((s) => s.status === params.status);
    }
    if (params?.category && params.category !== 'all') {
      list = list.filter((s) => s.category === params.category);
    }
    if (params?.condition && params.condition !== 'all') {
      list = list.filter((s) => s.condition === params.condition);
    }
    if (params?.assessment_id) {
      list = list.filter((s) => s.assessment_id === params.assessment_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.pseudonym_id.toLowerCase().includes(q) ||
          (s.candidate_name || '').toLowerCase().includes(q) ||
          (s.assessment_title || '').toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return {
      sessions: list.slice(start, start + limit),
      total: list.length,
      page,
      limit,
    };
  },

  getSession: async (id: string): Promise<Session> => {
    await delay();
    const found = db.mockSessions.find((s) => s.id === id);
    if (!found) throw new Error(`Session ${id} not found`);
    return { ...found };
  },

  runCode: async (
    _sessionId: string,
    code: string,
    _taskId?: string
  ): Promise<{
    status: 'success' | 'error';
    output: string;
    tests_passed: number;
    tests_total: number;
    results: Array<{
      test_id: string;
      passed: boolean;
      stdout: string;
      duration_ms: number;
      expected?: string;
      actual?: string;
    }>;
  }> => {
    await delay(400);
    const looksComplete = code.includes('return') && !code.includes('pass\n') && !code.includes('TODO');
    const tests_total = 3;
    const tests_passed = looksComplete ? 3 : 1;
    return {
      status: looksComplete ? 'success' : 'error',
      output: looksComplete ? 'All visible tests passed (mock).' : 'Some tests failed (mock).',
      tests_passed,
      tests_total,
      results: [
        {
          test_id: 'tc-1',
          passed: true,
          stdout: 'ok',
          duration_ms: 12,
          expected: 'olleh',
          actual: 'olleh',
        },
        {
          test_id: 'tc-2',
          passed: looksComplete,
          stdout: looksComplete ? 'ok' : '',
          duration_ms: 8,
          expected: '',
          actual: looksComplete ? '' : 'None',
        },
        {
          test_id: 'tc-3',
          passed: looksComplete,
          stdout: looksComplete ? 'ok' : '',
          duration_ms: 10,
          expected: 'QIyfireV',
          actual: looksComplete ? 'QIyfireV' : 'None',
        },
      ],
    };
  },

  submitSession: async (sessionId: string, finalCode: string): Promise<Session> => {
    await delay(400);
    const idx = db.mockSessions.findIndex((s) => s.id === sessionId);
    if (idx < 0) throw new Error(`Session ${sessionId} not found`);
    const updated: Session = {
      ...db.mockSessions[idx],
      status: 'scored',
      end_time: new Date().toISOString(),
      final_code: finalCode,
      score: 85,
      tests_passed: 2,
      tests_total: 3,
      anomaly_score: 22,
      category: 'normal',
      credential_eligible: true,
    };
    db.mockSessions[idx] = updated;
    return { ...updated };
  },
};

// ==========================================
// TELEMETRY API
// ==========================================
export const telemetryApi = {
  sendBatch: async (_sessionId: string, events: TelemetryEvent[]): Promise<{ received: number }> => {
    await delay(80);
    return { received: events.length };
  },
};

// ==========================================
// ANALYSIS API
// ==========================================
export const analysisApi = {
  getSessionAnalysis: async (sessionId: string): Promise<SessionAnalysis> => {
    await delay();
    return { ...(db.mockAnalysisBySession[sessionId] || defaultAnalysis(sessionId)) };
  },

  getSessionEvents: async (sessionId: string): Promise<TelemetryEvent[]> => {
    await delay();
    return [...(db.mockEventsBySession[sessionId] || [])];
  },

  getSessionCodeHistory: async (sessionId: string) => {
    await delay();
    return [...(db.mockCodeHistoryBySession[sessionId] || [])];
  },

  submitReview: async (
    sessionId: string,
    data: { decision: ReviewDecision; notes?: string }
  ): Promise<{ status: string; decision: string; session_status: string }> => {
    await delay();
    const idx = db.mockSessions.findIndex((s) => s.id === sessionId);
    if (idx >= 0) {
      db.mockSessions[idx] = {
        ...db.mockSessions[idx],
        status: 'reviewed',
        review_decision: data.decision,
        review_notes: data.notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'usr-instructor-01',
      };
    }
    db.mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor_id: 'usr-instructor-01',
      actor_email: 'instructor@demo.com',
      action: 'session.review',
      resource_type: 'session',
      resource_id: sessionId,
      ip: '127.0.0.1',
      ts: new Date().toISOString(),
      details: { decision: data.decision },
    });
    return { status: 'ok', decision: data.decision, session_status: 'reviewed' };
  },
};

// ==========================================
// ASSISTANT API
// ==========================================
export const assistantApi = {
  ask: async (
    question: string,
    sessionId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<{ answer: string; sources: AssistantSource[] }> => {
    if (onChunk) {
      return new Promise((resolve, reject) => {
        let fullAnswer = '';
        assistantApi.askStream(
          question,
          sessionId,
          (chunk) => {
            fullAnswer += chunk;
            onChunk(chunk);
          },
          (sources) => resolve({ answer: fullAnswer, sources }),
          (err) => reject(err)
        );
      });
    }
    await delay(350);
    return { answer: db.mockAssistantAnswer, sources: db.mockAssistantSources };
  },

  askStream: async (
    _question: string,
    _sessionId: string | undefined,
    onChunk: (chunk: string) => void,
    onDone: (sources: AssistantSource[]) => void,
    onError: (err: unknown) => void
  ) => {
    try {
      const words = db.mockAssistantAnswer.split(' ');
      for (let i = 0; i < words.length; i++) {
        await delay(35);
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      }
      onDone(db.mockAssistantSources);
    } catch (err) {
      onError(err);
    }
  },
};

// ==========================================
// DASHBOARD API
// ==========================================
export const dashboardApi = {
  getCandidateDashboard: async (): Promise<ReturnType<typeof db.getCandidateDashboardPayload>> => {
    await delay();
    return db.getCandidateDashboardPayload();
  },

  getAdminDashboard: async (): Promise<ReturnType<typeof db.getAdminDashboardPayload>> => {
    await delay();
    return db.getAdminDashboardPayload();
  },
};

// ==========================================
// ML LAB API
// ==========================================
export const mlApi = {
  getMLModels: async (): Promise<MLModel[]> => {
    await delay();
    return [...db.mockModels];
  },

  getModelMetrics: async (modelId: string, split: 'val' | 'test' = 'val'): Promise<MLMetrics> => {
    await delay();
    const model = db.mockModels.find((m) => m.id === modelId) || db.mockModels[0];
    const splitMetric = model?.metrics?.[split];
    if (splitMetric) {
      return {
        id: `met-${modelId}-${split}`,
        model_id: modelId,
        split,
        accuracy: splitMetric.accuracy ?? 0.9,
        precision: splitMetric.precision ?? 0.88,
        recall: splitMetric.recall ?? 0.86,
        f1: splitMetric.f1 ?? 0.87,
        fpr: splitMetric.fpr ?? 0.05,
        confusion_matrix: (splitMetric.confusion_matrix as MLMetrics['confusion_matrix']) ?? {
          tp: 25,
          fp: 2,
          tn: 35,
          fn: 3,
        },
        roc: (splitMetric.roc || []).map((r, idx) => ({
          fpr: r.fpr ?? 0,
          tpr: r.tpr ?? 0,
          threshold: r.threshold ?? 1.0 - idx * 0.1,
        })),
        feature_importance: (splitMetric.feature_importance || []).map((f, idx) => ({
          feature: f.feature,
          importance: f.importance,
          rank: f.rank ?? idx + 1,
        })),
      };
    }
    return {
      id: `met-${modelId}-${split}`,
      model_id: modelId,
      split,
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
    };
  },

  trainModel: async (modelType: string, hyperparameters?: Record<string, unknown>): Promise<MLJob> => {
    await delay(400);
    const job: MLJob = {
      id: `job-${Date.now()}`,
      type: 'train',
      status: 'done',
      progress: 100,
      result: { model_type: modelType, hyperparameters },
      created_at: new Date().toISOString(),
    };
    db.mockJobs.unshift(job);
    const newModel: MLModel = {
      id: `mdl-${Date.now()}`,
      name: (modelType as MLModel['name']) || 'xgboost',
      displayName: `Trained ${modelType}`,
      version: '0.1.0-mock',
      file_path: `/models/mock_${Date.now()}.pkl`,
      params: hyperparameters || {},
      trained_on: {
        train_count: 420,
        val_count: 80,
        features_count: 20,
        dataset_version: 'ds-mock',
      },
      threshold_review: 45,
      threshold_high: 75,
      threshold_version: 'th-mock',
      is_active: false,
      created_at: new Date().toISOString(),
    };
    db.mockModels.unshift(newModel);
    return job;
  },

  getJobStatus: async (jobId: string): Promise<MLJob> => {
    await delay(120);
    const job = db.mockJobs.find((j) => j.id === jobId);
    if (!job) {
      return {
        id: jobId,
        type: 'train',
        status: 'done',
        progress: 100,
        created_at: new Date().toISOString(),
      };
    }
    return { ...job };
  },

  activateModel: async (modelId: string): Promise<MLModel> => {
    await delay();
    db.mockModels.forEach((m) => {
      m.is_active = m.id === modelId;
    });
    const model = db.mockModels.find((m) => m.id === modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);
    return { ...model };
  },

  updateThreshold: async (data: {
    model_id: string;
    threshold_review: number;
    threshold_high: number;
  }): Promise<MLModel> => {
    await delay();
    const idx = db.mockModels.findIndex((m) => m.id === data.model_id);
    if (idx < 0) throw new Error(`Model ${data.model_id} not found`);
    db.mockModels[idx] = {
      ...db.mockModels[idx],
      threshold_review: data.threshold_review,
      threshold_high: data.threshold_high,
    };
    return { ...db.mockModels[idx] };
  },

  getDataset: async () => {
    await delay();
    return db.getDatasetPayload();
  },

  splitDataset: async (data: { train: number; val: number; test: number }) => {
    await delay();
    return { success: true, ...data, ...db.getDatasetPayload() };
  },

  updateSessionCondition: async (sessionId: string, condition: string) => {
    await delay();
    const idx = db.mockSessions.findIndex((s) => s.id === sessionId);
    if (idx >= 0) {
      db.mockSessions[idx] = {
        ...db.mockSessions[idx],
        condition: condition as Session['condition'],
      };
      return { ...db.mockSessions[idx] };
    }
    return { id: sessionId, condition };
  },
};

// ==========================================
// CREDENTIALS API
// ==========================================
export const credentialsApi = {
  getCredentials: async (): Promise<VerifiableCredential[]> => {
    await delay();
    return [...db.mockCredentials];
  },

  issueCredential: async (sessionId: string): Promise<VerifiableCredential> => {
    await delay();
    const session = db.mockSessions.find((s) => s.id === sessionId);
    const credential: VerifiableCredential = {
      id: `cred-${Date.now()}`,
      session_id: sessionId,
      candidate_name: session?.candidate_name || 'Candidate',
      pseudonym_id: session?.pseudonym_id || 'CND-MOCK',
      assessment_title: session?.assessment_title || 'Assessment',
      skill: 'Programming',
      score: session?.score ?? 80,
      tests_passed: session?.tests_passed ?? 0,
      tests_total: session?.tests_total ?? 0,
      status: 'valid',
      issued_at: new Date().toISOString(),
      issuer: {
        id: 'did:verifyiq:issuer',
        name: 'VerifyIQ',
        publicKey: 'ed25519:MOCK_PUBLIC_KEY_ABC123',
      },
      credential_json: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `cred-${Date.now()}`,
        type: ['VerifiableCredential', 'SkillCredential'],
        issuer: 'did:verifyiq:issuer',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:verifyiq:${session?.pseudonym_id || 'CND-MOCK'}`,
          pseudonymId: session?.pseudonym_id || 'CND-MOCK',
          skillAssessment: session?.assessment_title || 'Assessment',
          score: session?.score ?? 80,
          verificationLevel: 'behavioral',
        },
      },
      signature: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: 'did:verifyiq:issuer#key-1',
        proofValue: 'zMockProofValue',
      },
      qr_url: `/verify/cred-${Date.now()}`,
    };
    db.mockCredentials.unshift(credential);
    return credential;
  },

  getCredential: async (credentialId: string): Promise<VerifiableCredential> => {
    await delay();
    const found = db.mockCredentials.find((c) => c.id === credentialId);
    if (!found) throw new Error(`Credential ${credentialId} not found`);
    return { ...found };
  },

  getCredentialBySession: async (sessionId: string): Promise<VerifiableCredential> => {
    await delay();
    const found = db.mockCredentials.find((c) => c.session_id === sessionId);
    if (!found) throw new Error(`Credential for session ${sessionId} not found`);
    return { ...found };
  },

  revokeCredential: async (credentialId: string, _reason?: string): Promise<VerifiableCredential> => {
    await delay();
    const idx = db.mockCredentials.findIndex((c) => c.id === credentialId);
    if (idx < 0) throw new Error(`Credential ${credentialId} not found`);
    db.mockCredentials[idx] = {
      ...db.mockCredentials[idx],
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    };
    return { ...db.mockCredentials[idx] };
  },

  verifyPublicCredential: async (
    credentialId: string
  ): Promise<{
    status: 'valid' | 'revoked' | 'not_found';
    skill?: string;
    issued_at?: string;
    issuer?: string;
    pseudonym_id?: string;
    assessment_title?: string;
  }> => {
    await delay();
    const found = db.mockCredentials.find((c) => c.id === credentialId);
    if (!found) return { status: 'not_found' };
    return {
      status: found.status === 'valid' ? 'valid' : 'revoked',
      skill: found.skill,
      issued_at: found.issued_at,
      issuer: found.issuer.name,
      pseudonym_id: found.pseudonym_id,
      assessment_title: found.assessment_title,
    };
  },
};

// ==========================================
// ADMIN & SETTINGS API
// ==========================================
export const adminApi = {
  getSettings: async (): Promise<SystemSettings> => {
    await delay();
    return { ...db.mockSettings };
  },

  updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    await delay();
    Object.assign(db.mockSettings, data);
    return { ...db.mockSettings };
  },

  getUsers: async (): Promise<User[]> => {
    await delay();
    return [...db.mockUsers];
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    await delay();
    const idx = db.mockUsers.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error(`User ${userId} not found`);
    db.mockUsers[idx] = { ...db.mockUsers[idx], role: role as User['role'] };
    return { ...db.mockUsers[idx] };
  },

  getAuditLogs: async (limit = 100) => {
    await delay();
    return db.mockAuditLogs.slice(0, limit);
  },
};
