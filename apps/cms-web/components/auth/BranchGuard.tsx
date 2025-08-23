import { ReactNode } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";
import {
  useCanAccessBranch,
  useBranchAccess,
} from "../../lib/hooks/useAuthEnhanced";

interface BranchGuardProps {
  children: ReactNode;
  branchId?: string;
  requireBranchAccess?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function BranchGuard({
  children,
  branchId,
  requireBranchAccess = false,
  fallback,
  showFallback = true,
}: BranchGuardProps) {
  const { data: branchAccess } = useBranchAccess();
  const canAccessBranch = useCanAccessBranch(branchId || "");

  let hasAccess = true;

  // If specific branch access is required
  if (branchId && requireBranchAccess) {
    hasAccess = canAccessBranch;
  }
  // If general branch access is required
  else if (requireBranchAccess && !branchId) {
    hasAccess = (branchAccess?.accessible || []).length > 0;
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
          <AlertTitle>ไม่มีสิทธิ์เข้าถึงสาขา</AlertTitle>
          <AlertDescription>
            {branchId
              ? "คุณไม่มีสิทธิ์เข้าถึงสาขานี้"
              : "คุณไม่ได้รับมอบหมายให้เข้าถึงสาขาใดๆ กรุณาติดต่อผู้ดูแลระบบ"}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withBranchAccess<P extends object>(
  Component: React.ComponentType<P>,
  requireBranchAccess = true
) {
  const BranchWrappedComponent = function (props: P) {
    return (
      <BranchGuard requireBranchAccess={requireBranchAccess}>
        <Component {...props} />
      </BranchGuard>
    );
  };

  BranchWrappedComponent.displayName = `withBranchAccess(${
    Component.displayName || Component.name
  })`;

  return BranchWrappedComponent;
}

// Branch switcher component for admins
interface BranchSwitcherProps {
  children: (currentBranch: any) => ReactNode;
}

export function BranchSwitcher({ children }: BranchSwitcherProps) {
  const { data: branchAccess } = useBranchAccess();

  if (!branchAccess?.current) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>ไม่มีสาขาที่เลือก</AlertTitle>
          <AlertDescription>กรุณาเลือกสาขาเพื่อดูข้อมูล</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return <>{children(branchAccess.current)}</>;
}
