import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { createGoogleAuthorizationURL } from "@/app/(auth)/login/actions";

export function GoogleSignInButton() {
  const { toast } = useToast();

  const onGoogleSignInClicked = async () => {
    const res = await createGoogleAuthorizationURL();
    if (res.error) {
      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
      });
    } else if (res.success) {
      window.location.href = res.data.toString();
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onGoogleSignInClicked}
    >
      <FaGoogle className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
