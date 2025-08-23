import React, { useCallback, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
  Center,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";
import { useImageUpload, UploadProgress } from "../lib/hooks/useImageUpload";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const toast = useToast();
  const {
    uploadFiles,
    deleteFiles,
    uploadProgress,
    resetProgress,
    removeProgressItem,
  } = useImageUpload();

  const borderColor = useColorModeValue("gray.300", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const dragBgColor = useColorModeValue("blue.50", "blue.900");

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (disabled) return;

      // Validate file types and sizes
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      files.forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} - ประเภทไฟล์ไม่ถูกต้อง`);
        } else if (file.size > maxFileSize) {
          invalidFiles.push(`${file.name} - ขนาดไฟล์เกิน 5MB`);
        } else {
          validFiles.push(file);
        }
      });

      // Show error for invalid files
      if (invalidFiles.length > 0) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: invalidFiles.join(", "),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      const remainingSlots = maxImages - images.length;
      const filesToUpload = validFiles.slice(0, remainingSlots);

      if (filesToUpload.length < validFiles.length) {
        const skippedCount = validFiles.length - filesToUpload.length;
        toast({
          title: "เกินจำนวนที่อนุญาต",
          description: `สามารถอัพโหลดได้สูงสุด ${maxImages} รูปภาพ เลือกเฉพาะ ${filesToUpload.length} รูปแรก (ข้าม ${skippedCount} รูป)`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      if (filesToUpload.length > 0) {
        uploadFiles(filesToUpload, {
          onSuccess: (urls: string[]) => {
            onImagesChange([...images, ...urls]);
            resetProgress();
            toast({
              title: "อัพโหลดสำเร็จ",
              description: `อัพโหลดรูปภาพ ${urls.length} รูปเรียบร้อยแล้ว`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          },
          onError: (error: string) => {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: `ไม่สามารถอัพโหลดได้: ${error}`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          },
        });
      }
    },
    [
      images,
      maxImages,
      disabled,
      uploadFiles,
      onImagesChange,
      resetProgress,
      toast,
    ]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [disabled, handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        handleFileUpload(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFileUpload]
  );

  const handleRemoveImage = useCallback(
    (imageUrl: string, index: number) => {
      // Remove from UI immediately
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      // Delete from storage with error handling
      deleteFiles([imageUrl]).catch((error) => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบรูปภาพได้: ${error}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        // Restore the image in UI if deletion failed
        onImagesChange([...newImages, imageUrl]);
      });
    },
    [images, onImagesChange, deleteFiles]
  );

  const handleRemoveProgressItem = useCallback(
    (index: number) => {
      removeProgressItem(index);
    },
    [removeProgressItem]
  );

  const canUploadMore = images.length < maxImages && !disabled;

  return (
    <VStack spacing={4} align="stretch">
      {/* Upload Area */}
      {canUploadMore && (
        <Box
          borderWidth={2}
          borderStyle="dashed"
          borderColor={isDragOver ? "blue.400" : borderColor}
          borderRadius="lg"
          bg={isDragOver ? dragBgColor : bgColor}
          p={8}
          textAlign="center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          transition="all 0.2s"
          cursor={disabled ? "not-allowed" : "pointer"}
          opacity={disabled ? 0.6 : 1}
        >
          <VStack spacing={4}>
            <Center
              w={16}
              h={16}
              borderRadius="full"
              bg={isDragOver ? "blue.100" : "gray.100"}
              color={isDragOver ? "blue.500" : "gray.500"}
            >
              <FiUpload size={24} />
            </Center>

            <VStack spacing={2}>
              <Text fontWeight="semibold" color="gray.700">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </Text>
              <Text fontSize="sm" color="gray.500">
                รองรับไฟล์ JPG, PNG, WebP (สูงสุด 5MB)
              </Text>
              <Text fontSize="xs" color="gray.400">
                {images.length}/{maxImages} รูปภาพ
              </Text>
            </VStack>

            <Button
              leftIcon={<FiImage />}
              size="sm"
              variant="outline"
              as="label"
              cursor="pointer"
              disabled={disabled}
            >
              เลือกไฟล์
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
                disabled={disabled}
              />
            </Button>
          </VStack>
        </Box>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="semibold">
            กำลังอัพโหลด...
          </Text>
          {uploadProgress.map((progress: UploadProgress, index: number) => (
            <UploadProgressItem
              key={index}
              progress={progress}
              onRemove={() => handleRemoveProgressItem(index)}
            />
          ))}
        </VStack>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold">
            รูปภาพที่อัพโหลดแล้ว ({images.length})
          </Text>
          <Flex wrap="wrap" gap={3}>
            {images.map((imageUrl, index) => (
              <ImagePreview
                key={index}
                imageUrl={imageUrl}
                onRemove={() => handleRemoveImage(imageUrl, index)}
                disabled={disabled}
              />
            ))}
          </Flex>
        </VStack>
      )}

      {/* Upload Limit Warning */}
      {images.length >= maxImages && (
        <Alert status="info" size="sm">
          <AlertIcon />
          <AlertDescription>อัพโหลดครบ {maxImages} รูปภาพแล้ว</AlertDescription>
        </Alert>
      )}
    </VStack>
  );
}

// Upload Progress Item Component
interface UploadProgressItemProps {
  progress: UploadProgress;
  onRemove: () => void;
}

function UploadProgressItem({ progress, onRemove }: UploadProgressItemProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case "completed":
        return "green";
      case "error":
        return "red";
      case "uploading":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Box p={3} borderWidth={1} borderRadius="md" bg="white">
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
          {progress.file.name}
        </Text>
        <IconButton
          icon={<FiX />}
          size="xs"
          variant="ghost"
          aria-label="Remove"
          onClick={onRemove}
        />
      </HStack>

      <Progress
        value={progress.progress}
        colorScheme={getStatusColor()}
        size="sm"
        mb={1}
      />

      <HStack justify="space-between">
        <Text fontSize="xs" color="gray.500">
          {progress.status === "error" ? progress.error : progress.status}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {Math.round(progress.file.size / 1024)} KB
        </Text>
      </HStack>
    </Box>
  );
}

// Image Preview Component
interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  disabled?: boolean;
}

function ImagePreview({ imageUrl, onRemove, disabled }: ImagePreviewProps) {
  return (
    <Box position="relative" display="inline-block">
      <Image
        src={imageUrl}
        alt="Product image"
        w={24}
        h={24}
        objectFit="cover"
        borderRadius="md"
        border="1px"
        borderColor="gray.200"
      />
      {!disabled && (
        <IconButton
          icon={<FiX />}
          size="xs"
          colorScheme="red"
          position="absolute"
          top={-2}
          right={-2}
          borderRadius="full"
          aria-label="Remove image"
          onClick={onRemove}
        />
      )}
    </Box>
  );
}
