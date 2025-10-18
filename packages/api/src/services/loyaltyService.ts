import { supabase } from "../supabase";
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
  PaginationParams,
} from "../types/api";
import {
  LoyaltyProgram,
  LoyaltyTier,
  CustomerLoyaltyMembership,
  PointsTransaction,
  CustomerLoyaltySummary,
  PointsTransactionSummary,
  LoyaltyProgramPerformance,
  CreateLoyaltyProgramData,
  UpdateLoyaltyProgramData,
  CreateLoyaltyTierData,
  UpdateLoyaltyTierData,
  CreateMembershipData,
  AddPointsRequest,
  RedeemPointsRequest,
  FindCustomerByPhoneRequest,
  FindCustomerByPhoneResponse,
  LoyaltyFilters,
  PointsTransactionFilters,
  LoyaltyStats,
  CustomerLoyaltyStats,
  POSCustomerLookup,
  POSPointsEarnPreview,
  POSPointsRedemptionOption,
} from "@shopflow/types";

/**
 * Loyalty Program Service
 * Handles all loyalty program operations including:
 * - Program management
 * - Tier management
 * - Membership management
 * - Points transactions
 * - Customer lookup by phone
 * - Points earning and redemption
 */
class LoyaltyService {
  // ==================== LOYALTY PROGRAMS ====================

