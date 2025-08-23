import { ReactElement } from "react";
import { Box } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import ReportsDashboard from "../../components/reports/ReportsDashboard";
import { withAuth } from "../../lib/auth";
import { PermissionGuard } from "../../components/auth/PermissionGuard";
import { NextPageWithLayout } from "../_app";

function ReportsOverviewPage() {
  return (
    <Box>
      <PermissionGuard permission="reports.view">
        <ReportsDashboard />
      </PermissionGuard>
    </Box>
  );
}

const ReportsOverview: NextPageWithLayout = () => {
  return <ReportsOverviewPage />;
};

ReportsOverview.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(ReportsOverview);
