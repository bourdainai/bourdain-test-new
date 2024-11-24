'use client';

import { useState } from 'react';

export default function Home() {
  const [shop, setShop] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shop) {
      window.location.href = `/api/auth?shop=${encodeURIComponent(shop)}`;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bourdain Test App
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shop" className="block text-sm font-medium text-gray-700">
              Shop Domain
            </label>
            <input
              type="text"
              id="shop"
              placeholder="your-store.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect Shopify Store
          </button>
        </form>
      </div>
    </main>
  );
}
