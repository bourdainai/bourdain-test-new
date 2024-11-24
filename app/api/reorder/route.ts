import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { shop, accessToken, lineItems } = await request.json();

    if (!shop || !accessToken || !lineItems) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create a new order using the Shopify API
    const response = await fetch(`https://${shop}/admin/api/2023-10/orders.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          line_items: lineItems,
          financial_status: 'pending',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating reorder:', error);
    return NextResponse.json({ error: 'Failed to create reorder' }, { status: 500 });
  }
}
