import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกอีเมลและรหัสผ่าน",
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Auth error:", error);
      return res.status(401).json({
        success: false,
        message:
          error.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        error: error.message,
      });
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        `
        *,
        branch:branches(*)
      `
      )
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลโปรไฟล์ผู้ใช้",
        error: profileError.message,
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: "บัญชีของคุณถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      });
    }

    res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (error: any) {
    console.error("API auth error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      error: error.message,
    });
  }
}
