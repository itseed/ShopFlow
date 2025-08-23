import { supabase } from "../supabase";
import { UserRole } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
  AuthResponse,
  LoginCredentials,
  SignUpData,
} from "../types/api";

// User-specific filter types
export interface UserFilters extends BaseFilters {
  role?: UserRole;
  branchId?: string;
  isActive?: boolean;
}

// User creation data
export interface CreateUserData {
  email: string;
  password: string;
  display_name: string;
  role: UserRole;
  branch_id?: string;
  is_active?: boolean;
}

// User update data
export interface UpdateUserData {
  display_name?: string;
  role?: UserRole;
  branch_id?: string;
  is_active?: boolean;
}

// User profile data
export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: {
    id: string;
    name: string;
    address?: string;
  };
}

class UserService {
  private tableName = "user_profiles";

  // Get all users with filters and pagination
  async getAll(
    filters: UserFilters & PaginationParams = {}
  ): Promise<ApiResponse<UserProfile[]>> {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        branch:branches(id, name, address)
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(`display_name.ilike.%${filters.search}%`);
      }

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      if (filters.limit) {
        const from = (filters.page || 0) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get user by ID
  async getById(id: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          branch:branches(id, name, address, phone)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("User not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new user (Auth + Profile)
  async create(userData: CreateUserData): Promise<ApiResponse<UserProfile>> {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        return createErrorResponse(handleSupabaseError(authError));
      }

      if (!authData.user) {
        return createErrorResponse("Failed to create user account");
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from(this.tableName)
        .insert({
          id: authData.user.id,
          display_name: userData.display_name,
          role: userData.role,
          branch_id: userData.branch_id,
          is_active: userData.is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          branch:branches(id, name, address)
        `
        )
        .single();

      if (profileError) {
        // Cleanup: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return createErrorResponse(handleSupabaseError(profileError));
      }

      return createSuccessResponse(profile, "User created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update user profile
  async update(
    id: string,
    updateData: UpdateUserData
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          branch:branches(id, name, address)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("User not found");
      }

      return createSuccessResponse(data, "User updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Deactivate user (soft delete)
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "User deactivated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get user count
  async count(filters: UserFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      const { count, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(count || 0);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: handleSupabaseError(error),
        };
      }

      // Get user profile
      if (data.user) {
        const profileResponse = await this.getById(data.user.id);
        if (profileResponse.success && profileResponse.data) {
          return {
            user: profileResponse.data,
            session: data.session,
            error: null,
          };
        }
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: handleSupabaseError(error),
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Logged out successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!user) {
        return createSuccessResponse(null);
      }

      return await this.getById(user.id);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Change user password
  async changePassword(
    userId: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Password updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Reset user password
  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Password reset email sent");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get users by branch
  async getUsersByBranch(
    branchId: string
  ): Promise<ApiResponse<UserProfile[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          branch:branches(id, name, address)
        `
        )
        .eq("branch_id", branchId)
        .eq("is_active", true)
        .order("display_name");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get active staff members
  async getActiveStaff(): Promise<ApiResponse<UserProfile[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          branch:branches(id, name, address)
        `
        )
        .eq("is_active", true)
        .order("display_name");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const userService = new UserService();
