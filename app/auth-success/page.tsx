export default function AuthSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Authentication Successful!
        </h1>
        <p className="text-gray-600">
          Your Shopify store has been successfully connected.
        </p>
      </div>
    </div>
  );
}
