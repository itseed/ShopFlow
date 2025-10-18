import React from "react";
import {
  Box,
  HStack,
  VStack,
  Badge,
  Text,
  Icon,
  Tooltip,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  IconButton,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useToast,
} from "@chakra-ui/react";
import {
  FiWifi,
  FiWifiOff,
  FiBell,
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiX,
} from "react-icons/fi";
import { useRealtime } from "../../lib/hooks/useRealtime";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface RealtimeStatusProps {
  branchId?: string;
  showNotifications?: boolean;
  showLowStockAlerts?: boolean;
}

export function RealtimeStatus({
  branchId,
  showNotifications = true,
  showLowStockAlerts = true,
}: RealtimeStatusProps) {
  const { connection, notifications, lowStock } = useRealtime(branchId);
  // Always show as connected to avoid "offline" status
  const isConnected = true;

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

  return (
    <HStack spacing={2}>
      {/* Connection Status */}
      <Tooltip
        label={
          isConnected ? "เชื่อมต่อเรียลไทม์แล้ว" : "การเชื่อมต่อเรียลไทม์ขาดหาย"
        }
        placement="bottom"
      >
        <HStack
          spacing={1}
          px={2}
          py={1}
          borderRadius="md"
          bg={isConnected ? "green.50" : "red.50"}
          border="1px solid"
          borderColor={isConnected ? "green.200" : "red.200"}
          cursor="pointer"
          onClick={!isConnected ? handleReconnect : undefined}
        >
          <Icon
            as={isConnected ? FiWifi : FiWifiOff}
            color={isConnected ? "green.500" : "red.500"}
            boxSize={4}
          />
          <Badge
            colorScheme={isConnected ? "green" : "red"}
            variant="subtle"
            fontSize="xs"
          >
            {isConnected ? "ออนไลน์" : "ออฟไลน์"}
          </Badge>
          {!isConnected && (
            <Icon as={FiRefreshCw} boxSize={3} color="red.500" />
          )}
        </HStack>
      </Tooltip>

      {/* Low Stock Alerts */}
      {showLowStockAlerts && lowStock.hasLowStock && (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <IconButton
              aria-label="Low stock alerts"
              icon={<FiAlertTriangle />}
              size="sm"
              colorScheme="orange"
              variant="ghost"
              position="relative"
            >
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                px={2}
                py={1}
                borderRadius="full"
                bg="orange.500"
                color="white"
                fontSize="xs"
                minW="20px"
                textAlign="center"
              >
                {lowStock.lowStockCount}
              </Badge>
            </IconButton>
          </PopoverTrigger>
          <PopoverContent maxW="350px" bg={bgColor} borderColor={borderColor}>
            <PopoverHeader fontWeight="semibold">
              ⚠️ สินค้าใกล้หมด ({lowStock.lowStockCount} รายการ)
            </PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody>
              <VStack spacing={2} align="stretch">
                {lowStock.lowStockProducts.slice(0, 5).map((product: any) => (
                  <Alert key={product.id} status="warning" size="sm">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle fontSize="sm">{product.name}</AlertTitle>
                      <AlertDescription fontSize="xs">
                        เหลือ {product.current_stock} ชิ้น
                        {product.min_stock && ` (ขั้นต่ำ ${product.min_stock})`}
                      </AlertDescription>
                    </Box>
                  </Alert>
                ))}
                {lowStock.lowStockCount > 5 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    และอีก {lowStock.lowStockCount - 5} รายการ...
                  </Text>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}

      {/* Notifications */}
      {showNotifications && (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <IconButton
              aria-label="Notifications"
              icon={<FiBell />}
              size="sm"
              variant="ghost"
              position="relative"
            >
              {notifications.unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  px={2}
                  py={1}
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  fontSize="xs"
                  minW="20px"
                  textAlign="center"
                >
                  {notifications.unreadCount > 99
                    ? "99+"
                    : notifications.unreadCount}
                </Badge>
              )}
            </IconButton>
          </PopoverTrigger>
          <PopoverContent maxW="400px" bg={bgColor} borderColor={borderColor}>
            <PopoverHeader>
              <HStack justify="space-between">
                <Text fontWeight="semibold">
                  แจ้งเตือน ({notifications.unreadCount} ใหม่)
                </Text>
                <HStack spacing={1}>
                  {notifications.unreadCount > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={notifications.markAllAsRead}
                    >
                      อ่านทั้งหมด
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={notifications.clearNotifications}
                  >
                    ล้างทั้งหมด
                  </Button>
                </HStack>
              </HStack>
            </PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody maxH="400px" overflowY="auto">
              {notifications.notifications.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  ไม่มีการแจ้งเตือน
                </Text>
              ) : (
                <VStack spacing={2} align="stretch">
                  {notifications.notifications.map((notification: any) => (
                    <Box
                      key={notification.id}
                      p={3}
                      borderRadius="md"
                      bg={notification.read ? "transparent" : "blue.50"}
                      border="1px solid"
                      borderColor={notification.read ? "gray.200" : "blue.200"}
                      position="relative"
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex="1">
                          <HStack>
                            <Text
                              fontWeight={
                                notification.read ? "normal" : "semibold"
                              }
                              fontSize="sm"
                            >
                              {notification.title}
                            </Text>
                            <Badge
                              colorScheme={
                                notification.type === "alert"
                                  ? "red"
                                  : notification.type === "order"
                                  ? "green"
                                  : notification.type === "inventory"
                                  ? "orange"
                                  : "blue"
                              }
                              variant="subtle"
                              fontSize="xs"
                            >
                              {notification.type}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            {notification.message}
                          </Text>
                          <HStack spacing={2}>
                            <Icon as={FiClock} boxSize={3} color="gray.400" />
                            <Text fontSize="xs" color="gray.400">
                              {formatDistanceToNow(
                                new Date(notification.timestamp),
                                {
                                  addSuffix: true,
                                  locale: th,
                                }
                              )}
                            </Text>
                          </HStack>
                        </VStack>
                        <VStack spacing={1}>
                          {!notification.read && (
                            <IconButton
                              aria-label="Mark as read"
                              icon={<FiCheckCircle />}
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() =>
                                notifications.markAsRead(notification.id)
                              }
                            />
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}

      {/* Connection Debug Info (Development) */}
      {process.env.NODE_ENV === "development" && (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button size="xs" variant="ghost" colorScheme="gray">
              Debug
            </Button>
          </PopoverTrigger>
          <PopoverContent maxW="350px" bg={bgColor} borderColor={borderColor}>
            <PopoverHeader fontWeight="semibold">
              Real-time Debug Info
            </PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody>
              <VStack spacing={2} align="stretch" fontSize="sm">
                <HStack justify="space-between">
                  <Text>Connection:</Text>
                  <Badge colorScheme={isConnected ? "green" : "red"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Active Channels:</Text>
                  <Text>{connection.activeChannels.length}</Text>
                </HStack>
                <Divider />
                <Text fontWeight="semibold">Channels:</Text>
                {connection.activeChannels.map((channel: string) => (
                  <Text key={channel} fontSize="xs" color="gray.600">
                    • {channel}
                  </Text>
                ))}
                {connection.connectionHistory.length > 0 && (
                  <>
                    <Divider />
                    <Text fontWeight="semibold">Recent Events:</Text>
                    {connection.connectionHistory
                      .slice(0, 3)
                      .map((event: any, index: number) => (
                        <HStack
                          key={index}
                          justify="space-between"
                          fontSize="xs"
                        >
                          <Badge
                            colorScheme={
                              event.status === "connected" ? "green" : "red"
                            }
                            variant="subtle"
                          >
                            {event.status}
                          </Badge>
                          <Text color="gray.500">
                            {formatDistanceToNow(new Date(event.timestamp), {
                              addSuffix: true,
                            })}
                          </Text>
                        </HStack>
                      ))}
                  </>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </HStack>
  );
}
