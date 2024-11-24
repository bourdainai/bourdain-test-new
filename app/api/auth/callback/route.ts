import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const host = searchParams.get('host');

  console.log('Callback received with params:', { shop, code, state, host });

  if (!shop || !code) {
    console.error('Missing required parameters:', { shop, code });
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Ensure shop parameter is properly formatted
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  try {
    console.log('Attempting to exchange code for access token');
    console.log('API Key:', process.env.SHOPIFY_API_KEY);
    console.log('Shop Domain:', shopDomain);

    // Exchange the authorization code for an access token
    const accessTokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const responseText = await accessTokenResponse.text();
    console.log('Raw response:', responseText);

    if (!accessTokenResponse.ok) {
      console.error('Failed to get access token:', {
        status: accessTokenResponse.status,
        statusText: accessTokenResponse.statusText,
        response: responseText
      });
      throw new Error(`Failed to get access token: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid response format');
    }

    console.log('Access token received successfully');

    // Redirect to success page with shop and access token
    const successUrl = new URL('/auth-success', process.env.HOST || 'http://localhost:3000');
    successUrl.searchParams.set('shop', shopDomain);
    successUrl.searchParams.set('accessToken', data.access_token);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('Auth error:', error);
    // Return a more detailed error page
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      shop: shopDomain,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
