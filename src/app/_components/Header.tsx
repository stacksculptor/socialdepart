import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
// import { SimpleUploadButton } from "./simple-upload-button";

export function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 text-xl font-semibold">
      <div>Social Department</div>

      <div className="flex flex-row items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="lg" className="cursor-pointer">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          {/* <SimpleUploadButton /> */}
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
