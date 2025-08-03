import React, { useState, useCallback } from "react";
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
  Collapse,
  useDisclosure,
  IconButton,
  Divider,
  SimpleGrid,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Flex,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoFilter,
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoCalendar,
  IoPersonOutline,
  IoCard,
} from "react-icons/io5";
import { Customer, MembershipType } from "@shopflow/types";

export interface CustomerFilters {
  searchTerm: string;
  membershipType: string;
  isActive: string;
  gender: string;
  ageRange: [number, number];
  totalSpentRange: [number, number];
  registrationDateRange: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface CustomerSearchProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading?: boolean;
  customerCount?: number;
  membershipTypes?: MembershipType[];
}

const defaultFilters: CustomerFilters = {
  searchTerm: "",
  membershipType: "all",
  isActive: "all",
  gender: "all",
  ageRange: [18, 80],
  totalSpentRange: [0, 100000],
  registrationDateRange: "all",
  sortBy: "name",
  sortOrder: "asc",
};

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
  customerCount = 0,
  membershipTypes = [],
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState(filters);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleFilterChange = useCallback(
    (key: keyof CustomerFilters, value: any) => {
      const updatedFilters = { ...localFilters, [key]: value };
      setLocalFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [localFilters, onFiltersChange]
  );

  const handleSearch = () => {
    onSearch();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onReset();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.searchTerm) count++;
    if (localFilters.membershipType !== "all") count++;
    if (localFilters.isActive !== "all") count++;
    if (localFilters.gender !== "all") count++;
    if (localFilters.registrationDateRange !== "all") count++;
    if (
      localFilters.ageRange[0] !== defaultFilters.ageRange[0] ||
      localFilters.ageRange[1] !== defaultFilters.ageRange[1]
    )
      count++;
    if (
      localFilters.totalSpentRange[0] !== defaultFilters.totalSpentRange[0] ||
      localFilters.totalSpentRange[1] !== defaultFilters.totalSpentRange[1]
    )
      count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card variant="elevated" bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <IoSearch size={20} />
            <Text fontSize="lg" fontWeight="bold">
              ค้นหาลูกค้า
            </Text>
            {activeFilterCount > 0 && (
              <Badge colorScheme="blue" variant="solid">
                {activeFilterCount} ตัวกรอง
              </Badge>
            )}
            {customerCount > 0 && (
              <Badge colorScheme="green" variant="outline">
                {customerCount} รายการ
              </Badge>
            )}
          </HStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              isDisabled={isLoading}
            >
              รีเซ็ต
            </Button>
            <IconButton
              aria-label="Toggle advanced search"
              icon={isOpen ? <IoChevronUp /> : <IoChevronDown />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Basic Search */}
          <HStack spacing={4}>
            <InputGroup flex={2}>
              <InputLeftElement>
                <IoSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาด้วยชื่อ, โทรศัพท์, อีเมล หรือรหัสลูกค้า..."
                value={localFilters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                size="lg"
              />
            </InputGroup>
            <Button
              leftIcon={<IoSearch />}
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={isLoading}
              size="lg"
            >
              ค้นหา
            </Button>
          </HStack>

          {/* Quick Filters */}
          <HStack spacing={4} flexWrap="wrap">
            <Select
              value={localFilters.membershipType}
              onChange={(e) =>
                handleFilterChange("membershipType", e.target.value)
              }
              w={{ base: "full", md: "200px" }}
              size="md"
            >
              <option value="all">สมาชิกทั้งหมด</option>
              {membershipTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
              <option value="none">ไม่เป็นสมาชิก</option>
            </Select>

            <Select
              value={localFilters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              w={{ base: "full", md: "150px" }}
              size="md"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="true">ใช้งานอยู่</option>
              <option value="false">ไม่ใช้งาน</option>
            </Select>

            <Select
              value={localFilters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              w={{ base: "full", md: "120px" }}
              size="md"
            >
              <option value="all">เพศทั้งหมด</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </Select>

            <Select
              value={localFilters.sortOrder}
              onChange={(e) =>
                handleFilterChange(
                  "sortOrder",
                  e.target.value as "asc" | "desc"
                )
              }
              w={{ base: "full", md: "150px" }}
              size="md"
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </Select>
          </HStack>

          {/* Advanced Filters */}
          <Collapse in={isOpen} animateOpacity>
            <VStack spacing={6} align="stretch" pt={4}>
              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Age Range */}
                <FormControl>
                  <FormLabel>ช่วงอายุ (ปี)</FormLabel>
                  <VStack spacing={3}>
                    <RangeSlider
                      value={localFilters.ageRange}
                      onChange={(value) =>
                        handleFilterChange("ageRange", value)
                      }
                      min={0}
                      max={100}
                      step={1}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack spacing={2} w="full">
                      <NumberInput
                        value={localFilters.ageRange[0]}
                        onChange={(_, value) =>
                          handleFilterChange("ageRange", [
                            value,
                            localFilters.ageRange[1],
                          ])
                        }
                        min={0}
                        max={localFilters.ageRange[1]}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                      <NumberInput
                        value={localFilters.ageRange[1]}
                        onChange={(_, value) =>
                          handleFilterChange("ageRange", [
                            localFilters.ageRange[0],
                            value,
                          ])
                        }
                        min={localFilters.ageRange[0]}
                        max={100}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </VStack>
                </FormControl>

                {/* Total Spent Range */}
                <FormControl>
                  <FormLabel>ช่วงยอดซื้อทั้งหมด (บาท)</FormLabel>
                  <VStack spacing={3}>
                    <RangeSlider
                      value={localFilters.totalSpentRange}
                      onChange={(value) =>
                        handleFilterChange("totalSpentRange", value)
                      }
                      min={0}
                      max={100000}
                      step={1000}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack spacing={2} w="full">
                      <NumberInput
                        value={localFilters.totalSpentRange[0]}
                        onChange={(_, value) =>
                          handleFilterChange("totalSpentRange", [
                            value,
                            localFilters.totalSpentRange[1],
                          ])
                        }
                        min={0}
                        max={localFilters.totalSpentRange[1]}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                      <NumberInput
                        value={localFilters.totalSpentRange[1]}
                        onChange={(_, value) =>
                          handleFilterChange("totalSpentRange", [
                            localFilters.totalSpentRange[0],
                            value,
                          ])
                        }
                        min={localFilters.totalSpentRange[0]}
                        max={500000}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </VStack>
                </FormControl>

                {/* Registration Date Range */}
                <FormControl>
                  <FormLabel>ช่วงเวลาการลงทะเบียน</FormLabel>
                  <Select
                    value={localFilters.registrationDateRange}
                    onChange={(e) =>
                      handleFilterChange("registrationDateRange", e.target.value)
                    }
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="today">วันนี้</option>
                    <option value="week">สัปดาห์นี้</option>
                    <option value="month">เดือนนี้</option>
                    <option value="last_month">เดือนที่แล้ว</option>
                    <option value="quarter">ไตรมาสนี้</option>
                    <option value="year">ปีนี้</option>
                  </Select>
                </FormControl>

                {/* Sort By */}
                <FormControl>
                  <FormLabel>เรียงตาม</FormLabel>
                  <Select
                    value={localFilters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  >
                    <option value="name">ชื่อ</option>
                    <option value="customerNumber">รหัสลูกค้า</option>
                    <option value="createdAt">วันที่ลงทะเบียน</option>
                    <option value="totalSpent">ยอดซื้อทั้งหมด</option>
                    <option value="lastPurchase">การซื้อล่าสุด</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Apply/Reset Buttons for Advanced */}
              <HStack justify="flex-end" spacing={3} pt={4}>
                <Button variant="ghost" onClick={handleReset} size="sm">
                  รีเซ็ตทั้งหมด
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={isLoading}
                  size="sm"
                >
                  ใช้ตัวกรอง
                </Button>
              </HStack>
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CustomerSearch;
export { defaultFilters as defaultCustomerFilters };