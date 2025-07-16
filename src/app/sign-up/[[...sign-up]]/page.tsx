import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-300">
            Sign up to get started
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
              formFieldInput: "bg-gray-800 border-gray-600 text-white",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              dividerLine: "bg-gray-600",
              dividerText: "text-gray-400",
            }
          }}
        />
      </div>
    </div>
  );
} 