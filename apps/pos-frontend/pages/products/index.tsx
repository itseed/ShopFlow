import { useState } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiPlus, FiTag } from "react-icons/fi";
import { POSLayout } from "../../components";
import { mockProducts } from "../../lib/sales";

const getStatusColor = (stock: number, min = 1) => {
  return stock <= min ? "red" : "green";
};

const ProductsPage = () => {
  const [products] = useState(mockProducts);

  return (
    <POSLayout title="สินค้า">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">สินค้า</Heading>
          <HStack>
            <Button colorScheme="blue" leftIcon={<Icon as={FiPlus} />}>เพิ่มสินค้า</Button>
            <Button variant="outline" leftIcon={<Icon as={FiTag} />}>หมวดหมู่</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack>
                <Text>จำนวนสินค้า</Text>
                <Heading size="md">{products.length}</Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>ชื่อสินค้า</Th>
                  <Th>หมวดหมู่</Th>
                  <Th isNumeric>ราคา</Th>
                  <Th isNumeric>สต็อก</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.name}</Td>
                    <Td>{p.category}</Td>
                    <Td isNumeric>{p.price.toFixed(2)}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={getStatusColor(p.stock)}>{p.stock}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </POSLayout>
  );
};

export default ProductsPage;
