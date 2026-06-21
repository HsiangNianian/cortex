import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/community/auth"
import { deleteAdmin } from "@/lib/community/d1"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { id } = await params
    const adminId = parseInt(id, 10)
    if (isNaN(adminId)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 })
    }

    // Prevent self-deletion
    if (adminId === admin.id) {
      return NextResponse.json({ error: "cannot delete yourself" }, { status: 400 })
    }

    await deleteAdmin(adminId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/admin/admins error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
