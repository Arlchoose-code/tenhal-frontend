"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  itemLabel?: string
  onPageChange: (page: number) => void
  /** "admin" = navy style, "public" = blue style. Default: "public" */
  variant?: "admin" | "public"
}

function getPages(cur: number, tp: number): (number | "...")[] {
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | "...")[] = [1]
  if (cur > 3) pages.push("...")
  for (let i = Math.max(2, cur - 1); i <= Math.min(tp - 1, cur + 1); i++) pages.push(i)
  if (cur < tp - 2) pages.push("...")
  pages.push(tp)
  return pages
}

export default function Pagination({
  page, totalPages, total, itemLabel = "item", onPageChange, variant = "public"
}: PaginationProps) {
  if (totalPages <= 1) return null

  const isAdmin = variant === "admin"
  const activeClass = isAdmin
    ? "bg-[#1a3c6e] text-white shadow-md shadow-[#1a3c6e]/20"
    : "bg-blue-600 text-white shadow-lg shadow-blue-200"
  const hoverClass = isAdmin
    ? "hover:border-[#1a3c6e] hover:text-[#1a3c6e]"
    : "hover:border-blue-400 hover:text-blue-600"
  const btnBase = `flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all ${hoverClass}`

  const pages = getPages(page, totalPages)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        {/* prev */}
        <motion.button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          whileHover={{ scale: page <= 1 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-9 h-9 ${btnBase}`}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* pages */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-300 text-sm">…</span>
          ) : (
            <motion.button
              key={p}
              onClick={() => onPageChange(p as number)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${page === p ? activeClass : `border-2 border-slate-200 text-slate-500 ${hoverClass}`}`}>
              {p}
            </motion.button>
          )
        )}

        {/* next */}
        <motion.button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          whileHover={{ scale: page >= totalPages ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-9 h-9 ${btnBase}`}>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* info */}
      <p className="text-xs text-slate-400">
        Halaman <span className="font-bold text-slate-600">{page}</span> dari{" "}
        <span className="font-bold text-slate-600">{totalPages}</span>
        {total !== undefined && (
          <> · <span className="font-bold text-slate-600">{total}</span> {itemLabel}</>
        )}
      </p>
    </div>
  )
}