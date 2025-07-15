import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  ButtonGroup,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Box,
} from "@chakra-ui/react";
import { Product } from "@shopflow/types";

export interface ChakraProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  loading?: boolean;
  error?: string;
}

export const ChakraProductTable: React.FC<ChakraProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false,
  error,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Spinner size="lg" color="brand.500" />
        <Text ml={4}>กำลังโหลดข้อมูล...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!products.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">ไม่พบข้อมูลสินค้า</Text>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>รหัสสินค้า</Th>
            <Th>ชื่อสินค้า</Th>
            <Th isNumeric>ราคา</Th>
            <Th>หมวดหมู่</Th>
            <Th isNumeric>จำนวน</Th>
            <Th>สถานะ</Th>
            {(onEdit || onDelete) && <Th textAlign="center">การจัดการ</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.id}>
              <Td>
                <Text fontSize="sm" fontFamily="mono" color="gray.600">
                  {product.id}
                </Text>
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="medium">{product.name}</Text>
                  {(product as any).description && (
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {(product as any).description}
                    </Text>
                  )}
                </Box>
              </Td>
              <Td isNumeric>
                <Text fontWeight="medium">
                  ฿{product.price.toLocaleString("th-TH")}
                </Text>
              </Td>
              <Td>
                <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                  {(product as any).category || "ไม่ระบุ"}
                </Badge>
              </Td>
              <Td isNumeric>
                <Text
                  color={
                    (product as any).stock < 20 ? "warning.500" : "gray.700"
                  }
                  fontWeight={(product as any).stock < 20 ? "bold" : "normal"}
                >
                  {(product as any).stock || 0}
                </Text>
              </Td>
              <Td>
                <Badge
                  colorScheme={(product as any).isActive ? "success" : "gray"}
                  variant="subtle"
                  borderRadius="full"
                >
                  {(product as any).isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Badge>
              </Td>
              {(onEdit || onDelete) && (
                <Td>
                  <ButtonGroup size="sm" spacing={2}>
                    {onEdit && (
                      <Button
                        variant="outline"
                        colorScheme="blue"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        แก้ไข
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        colorScheme="red"
                        size="sm"
                        onClick={() => onDelete(product)}
                      >
                        ลบ
                      </Button>
                    )}
                  </ButtonGroup>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
