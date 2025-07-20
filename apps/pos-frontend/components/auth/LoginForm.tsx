import React, { useState } from "react";
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { TouchButton } from "../ui/TouchButton";
import { POSCard } from "../ui/POSCard";
import { POSLoginCredentials } from "@shopflow/types";
import { getLastUsername } from "../../lib/auth";

interface LoginFormProps {
  onLogin: (credentials: POSLoginCredentials) => Promise<boolean>;
  onSwitchToPin: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onSwitchToPin,
  isLoading,
  error,
}) => {
  const [username, setUsername] = useState(getLastUsername() || "");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");

  const inputBg = useColorModeValue("white", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.200");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }

    const credentials = {
      username: username.trim(),
      password: password.trim(),
      branchId: branch || undefined,
    };

    const success = await onLogin(credentials);
    if (success) {
      setPassword(""); // Clear password on success
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <POSCard variant="elevated" maxWidth="400px" mx="auto">
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <VStack spacing={2}>
          <Text fontSize="2xl" fontWeight="bold" color="pos.primary.600">
            POS Login
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Enter your credentials to access the POS system
          </Text>
        </VStack>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <VStack spacing={4} width="100%">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
              Username
            </FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              bg={inputBg}
              disabled={isLoading}
              autoComplete="username"
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
              Password
            </FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              bg={inputBg}
              disabled={isLoading}
              autoComplete="current-password"
              size="lg"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
              Branch (Optional)
            </FormLabel>
            <Select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Select branch (auto-detect if empty)"
              bg={inputBg}
              disabled={isLoading}
              size="lg"
            >
              <option value="branch-1">Main Store</option>
              <option value="branch-2">Branch Store</option>
            </Select>
          </FormControl>
        </VStack>

        <VStack spacing={3} width="100%">
          <TouchButton
            type="submit"
            variant="primary"
            size="lg"
            width="100%"
            loading={isLoading}
            disabled={!username.trim() || !password.trim()}
          >
            Sign In
          </TouchButton>

          <Divider />

          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Quick access?
            </Text>
            <TouchButton
              variant="secondary"
              size="sm"
              onClick={onSwitchToPin}
              disabled={isLoading}
            >
              Use PIN
            </TouchButton>
          </HStack>
        </VStack>

        <VStack spacing={1} pt={2}>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Demo Credentials:
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            admin/password • manager/password • cashier/password
          </Text>
        </VStack>
      </VStack>
    </POSCard>
  );
};
