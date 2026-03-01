'use client';

export default function UsersPage() {
  const createCollector = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Collector 1',
        email: 'collector1@test.com',
        role: 'COLLECTOR'
      })
    });
  };

  return (
    <div>
      <h1>Users</h1>
      <button onClick={createCollector}>Create Collector</button>
    </div>
  );
}
