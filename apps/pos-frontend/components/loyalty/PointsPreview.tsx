import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { IoTrophy, IoTrendingUp, IoGift, IoSparkles } from "react-icons/io5";
import { loyaltyService, POSPointsEarnPreview } from "@shopflow/api";

interface PointsPreviewProps {
  orderTotal: number;
  customerId?: string;
  onPointsCalculated?: (points: number) => void;
}

const PointsPreview: React.FC<PointsPreviewProps> = ({
  orderTotal,
  customerId,
  onPointsCalculated,
}) => {
  const [preview, setPreview] = useState<POSPointsEarnPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const bgColor = useColorModeValue("purple.50", "purple.900");
  const borderColor = useColorModeValue("purple.200", "purple.700");
  const textColor = useColorModeValue("purple.800", "purple.100");
  const upgradeColor = useColorModeValue("yellow.500", "yellow.300");

  useEffect(() => {
    const fetchPreview = async () => {
      if (orderTotal <= 0) {
        setPreview(null);
        return;
      }

      setLoading(true);
      try {
        const result = await loyaltyService.previewPointsEarn(
          orderTotal,
          customerId
        );

        if (result.success && result.data) {
          setPreview(result.data);
          if (onPointsCalculated) {
            onPointsCalculated(result.data.points_to_earn);
          }
        }
      } catch (error) {
        console.error("Error fetching points preview:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the preview fetch
    const timeoutId = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timeoutId);
  }, [orderTotal, customerId, onPointsCalculated]);

  if (!preview || preview.points_to_earn === 0) {
    return null;
  }

  return (
    <Box
      bg={bgColor}
      borderWidth={2}
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      boxShadow="md"
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={IoSparkles} color="purple.500" boxSize={5} />
            <Text fontWeight="bold" color={textColor} fontSize="md">
              แต้มที่จะได้รับ
            </Text>
          </HStack>
          {preview.tier_multiplier > 1 && (
            <Tooltip label={`โบนัส ${preview.tier_multiplier}x จากระดับสมาชิก`}>
              <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="full">
                {preview.tier_multiplier}x
              </Badge>
            </Tooltip>
          )}
        </HStack>

        {/* Points Display */}
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={IoTrophy} color="yellow.500" boxSize={8} />
            <VStack align="start" spacing={0}>
              <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                +{preview.points_to_earn.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                แต้ม
              </Text>
            </VStack>
          </HStack>

          <VStack align="end" spacing={0}>
            <Text fontSize="sm" color="gray.600">
              มูลค่า
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              ฿{preview.points_value_baht.toLocaleString()}
            </Text>
          </VStack>
        </Flex>

        {/* Tier Upgrade Notice */}
        {preview.will_upgrade_tier && preview.next_tier_name && (
          <>
            <Divider />
            <Box
              bg="yellow.100"
              borderRadius="md"
              p={3}
              borderWidth={1}
              borderColor="yellow.300"
            >
              <HStack spacing={2}>
                <Icon as={IoTrendingUp} color={upgradeColor} boxSize={5} />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="bold" fontSize="sm" color="yellow.800">
                    🎉 ยินดีด้วย! คุณจะได้เลื่อนระดับ
                  </Text>
                  <Text fontSize="xs" color="yellow.700">
                    เป็นสมาชิก{preview.next_tier_name}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </>
        )}

        {/* New Balance */}
        {customerId && (
          <Box bg="white" borderRadius="md" p={2}>
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.600">ยอดแต้มใหม่</Text>
              <Text fontWeight="bold" color="purple.600">
                {preview.new_balance.toLocaleString()} แต้ม
              </Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PointsPreview;

