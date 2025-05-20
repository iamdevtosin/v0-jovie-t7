import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Briefcase, User } from "lucide-react"

export function TemplateShowcase() {
  return (
    <section id="templates" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Templates</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Professional templates for every need
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose from our collection of professionally designed templates for resumes, CVs, and portfolios.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl py-12">
          <Tabs defaultValue="resumes" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="resumes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumes
                </TabsTrigger>
                <TabsTrigger value="cvs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  CVs
                </TabsTrigger>
                <TabsTrigger value="portfolios" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Portfolios
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="resumes" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] bg-muted">
                        <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-b from-transparent to-background/90">
                          <div className="mt-auto">
                            <h3 className="text-lg font-semibold">Modern Resume {i}</h3>
                            <p className="text-sm text-muted-foreground">Clean and professional design</p>
                            <Button size="sm" className="mt-2">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline">View All Resume Templates</Button>
              </div>
            </TabsContent>
            <TabsContent value="cvs" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] bg-muted">
                        <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-b from-transparent to-background/90">
                          <div className="mt-auto">
                            <h3 className="text-lg font-semibold">Academic CV {i}</h3>
                            <p className="text-sm text-muted-foreground">Detailed and structured layout</p>
                            <Button size="sm" className="mt-2">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline">View All CV Templates</Button>
              </div>
            </TabsContent>
            <TabsContent value="portfolios" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] bg-muted">
                        <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-b from-transparent to-background/90">
                          <div className="mt-auto">
                            <h3 className="text-lg font-semibold">Creative Portfolio {i}</h3>
                            <p className="text-sm text-muted-foreground">Showcase your work with style</p>
                            <Button size="sm" className="mt-2">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline">View All Portfolio Templates</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
