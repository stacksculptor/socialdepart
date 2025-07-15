import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
// import { SimpleUploadButton } from "./simple-upload-button";

export function Header() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>Gallery</div>

      <div className="flex flex-row items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="lg">
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
