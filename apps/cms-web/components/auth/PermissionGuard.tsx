import { ReactNode } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";
import {
  useHasPermission,
  useHasPermissions,
  Permission,
} from "../../lib/hooks/useAuthEnhanced";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = true,
  fallback,
  showFallback = true,
}: PermissionGuardProps) {
  const hasPermission = useHasPermission();
  const hasPermissions = useHasPermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = hasPermissions(permissions, requireAll);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

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
            คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้ กรุณาติดต่อผู้ดูแลระบบ
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission?: Permission,
  permissions?: Permission[],
  requireAll = true
) {
  const PermissionWrappedComponent = function (props: P) {
    return (
      <PermissionGuard
        permission={permission}
        permissions={permissions}
        requireAll={requireAll}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };

  PermissionWrappedComponent.displayName = `withPermission(${
    Component.displayName || Component.name
  })`;

  return PermissionWrappedComponent;
}

// Permission-based conditional rendering
interface PermissionCheckProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function CanAccess({
  children,
  permission,
  permissions,
  requireAll = true,
  fallback = null,
}: PermissionCheckProps) {
  const hasPermission = useHasPermission();
  const hasPermissions = useHasPermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = hasPermissions(permissions, requireAll);
  } else {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
