'use client';

export default function CustomersPage() {
  const addCustomer = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        box_no: 'BX001',
        name: 'John',
        phone: '9999999999',
        amount: 500
      })
    });
  };

  return (
    <div>
      <h1>Customers</h1>
      <button onClick={addCustomer}>Add Customer</button>
    </div>
  );
}
