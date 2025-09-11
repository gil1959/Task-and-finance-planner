import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Shield, Smartphone, BarChart3, Clock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Prioritas Otomatis",
    description:
      "Algoritma cerdas mengurutkan tugas berdasarkan deadline, bobot, dan estimasi waktu untuk produktivitas maksimal.",
  },
  {
    icon: TrendingUp,
    title: "Analitik Keuangan",
    description:
      "Lacak pemasukan, pengeluaran, dan investasi dengan visualisasi yang mudah dipahami dan insight mendalam.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Terpadu",
    description:
      "Lihat semua metrik penting dalam satu tempat - produktivitas, keuangan, dan progress tugas secara real-time.",
  },
  {
    icon: Clock,
    title: "Manajemen Waktu",
    description: "Estimasi waktu tugas dan pelacakan progress membantu Anda mengelola waktu dengan lebih efektif.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Akses aplikasi dari perangkat apapun dengan antarmuka yang dioptimalkan untuk mobile dan desktop.",
  },
  {
    icon: Shield,
    title: "Data Aman",
    description: "Semua data Anda tersimpan dengan aman menggunakan enkripsi tingkat enterprise dan backup otomatis.",
  },
]

export function LandingFeatures({ id = "fitur" }: { id?: string }) {
  return (
    <section id={id} className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            Fitur Lengkap untuk <span className="text-primary">Produktivitas</span> Maksimal
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Kombinasi sempurna antara manajemen tugas yang cerdas dan pelacakan keuangan yang komprehensif dalam satu
            aplikasi yang mudah digunakan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
