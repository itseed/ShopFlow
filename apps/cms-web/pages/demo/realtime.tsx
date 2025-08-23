import { ReactElement, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Grid,
  GridItem,
  useToast,
  Code,
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { RealtimeStatus } from "../../components/realtime/RealtimeStatus";
import { useRealtime } from "../../lib/hooks/useRealtime";
import { useCurrentBranch } from "../../lib/hooks/useAuthEnhanced";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

function RealtimeDemoPage() {
  const currentBranch = useCurrentBranch();
  const {
    connection,
    notifications,
    lowStock,
    inventory,
    orders,
    isConnected,
  } = useRealtime(currentBranch?.id);

  const toast = useToast();
  const [testNotification, setTestNotification] = useState({
    type: "info" as "order" | "inventory" | "system" | "alert",
    title: "Test Notification",
    message: "This is a test notification message",
  });
  const [testMode, setTestMode] = useState(false);

  const handleSendTestNotification = async () => {
    if (!currentBranch?.id) {
      toast({
        title: "Error",
        description: "No branch selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // TODO: Implement test notification when realtimeService is properly exported
    toast({
      title: "Test Notification",
      description:
        "Test notification functionality will be available once realtimeService export is fixed",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReconnect = async () => {
    try {
      await connection.reconnect();
      toast({
        title: "Reconnecting...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Reconnection Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getHealthStatus = async () => {
    const health = await connection.getHealthCheck();
    toast({
      title: "Health Check",
      description: (
        <Box>
          <Text>Connected: {health.connected ? "Yes" : "No"}</Text>
          <Text>Active Channels: {health.activeChannels}</Text>
          <Text>Subscriptions: {health.subscriptions.join(", ")}</Text>
        </Box>
      ),
      status: health.connected ? "success" : "error",
      duration: 10000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={2}>
          Real-time Features Demo
        </Heading>
        <Text color="gray.600">
          Test and monitor real-time functionality in ShopFlow
        </Text>
      </Box>

      <Divider />

      {/* Real-time Status Component */}
      <Card>
        <CardHeader>
          <Heading size="md">Real-time Status Component</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              This component shows in the header of every page
            </Text>
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <RealtimeStatus
                branchId={currentBranch?.id}
                showNotifications={true}
                showLowStockAlerts={true}
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Connection Status */}
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Connection Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>Status:</Text>
                  <Badge colorScheme={isConnected ? "green" : "red"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text>Active Channels:</Text>
                  <Badge variant="outline">
                    {connection.activeChannels.length}
                  </Badge>
                </HStack>

                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold">
                    Channels:
                  </Text>
                  {connection.activeChannels.map((channel: string) => (
                    <Code key={channel} fontSize="xs" p={1}>
                      {channel}
                    </Code>
                  ))}
                </VStack>

                <HStack spacing={2}>
                  <Button size="sm" onClick={handleReconnect}>
                    Reconnect
                  </Button>
                  <Button size="sm" variant="outline" onClick={getHealthStatus}>
                    Health Check
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Notifications</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>Unread Count:</Text>
                  <Badge colorScheme="blue">{notifications.unreadCount}</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text>Total Notifications:</Text>
                  <Badge variant="outline">
                    {notifications.notifications.length}
                  </Badge>
                </HStack>

                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold">
                    Recent:
                  </Text>
                  {notifications.notifications.slice(0, 3).map((notif) => (
                    <Box
                      key={notif.id}
                      p={2}
                      bg={notif.read ? "gray.50" : "blue.50"}
                      borderRadius="md"
                      fontSize="xs"
                    >
                      <Text fontWeight="semibold">{notif.title}</Text>
                      <Text color="gray.600">{notif.message}</Text>
                      <Text color="gray.500">
                        {formatDistanceToNow(new Date(notif.timestamp), {
                          addSuffix: true,
                          locale: th,
                        })}
                      </Text>
                    </Box>
                  ))}
                </VStack>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    onClick={notifications.markAllAsRead}
                    isDisabled={notifications.unreadCount === 0}
                  >
                    Mark All Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={notifications.clearNotifications}
                    isDisabled={notifications.notifications.length === 0}
                  >
                    Clear All
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Low Stock Alerts */}
      {lowStock.hasLowStock && (
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Low Stock Alert!</AlertTitle>
            <AlertDescription>
              {lowStock.lowStockCount} products are running low on stock.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Test Controls</Heading>
            <Switch
              isChecked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
            >
              Test Mode
            </Switch>
          </HStack>
        </CardHeader>
        <CardBody>
          {testMode && (
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  Test mode is enabled. Use these controls to test real-time
                  features.
                </AlertDescription>
              </Alert>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">Notification Type</FormLabel>
                    <Select
                      size="sm"
                      value={testNotification.type}
                      onChange={(e) =>
                        setTestNotification((prev) => ({
                          ...prev,
                          type: e.target.value as any,
                        }))
                      }
                    >
                      <option value="info">Info</option>
                      <option value="order">Order</option>
                      <option value="inventory">Inventory</option>
                      <option value="system">System</option>
                      <option value="alert">Alert</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">Title</FormLabel>
                    <Input
                      size="sm"
                      value={testNotification.title}
                      onChange={(e) =>
                        setTestNotification((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl>
                <FormLabel fontSize="sm">Message</FormLabel>
                <Textarea
                  size="sm"
                  value={testNotification.message}
                  onChange={(e) =>
                    setTestNotification((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleSendTestNotification}
                isDisabled={!currentBranch?.id}
              >
                Send Test Notification
              </Button>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Connection History */}
      {connection.connectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <Heading size="md">Connection History</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch">
              {connection.connectionHistory.map((event, index) => (
                <HStack
                  key={index}
                  justify="space-between"
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <Badge
                    colorScheme={event.status === "connected" ? "green" : "red"}
                    variant="subtle"
                  >
                    {event.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.600">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                      locale: th,
                    })}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}

const RealtimeDemo: NextPageWithLayout = () => {
  return <RealtimeDemoPage />;
};

RealtimeDemo.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="Real-time Demo">{page}</Layout>;
};

export default withAuth(RealtimeDemo);
