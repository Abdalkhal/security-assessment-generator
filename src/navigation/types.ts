export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: { clientId: string };
  ClientForm: { clientId?: string } | undefined;
};

export type AssessmentsStackParamList = {
  AssessmentsList: undefined;
  AssessmentDetail: { assessmentId: string };
  AssessmentForm: { assessmentId?: string; clientId?: string } | undefined;
  FindingLibrary: { assessmentId: string };
  FindingForm: { assessmentId: string; findingId?: string; templateId?: string };
  FindingDetail: { findingId: string };
  ReportPreview: { assessmentId: string };
};

export type ReportsStackParamList = {
  ReportsList: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  AssessmentsTab: undefined;
  ClientsTab: undefined;
  ReportsTab: undefined;
};
