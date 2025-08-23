// Generic API Response wrapper
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface BaseFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

// Supabase specific types
export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

// Real-time subscription types
export interface RealtimeEvent<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: any[];
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// API Service base interface
export interface BaseApiService<T, CreateData, UpdateData> {
  getAll(filters?: BaseFilters & PaginationParams): Promise<ApiResponse<T[]>>;
  getById(id: string): Promise<ApiResponse<T>>;
  create(data: CreateData): Promise<ApiResponse<T>>;
  update(id: string, data: UpdateData): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
  count(filters?: BaseFilters): Promise<ApiResponse<number>>;
}

// Auth types
export interface AuthResponse {
  user: any;
  session: any;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends LoginCredentials {
  displayName?: string;
  role?: string;
  branchId?: string;
}

// Export utility functions
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  data,
  error: null,
  success: true,
  message,
});

export const createErrorResponse = <T = null>(
  error: string,
  data: T = null as T
): ApiResponse<T> => ({
  data,
  error,
  success: false,
});

export const handleSupabaseError = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
};
