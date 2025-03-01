import { api } from "~/utils/api";
import { InfiniteTweetList } from "./InfiniteTweetList";

export function FollowingTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage == true}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}
