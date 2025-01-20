'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

export function AnalysisResults({ results, onBack }: { results: any; onBack: () => void }) {
  const totalComments = results.agree + results.disagree + results.neutral
  const agreePercentage = (results.agree / totalComments) * 100
  const disagreePercentage = (results.disagree / totalComments) * 100
  const neutralPercentage = (results.neutral / totalComments) * 100

  const chartData = Object.entries(results.distribution).map(([date, count]) => {
    const [year, month] = date.split('-')
    return {
      date: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' }),
      count: count as number
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Input
        </Button>
        <h2 className="text-xl font-semibold">Analysis Results</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Agree</span>
                <span>{agreePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={agreePercentage} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disagree</span>
                <span>{disagreePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={disagreePercentage} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Neutral</span>
                <span>{neutralPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={neutralPercentage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comment Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalComments}</div>
              <div className="text-sm text-muted-foreground">Total Comments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{results.agree}</div>
              <div className="text-sm text-muted-foreground">Agree</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{results.disagree}</div>
              <div className="text-sm text-muted-foreground">Disagree</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{results.neutral}</div>
              <div className="text-sm text-muted-foreground">Neutral</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

