"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Models } from "appwrite";
import { ChevronDown } from "lucide-react";

const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
};

type AppHeaderProps = {
    user: Models.User<Models.Preferences> | null;
    onSignIn: () => void;
    onSignOut: () => void;
};

export function AppHeader({ user, onSignIn, onSignOut }: AppHeaderProps) {
    return (
        <header className="flex flex-col gap-6 border-b border-border bg-background/80 px-4 py-6 backdrop-blur md:px-8">
            <div className="flex gap-4 flex-row items-center justify-between">
                <div className="flex flex-col gap-0">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-0">
                        Job Applications Tracker
                    </h1>
                    <p className="mt-2 max-w-2xl hidden md:flex text-sm text-muted-foreground">
                        Organize applications, track status changes, and keep the right follow
                        ups on your radar.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="md:w-full gap-2">
                                    <Avatar className="h-7 w-7">
                                        {Boolean((user.prefs as Record<string, unknown>)?.avatar) && (
                                            <AvatarImage
                                                src={(user.prefs as Record<string, unknown>).avatar as string}
                                                alt={user.name || "User"}
                                            />
                                        )}
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium hidden md:flex">{user.name}</span>

                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 flex-col">
                                <div className="p-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-3">Signed in as</p>
                                    <p className="text-sm font-medium mb-0.5">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={onSignIn} className="w-full md:w-auto">
                            Sign in with Google
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
