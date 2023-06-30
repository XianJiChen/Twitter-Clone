import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { IconBase } from "react-icons/lib";
import { IconHoverEffect } from "./IconHoverEffect";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

export function SideNav() {
    const session = useSession()
    const user = session.data?.user
    return <nav className="sticky top-0 px-2 py-4">
        <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
            <li>
                <Link href="/">
                    <IconHoverEffect>
                        <span className="flex items-center gap-4">
                            <VscHome className="h-8 w-8"/>
                            <div className="hidden text-lg md:inline">
                                Home
                            </div>
                        </span>
                    </IconHoverEffect>
                </Link> 
            </li>

            {user!=null && 
                <li>
                    <Link href={`/profiles/${user.id}`}>
                        <IconHoverEffect>
                            <span className="flex items-center gap-4">
                                <VscAccount className="h-8 w-8"/>
                                <div className="hidden text-lg md:inline">
                                    Profile
                                </div>
                            </span>
                        </IconHoverEffect>
                    </Link> 
                </li>    
            }
            

            {user==null ? ( 
                    <li>
                        <button onClick={() => void signIn()}>
                            <IconHoverEffect>
                                <span className="flex items-center gap-4 text-green-700">
                                    <VscSignIn className="h-8 w-8 fill-green-700"/>
                                    <span className="hidden text-lg md:inline">
                                        Log In
                                    </span>
                                </span>
                            </IconHoverEffect>
                        </button>
                    </li>
                ) : (
                    <li>
                        <button onClick={() => void signOut()}>
                            <IconHoverEffect>
                                <span className="flex items-center gap-4 text-red-700">
                                    <VscSignOut className="h-8 w-8 fill-red-700"/>
                                    <span className="hidden text-lg md:inline">
                                        Log Out
                                    </span>
                                </span>
                            </IconHoverEffect>
                        </button>
                    </li>
                )
            }
        </ul>
    </nav>
}