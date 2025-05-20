import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What our users say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from professionals who have transformed their job search with Jovie.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <div className="flex items-center gap-0.5">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"}`}
                        />
                      ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{testimonial.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "The AI suggestions helped me highlight achievements I would have otherwise overlooked. I received interview calls from 3 companies within a week!",
  },
  {
    name: "Michael Chen",
    rating: 5,
    comment:
      "As a designer, I needed a portfolio that showcased my work effectively. Jovie made it incredibly easy to create a professional portfolio that impressed clients.",
  },
  {
    name: "Emily Rodriguez",
    rating: 4,
    comment:
      "The templates are modern and professional. The AI content suggestions saved me hours of writing and editing. Highly recommended!",
  },
  {
    name: "David Kim",
    rating: 5,
    comment:
      "After struggling with my resume for weeks, I tried Jovie and had a polished, ATS-friendly resume in under an hour. Game changer!",
  },
  {
    name: "Priya Patel",
    rating: 4,
    comment:
      "The ability to switch between different templates without re-entering my information was incredibly helpful. The final PDF looked very professional.",
  },
  {
    name: "James Wilson",
    rating: 5,
    comment:
      "As someone changing careers, I wasn't sure how to present my transferable skills. The AI guidance helped me create a resume that highlighted my relevant experience.",
  },
]
