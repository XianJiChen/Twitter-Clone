import { api } from "~/utils/api"
import { InfiniteTweetList } from "./InfiniteTweetList";

export function RecentTweets () {
    const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
        {},
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      );
    
      return (
        <InfiniteTweetList
          tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
          isError={tweets.isError}
          isLoading={tweets.isLoading}
          hasMore={tweets.hasNextPage==true}
        //   unknown error
        //   fetchNewTweets={tweets.fetchNextPage}
          fetchNewTweet={tweets.fetchNextPage}
        />
      );
}