'use client';

import { useProtectedRoute } from "@/hooks/useProtectedRoutes";

export default function AdminPage() {

  const loading = useProtectedRoute();

  if (loading) {
    return (
      <div
      style={{
        minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#020617',
          color: '#22c55e',
          fontFamily: 'Poppins, sans-serif',
      }}
      >
        Verificando sesion...
      </div>
    )
  }
  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome to the Admin section of the application.</p>
    </div>
  );
}
