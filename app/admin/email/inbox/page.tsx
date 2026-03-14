import EmailLayout from "@/components/admin/email/EmailLayout"
import { Inbox } from "lucide-react"

export default function InboxPage() {
  return (
    <EmailLayout
      direction="in"
      title="Kotak Masuk"
      emptyText="Kotak masuk kosong"
      emptyIcon={<Inbox className="w-16 h-16" />}
    />
  )
}