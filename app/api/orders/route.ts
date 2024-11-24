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
    console.log('Making request to Shopify GraphQL API...');
    const apiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`;
    
    // GraphQL query to fetch orders
    const query = `
      {
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    originalUnitPrice
                    variant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Raw response:', responseText.substring(0, 200) + '...');

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

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }

    // Transform the GraphQL response to match our expected format
    const orders = data.data.orders.edges.map(({ node }: any) => ({
      id: node.id.split('/').pop(),
      order_number: node.name.replace('#', ''),
      total_price: node.totalPriceSet.shopMoney.amount,
      created_at: node.createdAt,
      line_items: node.lineItems.edges.map(({ node: item }: any) => ({
        id: item.variant?.id?.split('/').pop() || item.id.split('/').pop(),
        title: item.title,
        quantity: item.quantity,
        price: item.originalUnitPrice
      }))
    }));

    console.log('Successfully fetched orders. Count:', orders.length);
    return NextResponse.json({ orders });
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
