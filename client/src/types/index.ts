// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Contact Types
export interface Contact {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  filingStatus?: 'Single' | 'Married Filing Jointly' | 'Married Filing Separately' | 'Head of Household' | 'Qualifying Widow(er)';
  status?: 'active' | 'lead' | 'inactive';
  notes?: string;
  tags: string[];
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  filingStatus?: 'Single' | 'Married Filing Jointly' | 'Married Filing Separately' | 'Head of Household' | 'Qualifying Widow(er)';
  status?: 'active' | 'lead' | 'inactive';
  notes?: string;
  tags?: string[];
  lastContactDate?: string;
}

export interface UpdateContactRequest extends CreateContactRequest {}

export interface ContactSearchOptions {
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'first_name' | 'last_name' | 'company';
  orderDirection?: 'ASC' | 'DESC';
}

export interface ContactStats {
  totalContacts: number;
  contactsWithEmail: number;
  contactsWithPhone: number;
  contactsWithCompany: number;
}

// Message Template Types
export interface MessageTemplate {
  id: number;
  name: string;
  subject?: string;
  body: string;
  type: 'email' | 'sms';
  category?: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageTemplateRequest {
  name: string;
  subject?: string;
  body: string;
  type: 'email' | 'sms';
  category?: string;
  variables?: string[];
}

export interface UpdateMessageTemplateRequest extends CreateMessageTemplateRequest {}

export interface TemplatePreview {
  subject: string;
  body: string;
  sampleData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    position: string;
  };
}

export interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms';
  category: string;
}

// Message Campaign Types
export interface MessageCampaign {
  id: number;
  userId: number;
  name: string;
  templateId?: number;
  templateName?: string;
  type: 'email' | 'sms';
  status: 'draft' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  templateId: number;
  contactIds: number[];
  type: 'email' | 'sms';
  scheduledAt?: string;
}

// Message History Types (Individual Messages)
export interface MessageHistory {
  id: number;
  campaignId: number;
  userId: number;
  contactId: number;
  templateId?: number;
  type: 'email' | 'sms';
  subject?: string;
  body: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  providerMessageId?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendBulkMessageRequest {
  templateId?: number;
  contactIds: number[];
  subject?: string;
  body: string;
  type: 'email' | 'sms';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form Types (for frontend forms)
export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  filing_status: string;
  status: string;
  notes: string;
  tags: string[];
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  companyName: string;
}

// Dashboard Types
export interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  totalTemplates: number;
  totalCampaigns: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  deliveryRate: number;
  // Growth percentages
  contactsGrowth: number;
  messagesGrowth: number;
  templatesGrowth: number;
  campaignsGrowth: number;
  openRateGrowth: number;
  clickRateGrowth: number;
  responseRateGrowth: number;
  deliveryRateGrowth: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
} 