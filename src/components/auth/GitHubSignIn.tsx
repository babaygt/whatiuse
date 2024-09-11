import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { createGitHubAuthorizationURL } from "@/app/(auth)/login/actions";

export function GitHubSignInButton() {
  const { toast } = useToast();

  const onGitHubSignInClicked = async () => {
    const res = await createGitHubAuthorizationURL();
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
      onClick={onGitHubSignInClicked}
    >
      <FaGithub className="mr-2 h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}
