"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import QuestionnaireHeader from "@/components/common/questionnaire-header"
import { saveQuestionnaireResponses } from "@/actions/questionnaire-submission"

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const questions = [
    {
      id: "risk_tolerance",
      title: "Risk Tolerance",
      description: "How would you react to a significant drop in your investment value?",
      options: [
        { value: "low", label: "I would be very concerned and might sell my investments" },
        { value: "medium", label: "I would be concerned but would wait to see if values recover" },
        { value: "high", label: "I understand markets fluctuate and would see it as an opportunity" },
      ],
    },
    {
      id: "financial_goals",
      title: "Financial Goals",
      description: "What are your primary financial goals?",
      options: [
        { value: "retirement", label: "Saving for retirement" },
        { value: "short_term", label: "Short-term savings (1-5 years)" },
        { value: "education", label: "Education funding" },
        { value: "wealth_building", label: "Long-term wealth building" },
      ],
    },
    {
      id: "investment_experience",
      title: "Investment Experience",
      description: "How would you describe your investment experience?",
      options: [
        { value: "none", label: "No experience" },
        { value: "beginner", label: "Beginner (some basic knowledge)" },
        { value: "intermediate", label: "Intermediate (have invested before)" },
        { value: "advanced", label: "Advanced (experienced investor)" },
      ],
    },
    {
      id: "time_horizon",
      title: "Time Horizon",
      description: "How long do you plan to keep your money invested?",
      options: [
        { value: "short", label: "Less than 1 year" },
        { value: "medium", label: "1-5 years" },
        { value: "long", label: "More than 5 years" },
      ],
    },
    {
      id: "income_range",
      title: "Income Range",
      description: "What is your annual income range? (Optional)",
      options: [
        { value: "under_50k", label: "Under $50,000" },
        { value: "50k_100k", label: "Between $50,000 and $100,000" },
        { value: "100k_200k", label: "Between $100,000 and $200,000" },
        { value: "over_200k", label: "Over $200,000" },
        { value: "prefer_not_to_say", label: "Prefer not to say" },
      ],
    },
  ]

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleSubmitQuestionnaire()
    }
  }

  const handleSubmitQuestionnaire = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formattedResponses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const result = await saveQuestionnaireResponses(formattedResponses)

      if (result.success) {
        router.push("/dashboard")
      } else {
        throw new Error(result.error || "Failed to save responses")
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      setSubmitError(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentStep].id]: value,
    })
  }

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100
  const isLastQuestion = currentStep === questions.length - 1
  const canProceed = answers[currentQuestion.id] !== undefined

  return (
    <div className="flex flex-col min-h-screen">
      <QuestionnaireHeader />
      <main className="flex-1 container max-w-3xl py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Investment Profile Questionnaire</h1>
          <p className="text-muted-foreground">
            Answer these questions to help us understand your investment needs and preferences.
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{submitError}</p>
          </div>
        )}

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>{currentQuestion.title}</CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer py-2">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : isLastQuestion ? (
                <>
                  Complete <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

