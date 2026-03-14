import EmailLayout from "@/components/admin/email/EmailLayout"
import { Send } from "lucide-react"

export default function SentPage() {
  return (
    <EmailLayout
      direction="out"
      status="sent"
      title="Terkirim"
      emptyText="Belum ada email terkirim"
      emptyIcon={<Send className="w-16 h-16" />}
    />
  )
}