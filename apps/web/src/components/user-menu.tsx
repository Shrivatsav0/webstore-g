import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Settings, ShoppingCart } from "lucide-react"
import { userMenuData } from "../../../../data/data";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild className="font-medium bg-transparent">
        <Link href="/login">
          <User className="h-4 w-4 mr-2" />
          {userMenuData.signInText}
        </Link>
      </Button>
    )
  }

  const getIcon = (iconName: string) => {
    const icons = { Settings, ShoppingCart, User, LogOut };
    return icons[iconName as keyof typeof icons] || Settings;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-medium bg-transparent">
          <User className="h-4 w-4 mr-2" />
          {session.user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuData.menuItems.map((item, index) => {
           const IconComponent = item.icon;
          return (
            <DropdownMenuItem key={index} asChild>
              <Link href={item.href} className="cursor-pointer">
                <IconComponent className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => {
            console.log("Sign out clicked")
            authClient.signOut().then(() => {
              router.push("/");
            }).catch((error) => {
              console.error("Sign out error:", error);
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {userMenuData.signOutText}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
