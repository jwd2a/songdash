"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function DebugPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testCreateMoment = async () => {
    setLoading(true)
    setResult('Testing moment creation...\n')

    try {
      const testData = {
        songId: 'debug-test-123',
        songTitle: 'Debug Test Song',
        songArtist: 'Debug Artist',
        songAlbum: 'Debug Album',
        songArtwork: 'https://i.scdn.co/image/debug',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/debug'
        },
        songDuration: '3:30',
        generalNote: 'This is a debug test moment!',
        highlights: [
          {
            text: 'Debug test lyrics',
            note: 'Testing highlight functionality',
            startIndex: 0,
            endIndex: 18
          }
        ],
        visibility: 'public'
      }

      setResult(prev => prev + `Sending request with data:\n${JSON.stringify(testData, null, 2)}\n\n`)

      const response = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      setResult(prev => prev + `Response status: ${response.status}\n`)

      if (response.ok) {
        const data = await response.json()
        setResult(prev => prev + `✅ Success!\n${JSON.stringify(data, null, 2)}\n\n`)
        
        // Test retrieving the moment
        const momentId = data.id
        setResult(prev => prev + `Testing retrieval of moment ${momentId}...\n`)
        
        const getResponse = await fetch(`/api/moments?id=${momentId}`)
        setResult(prev => prev + `Get response status: ${getResponse.status}\n`)
        
        if (getResponse.ok) {
          const retrievedData = await getResponse.json()
          setResult(prev => prev + `✅ Retrieved successfully!\n${JSON.stringify(retrievedData, null, 2)}\n`)
        } else {
          const errorData = await getResponse.json()
          setResult(prev => prev + `❌ Retrieval failed:\n${JSON.stringify(errorData, null, 2)}\n`)
        }
      } else {
        const errorData = await response.json()
        setResult(prev => prev + `❌ Failed:\n${JSON.stringify(errorData, null, 2)}\n`)
      }
    } catch (error) {
      setResult(prev => prev + `💥 Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testGetNonExistent = async () => {
    setLoading(true)
    setResult('Testing retrieval of non-existent moment...\n')

    try {
      const response = await fetch('/api/moments?id=nonexistent123')
      setResult(prev => prev + `Response status: ${response.status}\n`)
      
      const data = await response.json()
      setResult(prev => prev + `Response data:\n${JSON.stringify(data, null, 2)}\n`)
    } catch (error) {
      setResult(prev => prev + `💥 Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🐛 Debug API Testing</h1>
        
        <div className="space-y-4 mb-6">
          <Button 
            onClick={testCreateMoment} 
            disabled={loading}
            className="mr-4"
          >
            {loading ? 'Testing...' : 'Test Create & Retrieve Moment'}
          </Button>
          
          <Button 
            onClick={testGetNonExistent} 
            disabled={loading}
            variant="outline"
          >
            Test Get Non-Existent Moment
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h2 className="font-semibold mb-2">Results:</h2>
          <Textarea
            value={result}
            readOnly
            className="min-h-[400px] font-mono text-sm"
            placeholder="Test results will appear here..."
          />
        </div>
      </div>
    </div>
  )
}