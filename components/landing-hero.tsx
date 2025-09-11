import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, BarChart3, Calendar, Wallet } from "lucide-react"
import Link from "next/link"

export function LandingHero({ id = "home" }: { id?: string }) {
  return (
    <section id={id} className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Kelola Tugas dan <span className="text-primary">Keuangan</span> dengan Mudah
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Aplikasi all-in-one untuk mengelola tugas dengan prioritas otomatis dan melacak keuangan pribadi.
                Tingkatkan produktivitas dan kontrol finansial Anda dalam satu platform.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              {[
                "Prioritas tugas otomatis berdasarkan deadline dan bobot",
                "Pelacakan keuangan lengkap (pemasukan, pengeluaran, investasi)",
                "Dashboard analitik untuk insight produktivitas dan finansial",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/register">
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl shadow-2xl border p-6 lg:p-8">
              {/* Mock Dashboard Preview */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Dashboard</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium">Tugas Aktif</div>
                    <div className="text-2xl font-bold text-primary">12</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <BarChart3 className="h-6 w-6 text-accent mx-auto mb-2" />
                    <div className="text-sm font-medium">Produktivitas</div>
                    <div className="text-2xl font-bold text-accent">85%</div>
                  </div>
                  <div className="bg-chart-3/20 rounded-lg p-4 text-center">
                    <Wallet className="h-6 w-6 text-chart-3 mx-auto mb-2" />
                    <div className="text-sm font-medium">Saldo</div>
                    <div className="text-2xl font-bold text-chart-3">+15M</div>
                  </div>
                </div>

                {/* Task List Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Tugas Prioritas Tinggi</h4>
                  {[
                    { title: "Selesaikan laporan bulanan", priority: "Tinggi", score: 95 },
                    { title: "Review proposal klien", priority: "Sedang", score: 78 },
                    { title: "Persiapan presentasi", priority: "Tinggi", score: 92 },
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">Prioritas: {task.priority}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{task.score}</div>
                        <div className="text-xs text-muted-foreground">Skor</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
