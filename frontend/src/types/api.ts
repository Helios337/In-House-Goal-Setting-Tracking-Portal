export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  // Validation errors from backend formatted as field -> message array
  errors?: Record<string, string[]>; 
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
