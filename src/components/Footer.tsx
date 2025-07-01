import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 LegalUtils. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link href="#" className="hover:text-teal">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-teal">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-teal">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
