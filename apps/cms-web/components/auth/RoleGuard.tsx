import { ReactNode } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";
import {
  useIsAdmin,
  useIsStaff,
  useCurrentUser,
} from "../../lib/hooks/useAuthEnhanced";

interface RoleGuardProps {
  children: ReactNode;
  roles: ("admin" | "staff")[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({
  children,
  roles,
  fallback,
  showFallback = true,
}: RoleGuardProps) {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = useIsAdmin();
  const isStaff = useIsStaff();

  const hasAccess = roles.some((role) => {
    switch (role) {
      case "admin":
        return isAdmin;
      case "staff":
        return isStaff;
      default:
        return false;
    }
  });

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>ไม่มีสิทธิ์เข้าถึง</AlertTitle>
          <AlertDescription>
            คุณต้องมีบทบาท {roles.join(" หรือ ")} เพื่อเข้าถึงส่วนนี้
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  roles: ("admin" | "staff")[]
) {
  const RoleWrappedComponent = function (props: P) {
    return (
      <RoleGuard roles={roles}>
        <Component {...props} />
      </RoleGuard>
    );
  };

  RoleWrappedComponent.displayName = `withRole(${
    Component.displayName || Component.name
  })`;

  return RoleWrappedComponent;
}

// Admin-only wrapper
export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard roles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// Staff and above wrapper
export function StaffOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard roles={["admin", "staff"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
