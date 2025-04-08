"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, BookOpen, ExternalLink, Clock, ArrowRight } from "lucide-react"

type LessonStatus = "completed" | "in-progress" | "not-started"

type Lesson = {
  id: string
  title: string
  description: string
  status: LessonStatus
  duration: string
  source: "external" | "ai-generated"
  url?: string
  content?: string
}

type Track = {
  id: string
  title: string
  description: string
  progress: number
  lessons: Lesson[]
}

export default function LearningTab() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "beginner",
      title: "Investing Fundamentals",
      description: "Essential concepts for new investors",
      progress: 40,
      lessons: [
        {
          id: "b1",
          title: "What is Investing?",
          description: "An introduction to the concept of investing and why it's important",
          status: "completed",
          duration: "5 min",
          source: "ai-generated",
          content:
            "Investing is the act of allocating resources, usually money, with the expectation of generating income or profit over time. Unlike saving, which involves putting money aside for future use with minimal risk, investing involves putting your money to work with some level of risk in the hopes of growing your wealth.\n\nWhy invest? The primary reason is to build wealth over time. While savings accounts offer security, they typically provide low interest rates that may not keep pace with inflation. Investing, on the other hand, offers the potential for higher returns that can help you achieve long-term financial goals like retirement, buying a home, or funding education.\n\nCommon investment vehicles include stocks, bonds, mutual funds, ETFs (Exchange-Traded Funds), real estate, and more. Each comes with its own risk-reward profile, and the right mix depends on your financial goals, time horizon, and risk tolerance.",
        },
        {
          id: "b2",
          title: "Understanding Risk and Return",
          description: "Learn about the relationship between risk and potential returns",
          status: "completed",
          duration: "8 min",
          source: "external",
          url: "https://www.investopedia.com/terms/r/riskreturntradeoff.asp",
        },
        {
          id: "b3",
          title: "Asset Classes Explained",
          description: "Overview of stocks, bonds, cash, and alternative investments",
          status: "in-progress",
          duration: "10 min",
          source: "ai-generated",
          content:
            "Asset classes are categories of investments that have similar characteristics and behave similarly in the marketplace. Understanding the major asset classes is fundamental to building a diversified investment portfolio.\n\nThe main asset classes include:\n\n1. Stocks (Equities): Represent ownership in a company. Stocks offer the potential for high returns but come with higher volatility.\n\n2. Bonds (Fixed Income): Essentially loans to governments or corporations that pay interest. Bonds typically offer lower returns than stocks but with less volatility.\n\n3. Cash and Cash Equivalents: Includes savings accounts, certificates of deposit (CDs), money market accounts, and Treasury bills. These are the safest investments but offer the lowest returns.\n\n4. Alternative Investments: Include real estate, commodities, private equity, hedge funds, and cryptocurrencies. These often have different risk-return profiles compared to traditional assets.",
        },
        {
          id: "b4",
          title: "Building Your First Portfolio",
          description: "How to create a balanced investment portfolio as a beginner",
          status: "not-started",
          duration: "12 min",
          source: "external",
          url: "https://www.nerdwallet.com/article/investing/how-to-build-an-investment-portfolio",
        },
        {
          id: "b5",
          title: "Investment Accounts 101",
          description: "Different types of investment accounts and their tax implications",
          status: "not-started",
          duration: "7 min",
          source: "ai-generated",
        },
      ],
    },
    {
      id: "intermediate",
      title: "Intermediate Strategies",
      description: "More advanced concepts for experienced investors",
      progress: 10,
      lessons: [
        {
          id: "i1",
          title: "Fundamental Analysis",
          description: "How to evaluate companies using financial statements",
          status: "completed",
          duration: "15 min",
          source: "external",
          url: "https://www.investopedia.com/terms/f/fundamentalanalysis.asp",
        },
        {
          id: "i2",
          title: "Technical Analysis",
          description: "Using charts and patterns to make investment decisions",
          status: "in-progress",
          duration: "12 min",
          source: "ai-generated",
          content:
            "Technical analysis is a trading discipline that evaluates investments and identifies trading opportunities by analyzing statistical trends gathered from trading activity, such as price movement and volume. Unlike fundamental analysis, which attempts to evaluate a security's value based on business results such as sales and earnings, technical analysis focuses on the study of price and volume.\n\nTechnical analysts use various charts and patterns to identify potential entry and exit points for trades. Common technical indicators include moving averages, relative strength index (RSI), MACD (Moving Average Convergence Divergence), and Bollinger Bands.",
        },
        {
          id: "i3",
          title: "Portfolio Rebalancing",
          description: "When and how to rebalance your investment portfolio",
          status: "not-started",
          duration: "8 min",
          source: "external",
          url: "https://www.morningstar.com/articles/1075177/a-guide-to-portfolio-rebalancing",
        },
        {
          id: "i4",
          title: "Tax-Efficient Investing",
          description: "Strategies to minimize taxes on your investments",
          status: "not-started",
          duration: "10 min",
          source: "ai-generated",
        },
        {
          id: "i5",
          title: "Dollar-Cost Averaging",
          description: "How to use dollar-cost averaging to reduce market timing risk",
          status: "not-started",
          duration: "7 min",
          source: "external",
          url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp",
        },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Topics",
      description: "Sophisticated strategies for experienced investors",
      progress: 0,
      lessons: [
        {
          id: "a1",
          title: "Options Trading Basics",
          description: "Introduction to options contracts and strategies",
          status: "not-started",
          duration: "20 min",
          source: "external",
          url: "https://www.investopedia.com/options-basics-tutorial-4583012",
        },
        {
          id: "a2",
          title: "Factor Investing",
          description: "Understanding and implementing factor-based investment strategies",
          status: "not-started",
          duration: "15 min",
          source: "ai-generated",
        },
        {
          id: "a3",
          title: "Alternative Investments",
          description: "Exploring real estate, private equity, and other alternatives",
          status: "not-started",
          duration: "18 min",
          source: "external",
          url: "https://www.blackrock.com/us/individual/education/alternative-investments",
        },
        {
          id: "a4",
          title: "Sustainable Investing",
          description: "Incorporating ESG factors into your investment strategy",
          status: "not-started",
          duration: "12 min",
          source: "ai-generated",
        },
        {
          id: "a5",
          title: "International Diversification",
          description: "How to invest in global markets effectively",
          status: "not-started",
          duration: "14 min",
          source: "external",
          url: "https://www.morningstar.com/articles/1013616/the-case-for-international-diversification",
        },
      ],
    },
  ])

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const handleMarkAsCompleted = (trackId: string, lessonId: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        if (track.id === trackId) {
          const updatedLessons = track.lessons.map((lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, status: "completed" as LessonStatus }
            }
            return lesson
          })

          // Calculate new progress
          const completedCount = updatedLessons.filter((l) => l.status === "completed").length
          const totalCount = updatedLessons.length
          const newProgress = Math.round((completedCount / totalCount) * 100)

          return { ...track, lessons: updatedLessons, progress: newProgress }
        }
        return track
      }),
    )
  }

  const handleMarkAsInProgress = (trackId: string, lessonId: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        if (track.id === trackId) {
          const updatedLessons = track.lessons.map((lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, status: "in-progress" as LessonStatus }
            }
            return lesson
          })

          return { ...track, lessons: updatedLessons }
        }
        return track
      }),
    )
  }

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Started</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Curriculum</CardTitle>
          <CardDescription>Personalized educational content to help you become a better investor</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="beginner">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {tracks.map((track) => (
              <TabsContent key={track.id} value={track.id} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{track.title}</h3>
                    <p className="text-muted-foreground">{track.description}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Progress value={track.progress} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{track.progress}% Complete</span>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {track.lessons.map((lesson) => (
                    <AccordionItem key={lesson.id} value={lesson.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-2">
                            {lesson.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            <span>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.duration}
                            </div>
                            {getStatusBadge(lesson.status)}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>

                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Source: {lesson.source === "external" ? "External Article" : "AI-Generated Content"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {lesson.url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={lesson.url} target="_blank" rel="noopener noreferrer">
                                  Read Article <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setSelectedLesson(lesson)}>
                                Read Content <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            )}

                            {lesson.status === "not-started" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsInProgress(track.id, lesson.id)}
                              >
                                Mark as In Progress
                              </Button>
                            )}

                            {lesson.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsCompleted(track.id, lesson.id)}
                              >
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {selectedLesson && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedLesson.title}</CardTitle>
              <CardDescription>{selectedLesson.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedLesson(null)}>
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {selectedLesson.content?.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {selectedLesson.duration} read
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleMarkAsCompleted(
                  tracks.find((t) => t.lessons.some((l) => l.id === selectedLesson.id))?.id || "",
                  selectedLesson.id,
                )
              }
            >
              Mark as Completed
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

