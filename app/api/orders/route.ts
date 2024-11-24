import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const accessToken = searchParams.get('accessToken');

  console.log('Fetching orders for shop:', shop);

  if (!shop || !accessToken) {
    console.error('Missing required parameters:', { shop, accessToken: !!accessToken });
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Ensure shop parameter is properly formatted
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  try {
    console.log('Making request to Shopify API...');
    const apiUrl = `https://${shopDomain}/admin/api/2023-10/orders.json?status=any&limit=50`;
    console.log('API URL:', apiUrl);

    // Fetch orders from Shopify
    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid response format');
    }

    console.log('Successfully fetched orders. Count:', data.orders?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      shop: shopDomain,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
