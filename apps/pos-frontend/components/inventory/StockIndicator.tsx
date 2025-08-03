import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Badge,
  Icon,
  Tooltip,
  Circle,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import {
  IoCheckmarkCircle,
  IoWarning,
  IoAlertCircle,
  IoTrendingUp,
  IoTrendingDown,
  IoRemove,
} from "react-icons/io5";

interface StockIndicatorProps {
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
  showLabel?: boolean;
  showProgress?: boolean;
  showNumbers?: boolean;
  colorScheme?: string;
}

interface StockStatus {
  status: "healthy" | "low" | "critical" | "out";
  color: string;
  icon: any;
  text: string;
  bgColor: string;
  percentage: number;
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({
  currentStock,
  minStockLevel,
  maxStockLevel,
  unit = "หน่วย",
  size = "md",
  variant = "default",
  showLabel = true,
  showProgress = true,
  showNumbers = true,
  colorScheme,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const getStockStatus = (): StockStatus => {
    const percentage = maxStockLevel > 0 ? (currentStock / maxStockLevel) * 100 : 0;
    
    if (currentStock === 0) {
      return {
        status: "out",
        color: colorScheme || "red",
        icon: IoAlertCircle,
        text: "หมดสต็อก",
        bgColor: "red.50",
        percentage: 0,
      };
    }
    
    if (currentStock <= minStockLevel * 0.5) {
      return {
        status: "critical",
        color: colorScheme || "red",
        icon: IoAlertCircle,
        text: "วิกฤต",
        bgColor: "red.50",
        percentage,
      };
    }
    
    if (currentStock <= minStockLevel) {
      return {
        status: "low",
        color: colorScheme || "orange",
        icon: IoWarning,
        text: "ต่ำ",
        bgColor: "orange.50",
        percentage,
      };
    }

    return {
      status: "healthy",
      color: colorScheme || "green",
      icon: IoCheckmarkCircle,
      text: "ปกติ",
      bgColor: "green.50",
      percentage: Math.min(percentage, 100),
    };
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  const getSizeProps = () => {
    switch (size) {
      case "sm":
        return {
          iconSize: 4,
          fontSize: "xs",
          badgeSize: "sm",
          progressSize: "sm",
          spacing: 1,
        };
      case "lg":
        return {
          iconSize: 6,
          fontSize: "md",
          badgeSize: "lg",
          progressSize: "lg",
          spacing: 3,
        };
      default:
        return {
          iconSize: 5,
          fontSize: "sm",
          badgeSize: "md",
          progressSize: "md",
          spacing: 2,
        };
    }
  };

  const sizeProps = getSizeProps();

  // Compact variant
  if (variant === "compact") {
    return (
      <Tooltip
        label={`${currentStock} ${unit} (${stockStatus.text})`}
        placement="top"
      >
        <HStack spacing={1}>
          <Circle size={`${sizeProps.iconSize * 4}px`} bg={`${stockStatus.color}.100`}>
            <Icon as={StatusIcon} color={`${stockStatus.color}.500`} boxSize={3} />
          </Circle>
          {showNumbers && (
            <Text fontSize={sizeProps.fontSize} fontWeight="medium">
              {currentStock}
            </Text>
          )}
        </HStack>
      </Tooltip>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    const stockLevel = currentStock > minStockLevel ? "สูง" : 
                     currentStock > minStockLevel * 0.5 ? "ปานกลาง" : "ต่ำ";
    const daysRemaining = Math.floor(currentStock / 5); // Mock calculation
    const reorderPoint = minStockLevel;
    const stockValue = currentStock * 50; // Mock value calculation

    return (
      <Box
        p={4}
        bg={cardBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={`${stockStatus.color}.200`}
      >
        <VStack spacing={3} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={StatusIcon} color={`${stockStatus.color}.500`} boxSize={5} />
              <Text fontWeight="bold" fontSize="md">
                สถานะสต็อก
              </Text>
            </HStack>
            <Badge colorScheme={stockStatus.color} variant="solid">
              {stockStatus.text}
            </Badge>
          </HStack>

          {/* Stock Numbers */}
          <HStack justify="space-between" fontSize="sm">
            <VStack align="start" spacing={0}>
              <Text color={textColor}>ปัจจุบัน</Text>
              <Text fontWeight="bold" fontSize="lg">
                {currentStock.toLocaleString()} {unit}
              </Text>
            </VStack>
            <VStack align="end" spacing={0}>
              <Text color={textColor}>ขั้นต่ำ</Text>
              <Text fontWeight="medium">
                {minStockLevel.toLocaleString()} {unit}
              </Text>
            </VStack>
          </HStack>

          {/* Progress Bar */}
          {showProgress && (
            <Box>
              <HStack justify="space-between" fontSize="xs" color={textColor} mb={1}>
                <Text>0</Text>
                <Text>{maxStockLevel.toLocaleString()}</Text>
              </HStack>
              <Progress
                value={stockStatus.percentage}
                colorScheme={stockStatus.color}
                size={sizeProps.progressSize}
                borderRadius="full"
              />
              <HStack justify="space-between" fontSize="xs" color={textColor} mt={1}>
                <Text>หมด</Text>
                <Text>เต็ม</Text>
              </HStack>
            </Box>
          )}

          {/* Additional Info */}
          <VStack spacing={2} fontSize="xs" color={textColor}>
            <HStack justify="space-between" w="full">
              <Text>ระดับสต็อก:</Text>
              <Text fontWeight="medium" color={`${stockStatus.color}.600`}>
                {stockLevel}
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text>จุดสั่งซื้อ:</Text>
              <Text fontWeight="medium">{reorderPoint} {unit}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text>คาดการณ์เหลือ:</Text>
              <Text fontWeight="medium">{daysRemaining} วัน</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text>มูลค่าสต็อก:</Text>
              <Text fontWeight="medium" color="green.600">
                ฿{stockValue.toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Default variant
  return (
    <VStack spacing={sizeProps.spacing} align="start">
      {/* Status Badge */}
      <HStack spacing={2}>
        <Icon 
          as={StatusIcon} 
          color={`${stockStatus.color}.500`} 
          boxSize={sizeProps.iconSize} 
        />
        {showLabel && (
          <Badge 
            colorScheme={stockStatus.color} 
            variant="solid" 
            size={sizeProps.badgeSize}
          >
            {stockStatus.text}
          </Badge>
        )}
      </HStack>

      {/* Stock Numbers */}
      {showNumbers && (
        <HStack spacing={3} fontSize={sizeProps.fontSize}>
          <VStack align="start" spacing={0}>
            <Text color={textColor}>ปัจจุบัน</Text>
            <Text fontWeight="bold" color={`${stockStatus.color}.600`}>
              {currentStock.toLocaleString()} {unit}
            </Text>
          </VStack>
          <Text color={textColor}>/</Text>
          <VStack align="start" spacing={0}>
            <Text color={textColor}>สูงสุด</Text>
            <Text fontWeight="medium">
              {maxStockLevel.toLocaleString()} {unit}
            </Text>
          </VStack>
        </HStack>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <Box width="100%">
          <Progress
            value={stockStatus.percentage}
            colorScheme={stockStatus.color}
            size={sizeProps.progressSize}
            borderRadius="full"
          />
          <HStack justify="space-between" fontSize="xs" color={textColor} mt={1}>
            <Text>ขั้นต่ำ: {minStockLevel}</Text>
            <Text>{stockStatus.percentage.toFixed(1)}%</Text>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

// Stock Trend Indicator Component
interface StockTrendProps {
  currentStock: number;
  previousStock: number;
  size?: "sm" | "md" | "lg";
}

export const StockTrend: React.FC<StockTrendProps> = ({
  currentStock,
  previousStock,
  size = "md",
}) => {
  const difference = currentStock - previousStock;
  const percentageChange = previousStock > 0 ? ((difference / previousStock) * 100) : 0;
  
  const getTrendStatus = () => {
    if (difference > 0) {
      return {
        icon: IoTrendingUp,
        color: "green",
        text: "เพิ่มขึ้น",
        sign: "+",
      };
    } else if (difference < 0) {
      return {
        icon: IoTrendingDown,
        color: "red",
        text: "ลดลง",
        sign: "",
      };
    } else {
      return {
        icon: IoRemove,
        color: "gray",
        text: "ไม่เปลี่ยนแปลง",
        sign: "",
      };
    }
  };

  const trend = getTrendStatus();
  const TrendIcon = trend.icon;

  const getSize = () => {
    switch (size) {
      case "sm": return { iconSize: 3, fontSize: "xs" };
      case "lg": return { iconSize: 5, fontSize: "md" };
      default: return { iconSize: 4, fontSize: "sm" };
    }
  };

  const sizeProps = getSize();

  return (
    <HStack spacing={1}>
      <Icon 
        as={TrendIcon} 
        color={`${trend.color}.500`} 
        boxSize={sizeProps.iconSize} 
      />
      <Text 
        fontSize={sizeProps.fontSize} 
        color={`${trend.color}.600`}
        fontWeight="medium"
      >
        {trend.sign}{Math.abs(difference)} ({trend.sign}{Math.abs(percentageChange).toFixed(1)}%)
      </Text>
    </HStack>
  );
};