  /**
   * Get all loyalty programs
   */
  async getAllPrograms(
    filters: { is_active?: boolean } = {}
  ): Promise<ApiResponse<LoyaltyProgram[]>> {
    try {
      let query = supabase
        .from("loyalty_programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as LoyaltyProgram[]);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get loyalty program by ID
   */
  async getProgramById(id: string): Promise<ApiResponse<LoyaltyProgram>> {
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as LoyaltyProgram);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Create new loyalty program
   */
  async createProgram(
    data: CreateLoyaltyProgramData
  ): Promise<ApiResponse<LoyaltyProgram>> {
    try {
      const { data: program, error } = await supabase
        .from("loyalty_programs")
        .insert([data])
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(program as LoyaltyProgram);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Update loyalty program
   */
  async updateProgram(
    id: string,
    data: UpdateLoyaltyProgramData
  ): Promise<ApiResponse<LoyaltyProgram>> {
    try {
      const { data: program, error } = await supabase
        .from("loyalty_programs")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(program as LoyaltyProgram);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Delete loyalty program
   */
  async deleteProgram(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from("loyalty_programs")
        .delete()
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  // ==================== LOYALTY TIERS ====================

  /**
   * Get all tiers for a program
   */
  async getProgramTiers(
    programId: string
  ): Promise<ApiResponse<LoyaltyTier[]>> {
    try {
      const { data, error } = await supabase
        .from("loyalty_tiers")
        .select("*")
        .eq("program_id", programId)
        .order("tier_level", { ascending: true });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as LoyaltyTier[]);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Create new loyalty tier
   */
  async createTier(
    data: CreateLoyaltyTierData
  ): Promise<ApiResponse<LoyaltyTier>> {
    try {
      const { data: tier, error } = await supabase
        .from("loyalty_tiers")
        .insert([data])
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(tier as LoyaltyTier);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Update loyalty tier
   */
  async updateTier(
    id: string,
    data: UpdateLoyaltyTierData
  ): Promise<ApiResponse<LoyaltyTier>> {
    try {
      const { data: tier, error } = await supabase
        .from("loyalty_tiers")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(tier as LoyaltyTier);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Delete loyalty tier
   */
  async deleteTier(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from("loyalty_tiers")
        .delete()
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  // ==================== CUSTOMER MEMBERSHIPS ====================

  /**
   * Get customer memberships with filters
   */
  async getMemberships(
    filters: LoyaltyFilters & PaginationParams = {}
  ): Promise<ApiResponse<CustomerLoyaltyMembership[]>> {
    try {
      const { page = 1, limit = 50, ...filterParams } = filters;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("customer_loyalty_memberships")
        .select(
          `
          *,
          program:loyalty_programs(*),
          tier:loyalty_tiers(*)
        `
        )
        .range(offset, offset + limit - 1);

      if (filterParams.program_id) {
        query = query.eq("program_id", filterParams.program_id);
      }
      if (filterParams.tier_id) {
        query = query.eq("tier_id", filterParams.tier_id);
      }
      if (filterParams.status) {
        query = query.eq("status", filterParams.status);
      }
      if (filterParams.min_points) {
        query = query.gte("current_points", filterParams.min_points);
      }
      if (filterParams.max_points) {
        query = query.lte("current_points", filterParams.max_points);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as CustomerLoyaltyMembership[]);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get customer membership by customer ID
   */
  async getCustomerMembership(
    customerId: string,
    programId?: string
  ): Promise<ApiResponse<CustomerLoyaltyMembership>> {
    try {
      let query = supabase
        .from("customer_loyalty_memberships")
        .select(
          `
          *,
          program:loyalty_programs(*),
          tier:loyalty_tiers(*)
        `
        )
        .eq("customer_id", customerId)
        .eq("status", "active");

      if (programId) {
        query = query.eq("program_id", programId);
      }

      const { data, error } = await query
        .order("joined_date", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as CustomerLoyaltyMembership);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Create new membership for customer
   */
  async createMembership(
    data: CreateMembershipData
  ): Promise<ApiResponse<CustomerLoyaltyMembership>> {
    try {
      const { data: membership, error } = await supabase
        .from("customer_loyalty_memberships")
        .insert([
          {
            customer_id: data.customer_id,
            program_id: data.program_id,
            current_points: data.initial_points || 0,
            lifetime_points: data.initial_points || 0,
            status: "active",
          },
        ])
        .select(
          `
          *,
          program:loyalty_programs(*),
          tier:loyalty_tiers(*)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(membership as CustomerLoyaltyMembership);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  // ==================== POINTS TRANSACTIONS ====================

  /**
   * Get points transactions
   */
  async getPointsTransactions(
    filters: PointsTransactionFilters & PaginationParams = {}
  ): Promise<ApiResponse<PointsTransaction[]>> {
    try {
      const { page = 1, limit = 50, ...filterParams } = filters;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("points_transactions")
        .select("*")
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      if (filterParams.customer_id) {
        query = query.eq("customer_id", filterParams.customer_id);
      }
      if (filterParams.membership_id) {
        query = query.eq("membership_id", filterParams.membership_id);
      }
      if (filterParams.transaction_type) {
        query = query.eq("transaction_type", filterParams.transaction_type);
      }
      if (filterParams.date_from) {
        query = query.gte("created_at", filterParams.date_from);
      }
      if (filterParams.date_to) {
        query = query.lte("created_at", filterParams.date_to);
      }
      if (filterParams.branch_id) {
        query = query.eq("branch_id", filterParams.branch_id);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as PointsTransaction[]);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Add points (earn or bonus)
   */
  async addPoints(
    request: AddPointsRequest
  ): Promise<ApiResponse<PointsTransaction>> {
    try {
      const { data, error } = await supabase.rpc("add_points_transaction", {
        p_membership_id: request.membership_id,
        p_customer_id: request.customer_id,
        p_transaction_type: request.transaction_type,
        p_points: request.points,
        p_description: request.description,
        p_order_id: request.order_id || null,
        p_reference_type: request.reference_type || null,
        p_amount_spent: request.amount_spent || null,
        p_branch_id: request.branch_id || null,
        p_processed_by: request.processed_by || null,
        p_expires_days: null, // Use default from program
      });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Get the created transaction
      const transactionResult = await supabase
        .from("points_transactions")
        .select("*")
        .eq("id", data)
        .single();

      if (transactionResult.error) {
        return createErrorResponse(
          handleSupabaseError(transactionResult.error)
        );
      }

      // Check for tier upgrade
      await supabase.rpc("check_and_upgrade_tier", {
        p_membership_id: request.membership_id,
      });

      return createSuccessResponse(transactionResult.data as PointsTransaction);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Redeem points
   */
  async redeemPoints(
    request: RedeemPointsRequest
  ): Promise<ApiResponse<PointsTransaction>> {
    try {
      const { data, error } = await supabase.rpc("add_points_transaction", {
        p_membership_id: request.membership_id,
        p_customer_id: request.customer_id,
        p_transaction_type: "redeem",
        p_points: -Math.abs(request.points), // Ensure negative
        p_description: request.description,
        p_order_id: request.order_id || null,
        p_reference_type: "redemption",
        p_amount_spent: null,
        p_branch_id: request.branch_id || null,
        p_processed_by: request.processed_by || null,
        p_expires_days: null,
      });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Get the created transaction
      const transactionResult = await supabase
        .from("points_transactions")
        .select("*")
        .eq("id", data)
        .single();

      if (transactionResult.error) {
        return createErrorResponse(
          handleSupabaseError(transactionResult.error)
        );
      }

      return createSuccessResponse(transactionResult.data as PointsTransaction);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  // ==================== POS PHONE-BASED LOOKUP ====================

  /**
   * Find customer by phone (POS usage)
   * Creates customer if not exists and create_if_not_exists is true
   */
  async findCustomerByPhone(
    request: FindCustomerByPhoneRequest
  ): Promise<ApiResponse<FindCustomerByPhoneResponse>> {
    try {
      // Normalize phone
      const normalizedPhone = request.phone.replace(/[^0-9+]/g, "");

      let customerId: string | null = null;
      let isNewCustomer = false;

      // If create_if_not_exists, use the database function
      if (request.create_if_not_exists) {
        const { data, error } = await supabase.rpc(
          "find_or_create_customer_by_phone",
          {
            p_phone: normalizedPhone,
            p_first_name: request.first_name || null,
            p_default_program_id: request.default_program_id || null,
          }
        );

        if (error) {
          return createErrorResponse(handleSupabaseError(error));
        }

        customerId = data;

        // Check if customer was just created
        const customerResult = await supabase
          .from("customers")
          .select("created_at")
          .eq("id", customerId)
          .single();

        if (customerResult.data) {
          const createdDate = new Date(customerResult.data.created_at);
          const now = new Date();
          isNewCustomer = now.getTime() - createdDate.getTime() < 5000; // Created within last 5 seconds
        }
      } else {
        // Just search
        const phoneResult = await supabase
          .from("customer_phone_index")
          .select("customer_id")
          .eq("phone", normalizedPhone)
          .single();

        if (phoneResult.data) {
          customerId = phoneResult.data.customer_id;
        } else {
          return createErrorResponse("Customer not found");
        }
      }

      // Get customer details with membership
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customerError) {
        return createErrorResponse(handleSupabaseError(customerError));
      }

      // Get active membership
      const membershipResult = await this.getCustomerMembership(customerId!);
      const membership = membershipResult.success
        ? membershipResult.data
        : undefined;

      const program = membership?.program as LoyaltyProgram | undefined;
      const tier = membership?.tier as LoyaltyTier | undefined;

      const response: FindCustomerByPhoneResponse = {
        customer_id: customerId!,
        customer_name:
          customer.first_name && customer.last_name
            ? `${customer.first_name} ${customer.last_name}`
            : customer.company_name || customer.phone,
        phone: customer.phone,
        email: customer.email,
        is_new_customer: isNewCustomer,
        membership: membership || undefined,
        current_points: membership?.current_points || 0,
        tier_name: tier?.name,
        points_value_baht:
          membership && program
            ? Math.floor(membership.current_points * program.redemption_rate)
            : 0,
      };

      return createSuccessResponse(response);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get customer lookup for POS
   */
  async getPOSCustomerLookup(
    phone: string
  ): Promise<ApiResponse<POSCustomerLookup>> {
    try {
      const result = await this.findCustomerByPhone({
        phone,
        create_if_not_exists: false,
      });

      if (!result.success || !result.data) {
        return createSuccessResponse({
          phone,
          customer: undefined,
          membership: undefined,
          suggested_actions: ["สร้างลูกค้าใหม่"],
        });
      }

      const data = result.data;
      const membership = data.membership;

      return createSuccessResponse({
        phone: data.phone,
        customer: {
          id: data.customer_id,
          name: data.customer_name || "Unknown",
          email: data.email,
          phone: data.phone,
          customer_type: "individual",
        },
        membership: membership
          ? {
              id: membership.id,
              membership_number: membership.membership_number,
              current_points: membership.current_points,
              tier_name: data.tier_name,
              tier_color: (membership.tier as any)?.color_code,
              points_value_baht: data.points_value_baht,
            }
          : undefined,
        suggested_actions: membership
          ? ["ใช้แต้มแทนส่วนลด", "สะสมแต้ม"]
          : ["สมัครสมาชิก"],
      });
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Preview points earn for order
   */
  async previewPointsEarn(
    orderTotal: number,
    customerId?: string,
    programId?: string
  ): Promise<ApiResponse<POSPointsEarnPreview>> {
    try {
      let membership: CustomerLoyaltyMembership | undefined;

      if (customerId) {
        const membershipResult = await this.getCustomerMembership(
          customerId,
          programId
        );
        if (membershipResult.success && membershipResult.data) {
          membership = membershipResult.data;
        }
      }

      if (!membership) {
        // Use default program
        const programsResult = await this.getAllPrograms({ is_active: true });
        if (
          !programsResult.success ||
          !programsResult.data ||
          programsResult.data.length === 0
        ) {
          return createErrorResponse("No active loyalty program");
        }

        const program = programsResult.data[0];
        const pointsToEarn = Math.floor(orderTotal * program.points_per_baht);

        return createSuccessResponse({
          order_total: orderTotal,
          points_to_earn: pointsToEarn,
          tier_multiplier: 1.0,
          new_balance: pointsToEarn,
          points_value_baht: Math.floor(pointsToEarn * program.redemption_rate),
          will_upgrade_tier: false,
        });
      }

      const program = membership.program as LoyaltyProgram | undefined;
      const tier = membership.tier as LoyaltyTier | undefined;

      if (!program) {
        return createErrorResponse("Program not found");
      }
      const tierMultiplier = tier?.points_multiplier || 1.0;

      const pointsToEarn = Math.floor(
        orderTotal * program.points_per_baht * tierMultiplier
      );
      const newBalance = membership.current_points + pointsToEarn;
      const pointsValueBaht = Math.floor(
        pointsToEarn * program.redemption_rate
      );

      // Check for tier upgrade
      const tiersResult = await this.getProgramTiers(membership.program_id);
      let willUpgradeTier = false;
      let nextTierName: string | undefined;

      if (tiersResult.success && tiersResult.data) {
        const currentTierLevel = tier?.tier_level || 0;
        const nextTier = tiersResult.data.find(
          (t) =>
            t.tier_level > currentTierLevel &&
            t.min_points_required <= newBalance &&
            t.min_total_spent <= membership.total_spent + orderTotal
        );

        if (nextTier) {
          willUpgradeTier = true;
          nextTierName = nextTier.name;
        }
      }

      return createSuccessResponse({
        order_total: orderTotal,
        points_to_earn: pointsToEarn,
        tier_multiplier: tierMultiplier,
        new_balance: newBalance,
        points_value_baht: pointsValueBaht,
        will_upgrade_tier: willUpgradeTier,
        next_tier_name: nextTierName,
      });
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get redemption options for POS
   */
  async getRedemptionOptions(
    customerId: string,
    orderTotal: number
  ): Promise<ApiResponse<POSPointsRedemptionOption[]>> {
    try {
      const membershipResult = await this.getCustomerMembership(customerId);
      if (!membershipResult.success || !membershipResult.data) {
        return createSuccessResponse([]);
      }

      const membership = membershipResult.data;
      const program = membership.program as LoyaltyProgram | undefined;

      if (!program) {
        return createSuccessResponse([]);
      }

      const currentPoints = membership.current_points;

      if (currentPoints < program.minimum_points_to_redeem) {
        return createSuccessResponse([]);
      }

      const maxRedeemablePoints = Math.min(
        currentPoints,
        Math.floor(orderTotal / program.redemption_rate)
      );

      const options: POSPointsRedemptionOption[] = [];

      // Option 1: Use all available points
      if (maxRedeemablePoints >= program.minimum_points_to_redeem) {
        options.push({
          points_to_redeem: maxRedeemablePoints,
          discount_amount: maxRedeemablePoints * program.redemption_rate,
          description: `ใช้แต้มทั้งหมด ${maxRedeemablePoints} แต้ม`,
          recommended: true,
        });
      }

      // Option 2: Use 75% of points
      const points75 = Math.floor(maxRedeemablePoints * 0.75);
      if (
        points75 >= program.minimum_points_to_redeem &&
        points75 !== maxRedeemablePoints
      ) {
        options.push({
          points_to_redeem: points75,
          discount_amount: points75 * program.redemption_rate,
          description: `ใช้ ${points75} แต้ม (เหลือสำรองไว้)`,
          recommended: false,
        });
      }

      // Option 3: Use 50% of points
      const points50 = Math.floor(maxRedeemablePoints * 0.5);
      if (
        points50 >= program.minimum_points_to_redeem &&
        points50 !== points75
      ) {
        options.push({
          points_to_redeem: points50,
          discount_amount: points50 * program.redemption_rate,
          description: `ใช้ ${points50} แต้ม (ครึ่งหนึ่ง)`,
          recommended: false,
        });
      }

      // Option 4: Use minimum
      if (
        program.minimum_points_to_redeem !== maxRedeemablePoints &&
        program.minimum_points_to_redeem !== points75 &&
        program.minimum_points_to_redeem !== points50
      ) {
        options.push({
          points_to_redeem: program.minimum_points_to_redeem,
          discount_amount:
            program.minimum_points_to_redeem * program.redemption_rate,
          description: `ใช้ขั้นต่ำ ${program.minimum_points_to_redeem} แต้ม`,
          recommended: false,
        });
      }

      return createSuccessResponse(options);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  // ==================== STATISTICS & REPORTING ====================

  /**
   * Get loyalty statistics
   */
  async getLoyaltyStats(): Promise<ApiResponse<LoyaltyStats>> {
    try {
      // Get program stats
      const programsResult = await supabase
        .from("loyalty_programs")
        .select("id, is_active");

      // Get membership stats
      const membershipsResult = await supabase
        .from("customer_loyalty_memberships")
        .select("status, current_points");

      // Get transaction stats
      const transactionsResult = await supabase
        .from("points_transactions")
        .select("transaction_type, points");

      // Get default program for liability calculation
      const defaultProgramResult = await supabase
        .from("loyalty_programs")
        .select("redemption_rate")
        .eq("is_active", true)
        .limit(1)
        .single();

      const programs = programsResult.data || [];
      const memberships = membershipsResult.data || [];
      const transactions = transactionsResult.data || [];
      const redemptionRate = defaultProgramResult.data?.redemption_rate || 1;

      const totalPointsIssued = memberships.reduce(
        (sum, m) => sum + (m.current_points || 0),
        0
      );
      const totalPointsRedeemed = transactions
        .filter((t) => t.transaction_type === "redeem")
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

      const stats: LoyaltyStats = {
        total_programs: programs.length,
        active_programs: programs.filter((p) => p.is_active).length,
        total_members: memberships.length,
        active_members: memberships.filter((m) => m.status === "active").length,
        total_points_issued: totalPointsIssued,
        total_points_redeemed: totalPointsRedeemed,
        total_transactions: transactions.length,
        points_liability_baht: totalPointsIssued * redemptionRate,
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get customer loyalty stats
   */
  async getCustomerLoyaltyStats(
    customerId: string
  ): Promise<ApiResponse<CustomerLoyaltyStats>> {
    try {
      const membershipResult = await this.getCustomerMembership(customerId);
      if (!membershipResult.success || !membershipResult.data) {
        return createErrorResponse("Customer has no active membership");
      }

      const membership = membershipResult.data;
      const program = membership.program as LoyaltyProgram | undefined;
      const tier = membership.tier as LoyaltyTier | undefined;

      if (!program) {
        return createErrorResponse("Program not found");
      }

      // Get transaction stats
      const transactionsResult = await this.getPointsTransactions({
        customer_id: customerId,
        limit: 1000,
      });

      const transactions = transactionsResult.data || [];
      const totalPointsEarned = transactions
        .filter(
          (t) => t.transaction_type === "earn" || t.transaction_type === "bonus"
        )
        .reduce((sum, t) => sum + t.points, 0);
      const totalPointsRedeemed = transactions
        .filter((t) => t.transaction_type === "redeem")
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

      // Get next tier info
      const tiersResult = await this.getProgramTiers(membership.program_id);
      let nextTierName: string | undefined;
      let pointsToNextTier: number | undefined;

      if (tiersResult.success && tiersResult.data) {
        const currentTierLevel = tier?.tier_level || 0;
        const nextTier = tiersResult.data.find(
          (t) => t.tier_level > currentTierLevel
        );
        if (nextTier) {
          nextTierName = nextTier.name;
          pointsToNextTier = Math.max(
            0,
            nextTier.min_points_required - membership.current_points
          );
        }
      }

      const lastTransaction =
        transactions.length > 0 ? transactions[0].created_at : undefined;

      const stats: CustomerLoyaltyStats = {
        customer_id: customerId,
        total_points_earned: totalPointsEarned,
        total_points_redeemed: totalPointsRedeemed,
        current_points: membership.current_points,
        points_value_baht: Math.floor(
          membership.current_points * program.redemption_rate
        ),
        tier_name: tier?.name,
        next_tier_name: nextTierName,
        points_to_next_tier: pointsToNextTier,
        total_transactions: transactions.length,
        last_transaction_date: lastTransaction,
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }

  /**
   * Get program performance
   */
  async getProgramPerformance(
    programId?: string
  ): Promise<ApiResponse<LoyaltyProgramPerformance[]>> {
    try {
      let query = supabase.from("loyalty_program_performance").select("*");

      if (programId) {
        query = query.eq("program_id", programId);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data as LoyaltyProgramPerformance[]);
    } catch (error) {
      return createErrorResponse(String(error));
    }
  }
}

// Export singleton instance
export const loyaltyService = new LoyaltyService();

// Export types for convenience
export type {
  LoyaltyProgram,
  LoyaltyTier,
  CustomerLoyaltyMembership,
  PointsTransaction,
  CreateLoyaltyProgramData,
  UpdateLoyaltyProgramData,
  CreateLoyaltyTierData,
  UpdateLoyaltyTierData,
  CreateMembershipData,
  AddPointsRequest,
  RedeemPointsRequest,
  FindCustomerByPhoneRequest,
  FindCustomerByPhoneResponse,
  LoyaltyFilters,
  PointsTransactionFilters,
  POSCustomerLookup,
  POSPointsEarnPreview,
  POSPointsRedemptionOption,
};
