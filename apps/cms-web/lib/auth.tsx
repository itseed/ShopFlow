import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { UserProfile } from "@shopflow/types";
import { Flex, VStack, Text, Spinner, Heading } from "@chakra-ui/react";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use service role or direct query to avoid RLS recursion
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          display_name,
          role,
          is_active,
          created_at,
          updated_at,
          branch:branches(
            id,
            name,
            is_active
          )
        `
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      // Transform the data to match our UserProfile type
      const profile: UserProfile = {
        id: data.id,
        display_name: data.display_name,
        role: data.role,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        branch: data.branch?.[0] || null, // Take first branch or null
        branch_id: data.branch?.[0]?.id || null,
      };

      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Profile will be fetched automatically by the auth state change listener
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAdmin = userProfile?.role === "admin";
  const isStaff = userProfile?.role === "staff" || isAdmin;

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    isAdmin,
    isStaff,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "admin" | "staff"
) {
  const AuthenticatedComponent = function (props: P) {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
      return (
        <Flex align="center" justify="center" minH="100vh">
          <VStack spacing={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600" fontFamily="body">
              กำลังโหลด...
            </Text>
          </VStack>
        </Flex>
      );
    }

    if (!user || !userProfile) {
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
      return null;
    }

    // Check role permissions
    if (requiredRole) {
      if (requiredRole === "admin" && userProfile.role !== "admin") {
        return (
          <Flex align="center" justify="center" minH="100vh">
            <VStack spacing={4} textAlign="center">
              <Heading size="lg" color="gray.900" fontFamily="heading">
                ไม่มีสิทธิ์เข้าถึง
              </Heading>
              <Text color="gray.600" fontFamily="body">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </Text>
            </VStack>
          </Flex>
        );
      }

      if (
        requiredRole === "staff" &&
        !["admin", "staff"].includes(userProfile.role)
      ) {
        return (
          <Flex align="center" justify="center" minH="100vh">
            <VStack spacing={4} textAlign="center">
              <Heading size="lg" color="gray.900" fontFamily="heading">
                ไม่มีสิทธิ์เข้าถึง
              </Heading>
              <Text color="gray.600" fontFamily="body">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </Text>
            </VStack>
          </Flex>
        );
      }
    }

    // Check if user is active
    if (!userProfile.is_active) {
      return (
        <Flex align="center" justify="center" minH="100vh">
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="gray.900" fontFamily="heading">
              บัญชีถูกปิดใช้งาน
            </Heading>
            <Text color="gray.600" fontFamily="body">
              กรุณาติดต่อผู้ดูแลระบบ
            </Text>
          </VStack>
        </Flex>
      );
    }

    return <Component {...props} />;
  };

  // ส่งต่อ getLayout property ถ้ามี
  if ((Component as any).getLayout) {
    AuthenticatedComponent.getLayout = (Component as any).getLayout;
  }

  return AuthenticatedComponent;
}
