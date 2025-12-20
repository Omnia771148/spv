'use client';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function GoToCartButton() {
  const { cart } = useCart();
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/cart')} className="mt-3">
      GO TO CART ({cart.length})
    </Button>
  );
}
