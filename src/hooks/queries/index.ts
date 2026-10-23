import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assessmentsApi,
  sessionsApi,
  analysisApi,
  mlApi,
  credentialsApi,
  adminApi,
  dashboardApi,
} from '../../lib/api';
import { Assessment, Session, ReviewDecision } from '../../types';

// ==========================================
// ASSESSMENTS HOOKS
// ==========================================
export function useAssessments() {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentsApi.getAssessments(),
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentsApi.getAssessment(id),
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Assessment>) => assessmentsApi.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assessment> }) =>
      assessmentsApi.updateAssessment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.id] });
    },
  });
}

// ==========================================
// SESSIONS HOOKS
// ==========================================
export function useSessions(params?: {
  status?: string;
  category?: string;
  assessment_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionsApi.getSessions(params),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getSession(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { assessment_id: string; consent: boolean }) =>
      sessionsApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      decision,
      notes,
    }: {
      sessionId: string;
      decision: ReviewDecision;
      notes: string;
    }) => analysisApi.submitReview(sessionId, { decision, notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_analysis', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

// ==========================================
// ANALYSIS & TIMELINE HOOKS
// ==========================================
export function useSessionAnalysis(sessionId: string) {
  return useQuery({
    queryKey: ['session_analysis', sessionId],
    queryFn: () => analysisApi.getSessionAnalysis(sessionId),
    enabled: !!sessionId,
  });
}

export function useSessionEvents(sessionId: string) {
  return useQuery({
    queryKey: ['session_events', sessionId],
    queryFn: () => analysisApi.getSessionEvents(sessionId),
    enabled: !!sessionId,
  });
}

export function useSessionCodeHistory(sessionId: string) {
  return useQuery({
    queryKey: ['session_code_history', sessionId],
    queryFn: () => analysisApi.getSessionCodeHistory(sessionId),
    enabled: !!sessionId,
  });
}

// ==========================================
// ML LAB HOOKS
// ==========================================
export function useMLModels() {
  return useQuery({
    queryKey: ['ml_models'],
    queryFn: () => mlApi.getMLModels(),
  });
}

export function useMLDataset() {
  return useQuery({
    queryKey: ['ml_dataset'],
    queryFn: () => mlApi.getDataset(),
  });
}

export function useMLModelMetrics(modelId: string, split: 'val' | 'test' = 'val') {
  return useQuery({
    queryKey: ['ml_metrics', modelId, split],
    queryFn: () => mlApi.getModelMetrics(modelId, split),
    enabled: !!modelId,
  });
}

export function useUpdateThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { model_id: string; threshold_review: number; threshold_high: number }) =>
      mlApi.updateThreshold(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml_models'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export function useActivateModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => mlApi.activateModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml_models'] });
    },
  });
}

// ==========================================
// CREDENTIALS HOOKS
// ==========================================
export function useCredentials() {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.getCredentials(),
  });
}

export function useIssueCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => credentialsApi.issueCredential(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

export function useRevokeCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      credentialsApi.revokeCredential(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

// ==========================================
// DASHBOARD & ADMIN HOOKS
// ==========================================
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin_dashboard'],
    queryFn: () => dashboardApi.getAdminDashboard(),
  });
}

export function useCandidateDashboard() {
  return useQuery({
    queryKey: ['candidate_dashboard'],
    queryFn: () => dashboardApi.getCandidateDashboard(),
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system_settings'],
    queryFn: () => adminApi.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin_users'],
    queryFn: () => adminApi.getUsers(),
  });
}

export function useTrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { model_type: string; hyperparameters?: Record<string, any> }) =>
      mlApi.trainModel(data.model_type, data.hyperparameters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml_models'] });
    },
  });
}

export function useMLJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['ml_job', jobId],
    queryFn: () => mlApi.getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'running' || query.state.data?.status === 'queued' ? 2000 : false,
  });
}

