'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: number;
  order_number: number;
  total_price: string;
  created_at: string;
  status: string;
  isDraft: boolean;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
  }>;
}

export default function AuthSuccess() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get shop and accessToken from URL
        const urlParams = new URLSearchParams(window.location.search);
        const shop = urlParams.get('shop');
        const accessToken = urlParams.get('accessToken');

        console.log('Auth Success Page - URL Params:', {
          shop,
          hasAccessToken: !!accessToken
        });

        if (!shop || !accessToken) {
          throw new Error('Missing shop or access token in URL parameters');
        }

        console.log('Fetching orders...');
        const response = await fetch(`/api/orders?shop=${encodeURIComponent(shop)}&accessToken=${encodeURIComponent(accessToken)}`);
        
        const responseText = await response.text();
        console.log('Orders API Response:', {
          status: response.status,
          ok: response.ok,
          responseText: responseText.substring(0, 200) + '...' // Log first 200 chars
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status} ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response:', e);
          throw new Error('Invalid response format from orders API');
        }

        console.log('Orders fetched successfully:', {
          count: data.orders?.length || 0
        });

        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error in fetchOrders:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = async (order: Order) => {
    try {
      setReorderLoading(order.id);
      const urlParams = new URLSearchParams(window.location.search);
      const shop = urlParams.get('shop');
      const accessToken = urlParams.get('accessToken');

      if (!shop || !accessToken) {
        throw new Error('Missing shop or access token');
      }

      const lineItems = order.line_items.map(item => ({
        variant_id: item.id,
        quantity: item.quantity
      }));

      console.log('Creating reorder...', {
        shop,
        hasAccessToken: !!accessToken,
        lineItems
      });

      const response = await fetch('/api/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          accessToken,
          lineItems,
        }),
      });

      const responseText = await response.text();
      console.log('Reorder API Response:', {
        status: response.status,
        ok: response.ok,
        responseText: responseText.substring(0, 200) + '...'
      });

      if (!response.ok) {
        throw new Error(`Failed to create reorder: ${response.status} ${responseText}`);
      }

      alert('Order successfully created!');
    } catch (err) {
      console.error('Error in handleReorder:', err);
      alert(err instanceof Error ? err.message : 'Failed to create reorder');
    } finally {
      setReorderLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Order #{order.order_number}
                      {order.isDraft && (
                        <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-1">
                      Status: <span className={`capitalize ${
                        order.status === 'paid' ? 'text-green-600' :
                        order.status === 'pending' ? 'text-yellow-600' :
                        order.status === 'refunded' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>{order.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${order.total_price}</p>
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderLoading === order.id}
                      className={`mt-2 ${
                        reorderLoading === order.id
                          ? 'bg-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white px-4 py-2 rounded transition-colors`}
                    >
                      {reorderLoading === order.id ? 'Processing...' : 'Reorder'}
                    </button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Items:</h3>
                  <ul className="space-y-2">
                    {order.line_items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.title} x {item.quantity}</span>
                        <span>${item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
