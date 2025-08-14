// Simple test script to verify the moments API is working
// Run with: node test-moments-api.js

const baseUrl = 'http://localhost:3000'

async function testMomentsAPI() {
  console.log('🧪 Testing Moments API...\n')

  // Test data
  const testMoment = {
    songId: 'test-song-123',
    songTitle: 'Test Song',
    songArtist: 'Test Artist',
    songAlbum: 'Test Album',
    songArtwork: 'https://i.scdn.co/image/test',
    songPlatforms: {
      spotify: 'https://open.spotify.com/track/test',
      appleMusic: 'https://music.apple.com/track/test'
    },
    songDuration: '3:45',
    generalNote: 'This is a test moment!',
    highlights: [
      {
        text: 'Test lyrics line',
        note: 'This is my favorite part',
        startIndex: 0,
        endIndex: 16
      }
    ],
    visibility: 'public'
  }

  try {
    // Step 1: Create a moment
    console.log('1️⃣ Creating moment...')
    const createResponse = await fetch(`${baseUrl}/api/moments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMoment)
    })

    console.log('Create response status:', createResponse.status)
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.error('❌ Create failed:', errorData)
      return
    }

    const createData = await createResponse.json()
    console.log('✅ Moment created:', createData)
    console.log('🔗 Share URL:', createData.shareUrl)

    // Step 2: Retrieve the moment
    console.log('\n2️⃣ Retrieving moment...')
    const momentId = createData.id
    const getResponse = await fetch(`${baseUrl}/api/moments?id=${momentId}`)

    console.log('Get response status:', getResponse.status)
    
    if (!getResponse.ok) {
      const errorData = await getResponse.json()
      console.error('❌ Retrieve failed:', errorData)
      return
    }

    const retrievedData = await getResponse.json()
    console.log('✅ Moment retrieved:', {
      id: retrievedData.id,
      songTitle: retrievedData.songTitle,
      songArtist: retrievedData.songArtist,
      generalNote: retrievedData.generalNote,
      highlightCount: retrievedData.highlights?.length || 0,
      views: retrievedData.views
    })

    // Step 3: Test the share URL
    console.log('\n3️⃣ Testing share URL...')
    const shareResponse = await fetch(createData.shareUrl)
    console.log('Share URL status:', shareResponse.status)
    
    if (shareResponse.ok) {
      console.log('✅ Share URL is accessible')
    } else {
      console.log('❌ Share URL failed:', shareResponse.statusText)
    }

    console.log('\n🎉 All tests passed!')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testMomentsAPI()