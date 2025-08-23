import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Container,
  Text,
  Link,
} from "@chakra-ui/react";
import { useAuth } from "../../lib/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message === "Invalid login credentials") {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else if (error.message === "Email not confirmed") {
          setError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
        } else {
          setError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
        return;
      }

      // Redirect to dashboard on success
      const redirectTo = (router.query.redirect as string) || "/";
      router.push(redirectTo);
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      // Error is already displayed to the user via setError
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="lg" color="gray.900">
            เข้าสู่ระบบ ShopFlow CMS
          </Heading>
          <Text mt={2} color="gray.600">
            จัดการร้านค้าของคุณได้อย่างง่ายดาย
          </Text>
        </Box>

        <Card w="full">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel>อีเมล</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="กรอกอีเมลของคุณ"
                    autoComplete="email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    autoComplete="current-password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                  loadingText="กำลังเข้าสู่ระบบ..."
                  size="lg"
                >
                  เข้าสู่ระบบ
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Box textAlign="center">
          <Text color="gray.600" fontSize="sm">
            หากมีปัญหาในการเข้าสู่ระบบ{" "}
            <Link color="blue.500" href="mailto:support@shopflow.com">
              ติดต่อผู้ดูแลระบบ
            </Link>
          </Text>
        </Box>

        {/* Demo credentials for development */}
        {process.env.NODE_ENV === "development" && (
          <Card w="full" bg="yellow.50" borderColor="yellow.200">
            <CardBody>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                🚀 Demo Login (Development Only)
              </Text>
              <Text fontSize="xs" color="gray.600">
                Email: admin@shopflow.demo
                <br />
                Password: demo123456
              </Text>
              <Button
                size="sm"
                colorScheme="yellow"
                variant="outline"
                mt={2}
                onClick={() => {
                  setEmail("admin@shopflow.demo");
                  setPassword("demo123456");
                }}
              >
                ใช้ข้อมูล Demo
              </Button>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}

// No authentication wrapper needed for sign-in page
SignInPage.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};
