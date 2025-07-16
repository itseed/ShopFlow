import { useState } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { POSLayout } from "../../components";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <POSLayout title="ตั้งค่า">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">การตั้งค่า</Heading>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>ชื่อร้านค้า</FormLabel>
                <Input defaultValue="ShopFlow" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">โหมดพัฒนา</FormLabel>
                <Switch />
              </FormControl>
              <HStack justify="flex-end">
                <Button colorScheme="blue" isLoading={loading} onClick={handleSave}>
                  บันทึก
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </POSLayout>
  );
};

export default SettingsPage;
