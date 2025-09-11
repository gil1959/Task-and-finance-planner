import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function LandingCTA({ id = "gabung" }: { id?: string }) {
  return (
    <section id={id} className="py-20 lg:py-32 bg-gradient-to-r from-primary via-primary to-accent">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
              <span className="text-primary-foreground/90 font-medium">Mulai Hari Ini</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground text-balance">
              Siap Meningkatkan Produktivitas dan Kontrol Keuangan?
            </h2>
            <p className="text-xl text-primary-foreground/90 text-pretty leading-relaxed max-w-2xl mx-auto">
              Bergabung dengan ribuan pengguna yang sudah merasakan manfaat mengelola tugas dan keuangan dalam satu
              platform terpadu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
            >
              <Link href="/register">
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/login">Sudah Punya Akun?</Link>
            </Button>
          </div>

          <div className="pt-8 text-primary-foreground/70 text-sm">
            ✓ Gratis selamanya untuk fitur dasar • ✓ Tanpa kartu kredit • ✓ Setup dalam 2 menit
          </div>
        </div>
      </div>
    </section>
  )
}
