"use client"

import type React from "react"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAppStore((state) => state.checkAuth)

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}
