import { SignedIn, UserButton } from "@clerk/nextjs";
import { Logo } from "./Logo";
import Link from "next/link";

export function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Background with depth */}
      <div className="relative">
        {/* Main header background with lighter gradient */}
        <div className="bg-gradient-to-b from-gray-600/80 via-gray-600/60 to-gray-600/65 backdrop-blur-xl border-b border-gray-600/50 shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo section with enhanced styling */}
              <Link 
                href="/" 
                className="flex items-center space-x-3 relative"
              >
                {/* Logo container */}
                <div className="relative p-2">
                  <Logo />
                </div>
              </Link>

            {/* Navigation and auth section */}
            <div className="flex items-center gap-4">

              {/* Auth buttons with enhanced styling */}
              <div className="flex items-center gap-3">
                <SignedIn>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 rounded-full border-2 border-gray-500/50 shadow-lg",
                        }
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle bottom shadow for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"></div>
      </div>
    </nav>
  );
}