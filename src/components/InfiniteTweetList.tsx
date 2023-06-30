import InfiniteScroll from "react-infinite-scroll-component"
import { Tweet } from "./types/Tweet"
import { TweetCard } from "./TweetCard"

type InfiniteTweetListProps = {
    isLoading: boolean
    isError: boolean
    hasMore: boolean
    fetchNewTweet: () => Promise<unknown>
    tweets?: Tweet[]
}

export function InfiniteTweetList ({
    tweets, 
    isError, 
    isLoading, 
    fetchNewTweet, 
    hasMore
}: InfiniteTweetListProps) {
    if(isLoading) return <h1>Loading</h1>
    if(isError) return <h1>Error</h1>
    if(tweets == null) return null

    if(tweets == null || tweets.length === 0){
        return (
            <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
        );
    }

    return <ul>
        <InfiniteScroll
            dataLength={tweets.length}
            next={fetchNewTweet}
            hasMore={hasMore}
            loader={"Loading..."}
        >
            {tweets.map((tweet) => {
                return <TweetCard key={tweet.id} {...tweet}/>
            })}

        </InfiniteScroll>
    </ul>
}