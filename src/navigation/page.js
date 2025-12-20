import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
export default function Navbar() {
  const router = useRouter();
  return (
    <nav style={{ padding: '20px', background: '#eee' }}>
      <Link href="/mainRestorentList">Home</Link> | 
      <Button onClick={() => window.location.href = "/cart"} className="mt-3">
      GO TO CART
    </Button>
      <Link href="/Profile"> Profile </Link>
    </nav>
  );
}