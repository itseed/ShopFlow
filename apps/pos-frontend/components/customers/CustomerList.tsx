import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Badge,
  Card,
  CardBody,
  Avatar,
  useColorModeValue,
  Icon,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoAdd,
  IoFilter,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoStar,
} from "react-icons/io5";
import { Customer, CustomerFilter, MembershipType } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface CustomerListProps {
  customers: Customer[];
  loading?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onCustomerEdit?: (customer: Customer) => void;
  onCustomerDelete?: (customerId: string) => void;
  showActions?: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading = false,
  onCustomerSelect,
  onCustomerEdit,
  onCustomerDelete,
  showActions = true,
}) => {
  const [filters, setFilters] = useState<CustomerFilter>({
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 20,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();

  const handleFilterChange = (key: keyof CustomerFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const addFilter = (filterType: string, value: string) => {
    const filterKey = `${filterType}:${value}`;
    if (!activeFilters.includes(filterKey)) {
      setActiveFilters((prev) => [...prev, filterKey]);
    }
  };

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters((prev) =>
      prev.filter((filter) => filter !== filterToRemove)
    );
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilters({
      searchTerm: "",
      sortBy: "name",
      sortOrder: "asc",
      page: 1,
      limit: 20,
    });
  };

  const getMembershipColor = (membershipType?: string) => {
    switch (membershipType?.toLowerCase()) {
      case "platinum":
        return "purple";
      case "gold":
        return "yellow";
      case "silver":
        return "gray";
      case "bronze":
        return "orange";
      default:
        return "blue";
    }
  };

  const getMembershipIcon = (membershipType?: string) => {
    return membershipType ? IoStar : IoStarOutline;
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.company_name) return customer.company_name;
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
    }
    return customer.customer_code || "Unknown Customer";
  };

  const getCustomerInitials = (customer: Customer) => {
    const name = getCustomerName(customer);
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>กำลังโหลดข้อมูลลูกค้า...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Search and Filters */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search Bar */}
              <HStack spacing={3}>
                <InputGroup flex={1}>
                  <InputLeftElement>
                    <Icon as={IoSearch} />
                  </InputLeftElement>
                  <Input
                    placeholder="ค้นหาลูกค้าด้วยชื่อ, เบอร์โทร, หรืออีเมล"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      handleFilterChange("searchTerm", e.target.value)
                    }
                  />
                </InputGroup>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  w="200px"
                >
                  <option value="name">เรียงตามชื่อ</option>
                  <option value="joinedAt">วันที่สมัคร</option>
                  <option value="totalSpent">ยอดซื้อสะสม</option>
                  <option value="lastPurchase">ซื้อล่าสุด</option>
                </Select>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortOrder",
                      e.target.value as "asc" | "desc"
                    )
                  }
                  w="150px"
                >
                  <option value="asc">น้อยไปมาก</option>
                  <option value="desc">มากไปน้อย</option>
                </Select>
              </HStack>

              {/* Quick Filters */}
              <HStack spacing={2} wrap="wrap">
                <Text fontSize="sm" color="gray.500">
                  ตัวกรอง:
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addFilter("membership", "platinum")}
                >
                  สมาชิก Platinum
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addFilter("membership", "gold")}
                >
                  สมาชิก Gold
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addFilter("hasPhone", "true")}
                >
                  มีเบอร์โทร
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addFilter("hasEmail", "true")}
                >
                  มีอีเมล
                </Button>
                <Button leftIcon={<IoFilter />} size="sm" variant="ghost">
                  ตัวกรองเพิ่มเติม
                </Button>
              </HStack>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <HStack spacing={2} wrap="wrap">
                  <Text fontSize="sm" color="gray.500">
                    กำลังกรอง:
                  </Text>
                  {activeFilters.map((filter, index) => (
                    <Tag
                      key={index}
                      size="sm"
                      colorScheme="blue"
                      variant="subtle"
                    >
                      <TagLabel>{filter.split(":")[1]}</TagLabel>
                      <TagCloseButton onClick={() => removeFilter(filter)} />
                    </Tag>
                  ))}
                  <Button size="xs" variant="ghost" onClick={clearAllFilters}>
                    ล้างทั้งหมด
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Customer List */}
        <VStack spacing={3} align="stretch">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{
                bg: hoverBg,
                cursor: onCustomerSelect ? "pointer" : "default",
              }}
              onClick={() => onCustomerSelect?.(customer)}
            >
              <CardBody>
                <HStack spacing={4} align="start">
                  {/* Avatar */}
                  <Avatar
                    size="md"
                    name={getCustomerName(customer)}
                    bg="blue.500"
                    color="white"
                  >
                    {getCustomerInitials(customer)}
                  </Avatar>

                  {/* Customer Info */}
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2} align="center">
                      <Text fontSize="lg" fontWeight="bold">
                        {getCustomerName(customer)}
                      </Text>
                      {customer.loyalty_points > 0 && (
                        <HStack spacing={1}>
                          <Icon
                            as={IoStar}
                            color="yellow.500"
                            w={3}
                            h={3}
                          />
                          <Badge
                            colorScheme="yellow"
                            size="sm"
                          >
                            {customer.loyalty_points} แต้ม
                          </Badge>
                        </HStack>
                      )}
                      {customer.status !== "active" && (
                        <Badge colorScheme="red" size="sm">
                          ไม่ใช้งาน
                        </Badge>
                      )}
                    </HStack>

                    <Text fontSize="sm" color="gray.500">
                      รหัสลูกค้า: {customer.customer_code}
                    </Text>

                    <HStack spacing={4} wrap="wrap">
                      {customer.phone && (
                        <HStack spacing={1}>
                          <Icon as={IoCallOutline} color="gray.500" />
                          <Text fontSize="sm">
                            {formatPhoneNumber(customer.phone)}
                          </Text>
                        </HStack>
                      )}
                      {customer.email && (
                        <HStack spacing={1}>
                          <Icon as={IoMailOutline} color="gray.500" />
                          <Text fontSize="sm">{customer.email}</Text>
                        </HStack>
                      )}
                      <HStack spacing={1}>
                        <Icon as={IoCalendarOutline} color="gray.500" />
                        <Text fontSize="sm">
                          สมัคร {customer.created_at ? new Date(customer.created_at).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                        </Text>
                      </HStack>
                    </HStack>

                    {customer.loyalty_points > 0 && (
                      <HStack spacing={4} mt={2}>
                        <Text fontSize="sm">
                          <strong>แต้มสะสม:</strong>{" "}
                          {customer.loyalty_points.toLocaleString()} แต้ม
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  {/* Actions */}
                  {showActions && (
                    <VStack spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomerEdit?.(customer);
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomerDelete?.(customer.id);
                        }}
                      >
                        ลบ
                      </Button>
                    </VStack>
                  )}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Empty State */}
        {customers.length === 0 && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={10}>
              <Icon
                as={IoPersonOutline}
                w={12}
                h={12}
                color="gray.400"
                mb={4}
              />
              <Text fontSize="lg" color="gray.500" mb={2}>
                ไม่พบข้อมูลลูกค้า
              </Text>
              <Text fontSize="sm" color="gray.400" mb={4}>
                ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง
              </Text>
              <Button leftIcon={<IoAdd />} colorScheme="blue">
                เพิ่มลูกค้าใหม่
              </Button>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default CustomerList;
