import React from "react";
import {
  Box,
  HStack,
  VStack,
  Badge,
  Text,
  Icon,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  Flex,
} from "@chakra-ui/react";
import {
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { usePOSRealtime } from "../../lib/hooks/useRealtime";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface POSRealtimeStatusProps {
  branchId?: string;
  compact?: boolean;
}

export function POSRealtimeStatus({
  branchId,
  compact = false,
}: POSRealtimeStatusProps) {
  const { connection, notifications, inventory, orders, isConnected } =
    usePOSRealtime(branchId);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleReconnect = async () => {
    try {
      await connection.reconnect();
      toast({
        title: "กำลังเชื่อมต่อใหม่...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "ไม่สามารถเชื่อมต่อได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const dismissAlert = (alertId: string) => {
    notifications.dismissAlert(alertId);
  };

  if (compact) {
    return (
      <HStack spacing={2}>
        {/* Compact Connection Status */}
        <HStack
          spacing={1}
          px={2}
          py={1}
          borderRadius="md"
          bg={isConnected ? "green.50" : "red.50"}
          border="1px solid"
          borderColor={isConnected ? "green.200" : "red.200"}
        >
          <Icon
            as={isConnected ? FiWifi : FiWifiOff}
            color={isConnected ? "green.500" : "red.500"}
            boxSize={3}
          />
          <Text fontSize="xs" color={isConnected ? "green.700" : "red.700"}>
            {isConnected ? "ออนไลน์" : "ออฟไลน์"}
          </Text>
        </HStack>

        {/* Sync Status */}
        {inventory.syncStatus === "syncing" && (
          <HStack spacing={1} px={2} py={1} borderRadius="md" bg="blue.50">
            <Icon
              as={FiRefreshCw}
              color="blue.500"
              boxSize={3}
              className="spinning"
            />
            <Text fontSize="xs" color="blue.700">
              ซิงค์
            </Text>
          </HStack>
        )}

        {/* Alert Count */}
        {notifications.alertCount > 0 && (
          <Badge colorScheme="red" variant="solid" borderRadius="full">
            {notifications.alertCount}
          </Badge>
        )}
      </HStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* Connection Status Bar */}
      <Flex
        justify="space-between"
        align="center"
        p={3}
        bg={bgColor}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={3}>
          <Icon
            as={isConnected ? FiWifi : FiWifiOff}
            color={isConnected ? "green.500" : "red.500"}
            boxSize={5}
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold" fontSize="sm">
              {isConnected ? "เชื่อมต่อแล้ว" : "การเชื่อมต่อขาดหาย"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {connection.lastSync ? (
                <>
                  ซิงค์ล่าสุด:{" "}
                  {formatDistanceToNow(new Date(connection.lastSync), {
                    addSuffix: true,
                    locale: th,
                  })}
                </>
              ) : (
                "ยังไม่มีการซิงค์"
              )}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          <Badge colorScheme={isConnected ? "green" : "red"} variant="subtle">
            {connection.connectionStatus}
          </Badge>

          {!isConnected && (
            <Button
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleReconnect}
              isLoading={connection.connectionStatus === "connecting"}
              loadingText="เชื่อมต่อ..."
            >
              เชื่อมต่อใหม่
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Active Alerts */}
      {notifications.activeAlerts.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontWeight="semibold" fontSize="sm">
            การแจ้งเตือนสำคัญ
          </Text>
          {notifications.activeAlerts.map((alert: any) => (
            <Alert key={alert.id} status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{alert.title}</AlertTitle>
                <AlertDescription fontSize="xs">
                  {alert.message}
                </AlertDescription>
              </Box>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => dismissAlert(alert.id)}
              >
                ✕
              </Button>
            </Alert>
          ))}
        </VStack>
      )}

      {/* Status Cards */}
      <HStack spacing={4} w="full">
        {/* Inventory Sync Status */}
        <Box
          flex="1"
          p={3}
          bg={bgColor}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon
                as={
                  inventory.syncStatus === "syncing"
                    ? FiRefreshCw
                    : FiCheckCircle
                }
                color={
                  inventory.syncStatus === "synced"
                    ? "green.500"
                    : inventory.syncStatus === "syncing"
                    ? "blue.500"
                    : "red.500"
                }
                boxSize={4}
                className={inventory.syncStatus === "syncing" ? "spinning" : ""}
              />
              <Text fontWeight="semibold" fontSize="sm">
                ซิงค์สินค้า
              </Text>
            </HStack>
            <Badge
              colorScheme={
                inventory.syncStatus === "synced"
                  ? "green"
                  : inventory.syncStatus === "syncing"
                  ? "blue"
                  : "red"
              }
              variant="subtle"
              fontSize="xs"
            >
              {inventory.syncStatus === "synced"
                ? "ปกติ"
                : inventory.syncStatus === "syncing"
                ? "กำลังซิงค์"
                : "ข้อผิดพลาด"}
            </Badge>
          </VStack>
        </Box>

        {/* Order Processing Status */}
        <Box
          flex="1"
          p={3}
          bg={bgColor}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon
                as={orders.processingCount > 0 ? FiClock : FiCheckCircle}
                color={orders.processingCount > 0 ? "orange.500" : "green.500"}
                boxSize={4}
              />
              <Text fontWeight="semibold" fontSize="sm">
                ออเดอร์
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {orders.processingCount > 0
                ? `กำลังประมวลผล ${orders.processingCount} ออเดอร์`
                : "ไม่มีออเดอร์รอประมวลผล"}
            </Text>
          </VStack>
        </Box>
      </HStack>

      {/* Recent Notifications */}
      {notifications.notifications.length > 0 && (
        <Box>
          <Text fontWeight="semibold" fontSize="sm" mb={2}>
            การแจ้งเตือนล่าสุด
          </Text>
          <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
            {notifications.notifications
              .slice(0, 5)
              .map((notification: any) => (
                <Box
                  key={notification.id}
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderLeftColor={
                    notification.priority === "high"
                      ? "red.500"
                      : notification.priority === "medium"
                      ? "orange.500"
                      : "blue.500"
                  }
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="semibold" fontSize="xs">
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: th,
                        })}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={
                        notification.priority === "high"
                          ? "red"
                          : notification.priority === "medium"
                          ? "orange"
                          : "blue"
                      }
                      variant="subtle"
                      fontSize="xs"
                    >
                      {notification.type}
                    </Badge>
                  </HStack>
                </Box>
              ))}
          </VStack>

          {notifications.notifications.length > 5 && (
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              และอีก {notifications.notifications.length - 5} รายการ...
            </Text>
          )}
        </Box>
      )}

      {/* Connection Retry Info */}
      {!isConnected && connection.retryCount > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">กำลังพยายามเชื่อมต่อ</AlertTitle>
            <AlertDescription fontSize="xs">
              ความพยายามครั้งที่ {connection.retryCount}
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  );
}
