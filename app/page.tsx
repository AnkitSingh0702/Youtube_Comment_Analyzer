import { AnalyzerForm } from '@/app/components/analyzer-form'

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-center">YouTube Comment Analyzer</h1>
      <AnalyzerForm />
    </main>
  )
}
