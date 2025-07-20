import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  HStack,
  Text,
  Input,
  Alert,
  AlertIcon,
  SimpleGrid,
  useColorModeValue,
  FormControl,
  FormLabel,
  Divider,
} from "@chakra-ui/react";
import { TouchButton } from "../ui/TouchButton";
import { POSCard } from "../ui/POSCard";
import { POSPinCredentials } from "@shopflow/types";
import { getLastUsername } from "../../lib/auth";

interface PinEntryProps {
  onPinLogin: (credentials: POSPinCredentials) => Promise<boolean>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export const PinEntry: React.FC<PinEntryProps> = ({
  onPinLogin,
  onSwitchToLogin,
  isLoading,
  error,
}) => {
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState(getLastUsername() || "");
  const [showUsername, setShowUsername] = useState(!getLastUsername());
  const pinInputRef = useRef<HTMLInputElement>(null);

  const inputBg = useColorModeValue("white", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const buttonBg = useColorModeValue("gray.50", "gray.700");
  const buttonHoverBg = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, []);

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSubmit = async () => {
    if (!pin.trim() || !username.trim()) {
      return;
    }

    const credentials = {
      pin: pin.trim(),
      username: username.trim(),
    };

    const success = await onPinLogin(credentials);
    if (success) {
      setPin("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Backspace") {
      handleBackspace();
    } else if (/^\d$/.test(e.key)) {
      handlePinDigit(e.key);
    }
  };

  const pinDisplay = "●".repeat(pin.length) + "○".repeat(6 - pin.length);

  return (
    <POSCard variant="elevated" maxWidth="400px" mx="auto">
      <VStack spacing={6}>
        <VStack spacing={2}>
          <Text fontSize="2xl" fontWeight="bold" color="pos.primary.600">
            PIN Access
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Enter your PIN for quick access
          </Text>
        </VStack>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <VStack spacing={4} width="100%">
          {showUsername && (
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Username
              </FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                bg={inputBg}
                disabled={isLoading}
                size="lg"
              />
            </FormControl>
          )}

          {!showUsername && (
            <VStack spacing={2}>
              <Text fontSize="sm" color={labelColor}>
                Welcome back, {username}
              </Text>
              <TouchButton
                variant="secondary"
                size="sm"
                onClick={() => setShowUsername(true)}
                disabled={isLoading}
              >
                Different User?
              </TouchButton>
            </VStack>
          )}

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
              PIN
            </FormLabel>
            <VStack spacing={3}>
              <Input
                ref={pinInputRef}
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 6))}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit PIN"
                bg={inputBg}
                disabled={isLoading}
                size="lg"
                textAlign="center"
                fontSize="xl"
                letterSpacing="wide"
                maxLength={6}
              />

              <Text
                fontSize="2xl"
                fontFamily="monospace"
                color="pos.primary.600"
              >
                {pinDisplay}
              </Text>
            </VStack>
          </FormControl>

          {/* PIN Keypad */}
          <VStack spacing={3} width="100%">
            <Text fontSize="sm" color={labelColor}>
              Touch Keypad
            </Text>
            <SimpleGrid columns={3} spacing={2} width="100%">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <TouchButton
                  key={digit}
                  variant="secondary"
                  size="lg"
                  onClick={() => handlePinDigit(digit.toString())}
                  disabled={isLoading || pin.length >= 6}
                  bg={buttonBg}
                  _hover={{ bg: buttonHoverBg }}
                  height="60px"
                  fontSize="xl"
                  fontWeight="bold"
                >
                  {digit}
                </TouchButton>
              ))}
              <TouchButton
                variant="secondary"
                size="lg"
                onClick={handleClear}
                disabled={isLoading || pin.length === 0}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                height="60px"
                fontSize="sm"
                fontWeight="bold"
              >
                Clear
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="lg"
                onClick={() => handlePinDigit("0")}
                disabled={isLoading || pin.length >= 6}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                height="60px"
                fontSize="xl"
                fontWeight="bold"
              >
                0
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="lg"
                onClick={handleBackspace}
                disabled={isLoading || pin.length === 0}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                height="60px"
                fontSize="sm"
                fontWeight="bold"
              >
                ⌫
              </TouchButton>
            </SimpleGrid>
          </VStack>
        </VStack>

        <VStack spacing={3} width="100%">
          <TouchButton
            variant="primary"
            size="lg"
            width="100%"
            loading={isLoading}
            disabled={!pin.trim() || !username.trim() || pin.length < 4}
            onClick={handleSubmit}
          >
            Access POS
          </TouchButton>

          <Divider />

          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Need full login?
            </Text>
            <TouchButton
              variant="secondary"
              size="sm"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Use Password
            </TouchButton>
          </HStack>
        </VStack>

        <VStack spacing={1} pt={2}>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Demo PINs:
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            admin: 1234 • manager: 5678 • cashier: 9999
          </Text>
        </VStack>
      </VStack>
    </POSCard>
  );
};
