"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { motion } from "framer-motion"
import { Mail, Save, Check, Send, Eye, EyeOff, AlertCircle, CheckCircle, Info } from "lucide-react"

const SMTP_FIELDS = [
  { key: "smtp_host",       label: "SMTP Host",                  placeholder: "smtp.gmail.com",      type: "text" },
  { key: "smtp_port",       label: "SMTP Port",                  placeholder: "587",                 type: "text" },
  { key: "smtp_user",       label: "Email Pengirim (SMTP User)", placeholder: "kamu@gmail.com",       type: "email" },
  { key: "smtp_pass",       label: "Password / App Password",    placeholder: "••••••••••••••••",    type: "password" },
  { key: "smtp_from_name",  label: "From Name",                  placeholder: "TenHal Bekerja",       type: "text" },
  { key: "smtp_from_email", label: "From Email",                 placeholder: "info@arlchoose.id",    type: "email" },
]

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [showPass, setShowPass] = useState(false)
  const [testTo, setTestTo] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    const token = getToken(); if (!token) return
    fetch("/api/admin/site-settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(json => { setSettings(json.data ?? {}); setLoading(false) })
  }, [])

  async function handleSave(key: string) {
    const token = getToken(); if (!token) return
    setSaving(key)
    try {
      await fetch(`/api/admin/site-settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: settings[key] ?? "" }),
      })
      setSaved(prev => new Set([...prev, key]))
      setTimeout(() => setSaved(prev => { const n = new Set(prev); n.delete(key); return n }), 2500)
    } finally { setSaving(null) }
  }

  async function handleSaveAll() {
    for (const f of SMTP_FIELDS) await handleSave(f.key)
  }

  async function handleTest() {
    if (!testTo) return
    const token = getToken(); if (!token) return
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: testTo }),
      })
      const json = await res.json()
      setTestResult({ ok: json.success, message: json.message || (json.success ? "Email berhasil dikirim!" : "Gagal") })
    } catch { setTestResult({ ok: false, message: "Terjadi kesalahan koneksi" }) }
    finally { setTesting(false) }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-2xl">
      <div className="h-8 bg-slate-200 rounded w-40" />
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-11 bg-slate-200 rounded-lg" />)}
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Pengaturan SMTP</h1>
        <p className="text-slate-400 text-sm mt-0.5">Konfigurasi server email untuk pengiriman</p>
      </div>

      {/* Panduan */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm"><Info className="w-4 h-4 flex-shrink-0" /> Panduan Setup Brevo</div>
        <div className="text-xs text-slate-500 space-y-1">
          <p>Host = <span className="font-mono bg-slate-100 px-1 rounded">smtp-relay.brevo.com</span> · Port = <span className="font-mono bg-slate-100 px-1 rounded">587</span> · User = email Brevo · Pass = API Key Brevo.</p>
          <p>Dapatkan API Key di: <a href="https://app.brevo.com/settings/keys/smtp" target="_blank" className="text-blue-600 underline">app.brevo.com → Settings → SMTP & API</a></p>
        </div>
      </div>

      {/* Info variabel email otomatis */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm"><Info className="w-4 h-4 flex-shrink-0" /> Email Otomatis</div>
        <p className="text-xs text-slate-500">Semua email otomatis (konfirmasi pendaftar, notifikasi admin, kelas bahasa) menggunakan nilai dari pengaturan ini:</p>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          {[
            ["From Name", "nama pengirim yang muncul di inbox penerima, misal: TenHal Bekerja"],
            ["From Email", "alamat pengirim yang terlihat penerima, misal: info@arlchoose.id"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 flex-shrink-0">{key}</span>
              <span className="text-slate-400 pt-0.5">→ {desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SMTP Config */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#1a3c6e]" /><h2 className="text-sm font-semibold text-[#1a3c6e]">Konfigurasi SMTP</h2></div>
          <button onClick={handleSaveAll} disabled={saving !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-lg transition disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> Simpan Semua
          </button>
        </div>
        <div className="p-5 space-y-4">
          {SMTP_FIELDS.map(field => {
            const val = settings[field.key] ?? ""
            const isSaving = saving === field.key
            const isSaved = saved.has(field.key)
            const isPass = field.type === "password"
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{field.label}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type={isPass && !showPass ? "password" : "text"} value={val}
                      onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition pr-10" />
                    {isPass && (
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <button onClick={() => handleSave(field.key)} disabled={isSaving}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 disabled:opacity-40 ${isSaved ? "bg-green-500 text-white" : "bg-[#1a3c6e] hover:bg-[#15336b] text-white"}`}>
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : isSaving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isSaved ? "Tersimpan" : isSaving ? "..." : "Simpan"}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Test */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#1a3c6e]" /><h2 className="text-sm font-semibold text-[#1a3c6e]">Test Kirim Email</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-400">Kirim email test untuk memastikan konfigurasi SMTP sudah benar.</p>
          <div className="flex gap-2">
            <input type="email" value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="Kirim ke email..."
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            <button onClick={handleTest} disabled={testing || !testTo}
              className="flex-shrink-0 px-4 py-2.5 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              {testing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">{testing ? "Mengirim..." : "Kirim Test"}</span>
            </button>
          </div>
          {testResult && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${testResult.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {testResult.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {testResult.message}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}