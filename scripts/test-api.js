// Simple script to test API functionality
const { searchSongs, getFeed, createMoment } = require('../lib/api.ts')

async function testAPI() {
  console.log('🧪 Testing SongDash API...\n')

  try {
    // Test search functionality
    console.log('1. Testing song search...')
    const searchResponse = await searchSongs({ query: 'Blinding' })
    console.log('✅ Search results:', searchResponse.data.length, 'songs found')
    
    // Test feed
    console.log('\n2. Testing feed...')
    const feedResponse = await getFeed()
    console.log('✅ Feed loaded:', feedResponse.data.length, 'moments')
    
    // Test moment creation
    console.log('\n3. Testing moment creation...')
    const momentResponse = await createMoment({
      songId: 'song-1',
      generalNote: 'Test moment from API test',
      highlights: [{
        text: 'Test highlight',
        note: 'Test note',
        startIndex: 0,
        endIndex: 14
      }],
      visibility: 'public'
    })
    console.log('✅ Moment created:', momentResponse.success)
    
    console.log('\n🎉 All API tests passed!')
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Only run if called directly
if (require.main === module) {
  testAPI()
}

module.exports = { testAPI }