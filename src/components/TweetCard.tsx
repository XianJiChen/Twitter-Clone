import Link from "next/link";
import { ProfileImage } from "./ProfileImage";
import { Tweet } from "./types/Tweet";
import { HeartButton } from "./HeartButton";


const dateTimeFormatter = Intl.DateTimeFormat(undefined, {dateStyle: "short"});

export function TweetCard({
    id, 
    user, 
    content, 
    createdAt, 
    likeCount, 
    likedByMe}: Tweet) {
    return (
        <li className="flex gap-4 border-b px-4 py-4">
            <Link href={`/profiles/${user.id}`}>
                <ProfileImage src={user.image}/>
            </Link>
            <div className="flex flex-grow flex-col">
                <div className="flex gap-1">
                    <Link href={`/profiles/${user.id}`} 
                        className="font-bold hover:underline focus-visible:underline"

                    >
                        {user.name}
                    </Link>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-500">
                        {dateTimeFormatter.format(createdAt)}
                    </span>
                </div>
                <p className="whitespace-pre-wrap">{content}</p>
                <HeartButton likedByMe={likedByMe} likeCount={likeCount}/>
            </div>
        </li>
    )
}