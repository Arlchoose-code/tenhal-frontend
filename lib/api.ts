const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

// ============================================
// SERVER SIDE — untuk Server Components & ISR
// ============================================
export async function fetchPublic<T>(
  path: string,
  tags?: string[],
  revalidate?: number
): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/public/${path}`, {
    next: {
      tags: tags ?? [],
      revalidate: revalidate ?? 3600,
    },
  })

  if (!res.ok) throw new Error(`Fetch failed: ${path}`)

  const json = await res.json()
  return json.data
}

// ============================================
// CLIENT SIDE — untuk form submit, interaksi
// ============================================
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/${path}`)
  if (!res.ok) throw new Error(`GET failed: ${path}`)
  const json = await res.json()
  return json.data
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    body: formData,
  })
  return res.json()
}

export async function apiPut<T>(
  path: string,
  body: unknown
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiPutForm<T>(
  path: string,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "PUT",
    body: formData,
  })
  return res.json()
}

export async function apiPatch<T>(
  path: string,
  body: unknown
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiDelete<T>(
  path: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/${path}`, {
    method: "DELETE",
  })
  return res.json()
}

// ============================================
// ADMIN — attach Authorization header
// ============================================
export async function adminGet<T>(
  path: string,
  token: string
): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/admin/login"
    throw new Error("Unauthorized")
  }
  if (!res.ok) throw new Error(`Admin GET failed: ${path}`)
  const json = await res.json()
  return json.data
}

export async function adminPost<T>(
  path: string,
  body: unknown,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function adminPostForm<T>(
  path: string,
  formData: FormData,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return res.json()
}

export async function adminPut<T>(
  path: string,
  body: unknown,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function adminPutForm<T>(
  path: string,
  formData: FormData,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return res.json()
}

export async function adminPatch<T>(
  path: string,
  body: unknown,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function adminDelete<T>(
  path: string,
  token: string
): Promise<{ success: boolean; message: string; data?: T }> {
  const res = await fetch(`/api/admin/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}