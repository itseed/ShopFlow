import { supabase } from "../supabase";

export class StorageService {
  private static readonly BUCKET_NAME = "product-images";

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(file: File, path?: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[], path?: string): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadFile(file, path));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Multiple upload error:", error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const path = this.extractPathFromUrl(url);
      if (!path) return false;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(urls: string[]): Promise<boolean[]> {
    try {
      const deletePromises = urls.map((url) => this.deleteFile(url));
      return await Promise.all(deletePromises);
    } catch (error) {
      console.error("Multiple delete error:", error);
      throw error;
    }
  }

  /**
   * Extract file path from Supabase Storage URL
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split("/");
      const bucketIndex = pathSegments.findIndex(
        (segment) => segment === this.BUCKET_NAME
      );

      if (bucketIndex === -1) return null;

      return pathSegments.slice(bucketIndex + 1).join("/");
    } catch (error) {
      console.error("URL parsing error:", error);
      return null;
    }
  }

  /**
   * Check if storage bucket exists and is accessible
   */
  static async checkBucketAccess(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(
        this.BUCKET_NAME
      );
      return !error && !!data;
    } catch (error) {
      console.error("Bucket access check failed:", error);
      return false;
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(url: string) {
    try {
      const path = this.extractPathFromUrl(url);
      if (!path) return null;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path.split("/").slice(0, -1).join("/"));

      if (error) throw error;

      const fileName = path.split("/").pop();
      return data.find((file: { name: string }) => file.name === fileName);
    } catch (error) {
      console.error("Get file info error:", error);
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)",
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPG, PNG, WebP)",
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple files
   */
  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length > 5) {
      errors.push("สามารถอัพโหลดได้สูงสุด 5 ไฟล์");
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        errors.push(`ไฟล์ที่ ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
