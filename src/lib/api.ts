import * as real from './api.real';
import * as mock from './mockApi';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const authApi = useMock ? mock.authApi : real.authApi;
export const assessmentsApi = useMock ? mock.assessmentsApi : real.assessmentsApi;
export const sessionsApi = useMock ? mock.sessionsApi : real.sessionsApi;
export const telemetryApi = useMock ? mock.telemetryApi : real.telemetryApi;
export const analysisApi = useMock ? mock.analysisApi : real.analysisApi;
export const assistantApi = useMock ? mock.assistantApi : real.assistantApi;
export const dashboardApi = useMock ? mock.dashboardApi : real.dashboardApi;
export const mlApi = useMock ? mock.mlApi : real.mlApi;
export const credentialsApi = useMock ? mock.credentialsApi : real.credentialsApi;
export const adminApi = useMock ? mock.adminApi : real.adminApi;
