import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
export default function Navbar() {
  const router = useRouter();
  return (
    <nav style={{ padding: "20px", background: "#eee", display: "flex", gap: "15px" }}>
  <Link href="/mainRestorentList" className="btn btn-primary">
    Home
  </Link>

  <Link href="/cart" className="btn btn-success">
    Go To Cart
  </Link>

  <Link href="/Profile" className="btn btn-secondary">
    Profile
  </Link>


  <Link href="/finalorderstatuses" className="btn btn-secondary">
    finalorderstatuses
  </Link>



</nav>

  );
}