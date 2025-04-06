import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, MessageSquare, ShieldCheck, User } from "lucide-react"
import { SignInButton, SignUpButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>InvestSmart AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <Button asChild>
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            <SignedOut>
              <Button asChild variant="outline">
                  <Link href="/sign-up">
                    Sign Up
                  </Link>
                </Button>
              </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
                Dashboard
              </Link>
              <UserButton showName/>
            </SignedIn>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Smart Investment Guidance Powered by AI
                  </h1>
                  <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Get personalized investment recommendations based on your goals, risk tolerance, and financial
                    situation.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SignedOut>
                    <Button asChild size="lg">
                      <Link href="/questionnaire">
                        Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </SignedOut>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 lg:flex lg:justify-center">
                <div className="w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-muted to-background flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <BarChart3 className="h-16 w-16 mx-auto text-primary" />
                    <p className="text-lg font-medium">Interactive Investment Dashboard</p>
                    <p className="text-sm text-muted-foreground">Visualize your personalized investment strategy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform guides you through a personalized investment journey
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle>Answer Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Complete our dynamic questionnaire to assess your risk tolerance, goals, and financial situation.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI analyzes your responses to create a personalized investment profile and recommendations.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Get Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive tailored investment advice and ask follow-up questions through our AI chat interface.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Key Features</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to make informed investment decisions
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card>
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Personalized Guidance</CardTitle>
                  <CardDescription>Tailored investment advice based on your unique profile</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Visual Dashboard</CardTitle>
                  <CardDescription>Interactive charts to visualize your recommended asset allocation</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AI Chat Assistant</CardTitle>
                  <CardDescription>Ask follow-up questions and get real-time answers</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} InvestSmart AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

