import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Ensure shop parameter is properly formatted
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  // Construct the OAuth URL
  const scopes = process.env.SCOPES || 'read_orders,write_orders';
  const redirectUri = `${process.env.HOST}/api/auth/callback`;
  const nonce = Date.now().toString();
  
  // Log the redirect URI for debugging
  console.log('Redirect URI:', redirectUri);
  console.log('HOST env:', process.env.HOST);
  
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  // Log the full auth URL for debugging
  console.log('Full Auth URL:', authUrl);

  // Redirect to Shopify OAuth
  return NextResponse.redirect(authUrl);
}
