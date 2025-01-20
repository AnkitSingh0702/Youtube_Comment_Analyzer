"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeComments } from "@/app/action"
import { AnalysisResults } from "./analysis-result"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full text-lg py-6" disabled={pending}>
      {pending ? "Analyzing..." : "Analyze Comments"}
    </Button>
  )
}

export function AnalyzerForm() {
  const initialState = {
    success: false,
    results: {
      agree: 0,
      disagree: 0,
      neutral: 0,
      distribution: {} as Record<string, number>,
      total: 0,
    },
    error: undefined,
  }

  const [state, action] = useActionState(analyzeComments, initialState)
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="w-full max-w-2xl space-y-8">
      {!showResults && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Analyze YouTube Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                action(formData)
                setShowResults(true)
              }}
              className="space-y-4"
            >
              <Input name="url" placeholder="https://www.youtube.com/watch?v=..." required className="text-lg p-6" />
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      )}

      {state.error && (
        <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
          <CardContent className="text-red-800 dark:text-red-200 text-center py-4">{state.error}</CardContent>
        </Card>
      )}

      {showResults && state.success && <AnalysisResults results={state.results} onBack={() => setShowResults(false)} />}
    </div>
  )
}

