import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVerification } from "@/contexts/VerificationContext";

export default function Navigation() {
  const pathname = usePathname();
  const { isVerified } = useVerification();
  console.log("Navigation isVerified:", isVerified);

  return (
    <nav className="flex items-center space-x-6">
      <Link
        href="/feed"
        className={`text-sm font-medium transition-colors hover:text-white ${
          pathname === "/feed" ? "text-white" : "text-gray-400"
        }`}
      >
        Feed
      </Link>
      <Link
        href="/tiktok"
        className={`text-sm font-medium transition-colors hover:text-white ${
          pathname === "/tiktok" ? "text-white" : "text-gray-400"
        }`}
      >
        TikTok
      </Link>
      {isVerified && (
        <Link
          href="/community"
          className={`text-sm font-medium transition-colors hover:text-white ${
            pathname === "/community" ? "text-white" : "text-gray-400"
          }`}
        >
          Edge Esmeralda
        </Link>
      )}
    </nav>
  );
}
