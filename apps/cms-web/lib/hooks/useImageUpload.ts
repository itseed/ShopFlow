import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { StorageService } from "../services/storageService";

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const toast = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Validate files first
      const validation = StorageService.validateFiles(files);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // Initialize progress tracking
      const progressItems: UploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));
      setUploadProgress(progressItems);

      // Upload files one by one to track progress
      const results: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Update status to uploading
          setUploadProgress((prev) =>
            prev.map((item, index) =>
              index === i
                ? { ...item, status: "uploading", progress: 50 }
                : item
            )
          );

          // Upload file
          const url = await StorageService.uploadFile(file, "products");
          results.push(url);

          // Update status to completed
          setUploadProgress((prev) =>
            prev.map((item, index) =>
              index === i
                ? { ...item, status: "completed", progress: 100, url }
                : item
            )
          );
        } catch (error) {
          // Update status to error
          setUploadProgress((prev) =>
            prev.map((item, index) =>
              index === i
                ? {
                    ...item,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : item
            )
          );
          throw error;
        }
      }

      return results;
    },
    onSuccess: (urls) => {
      toast({
        title: "อัพโหลดสำเร็จ",
        description: `อัพโหลดรูปภาพ ${urls.length} ไฟล์เรียบร้อยแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: StorageService.deleteFiles,
    onSuccess: () => {
      toast({
        title: "ลบรูปภาพสำเร็จ",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาดในการลบรูปภาพ",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const resetProgress = () => {
    setUploadProgress([]);
  };

  const removeProgressItem = (fileIndex: number) => {
    setUploadProgress((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  return {
    uploadFiles: uploadMutation.mutate,
    deleteFiles: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadProgress,
    resetProgress,
    removeProgressItem,
    error: uploadMutation.error,
  };
}

export function useSingleImageUpload() {
  const toast = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const validation = StorageService.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return await StorageService.uploadFile(file, "products");
    },
    onSuccess: () => {
      toast({
        title: "อัพโหลดสำเร็จ",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return {
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    data: uploadMutation.data,
    error: uploadMutation.error,
  };
}
