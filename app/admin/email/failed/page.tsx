import EmailLayout from "@/components/admin/email/EmailLayout"
import { AlertCircle } from "lucide-react"

export default function FailedPage() {
  return (
    <EmailLayout
      direction="out"
      status="failed"
      title="Gagal Terkirim"
      emptyText="Tidak ada email yang gagal"
      emptyIcon={<AlertCircle className="w-16 h-16" />}
    />
  )
}