// User Types
export type UserRole = 'Participant' | 'Admin' | 'Team_Head';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Query Types
export type QueryStatus = 'UNASSIGNED' | 'REQUESTED' | 'ASSIGNED' | 'RESOLVED' | 'DISMANTLED';

export interface Query {
  _id: string;
  title: string;
  description: string;
  status: QueryStatus;
  answer?: string;
  dismantledReason?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  requestedBy?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface QueryResponse {
  success: boolean;
  data: {
    query: Query;
  };
}

export interface QueriesResponse {
  success: boolean;
  count: number;
  data: {
    queries: Query[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateQueryFormData {
  title: string;
  description: string;
}

export interface AssignQueryFormData {
  teamHeadId: string;
}

export interface AnswerQueryFormData {
  answer: string;
}

export interface DismantleQueryFormData {
  reason?: string;
}
