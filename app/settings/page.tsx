"use client"

import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Pengaturan profil dan preferensi aplikasi</p>
          </div>

          {/* Placeholder content */}
          <div className="rounded-lg border bg-card p-6">
            <p className="text-center text-muted-foreground">Settings akan dibangun nanti</p>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}
