import type { GetStaticPaths, GetStaticPathsContext, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { ProfileImage } from "~/components/ProfileImage";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { FollowButton } from "~/components/FollowButton";

//telling that the props that are passed in here are coming from the return value of function "getStaticProps "
const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = 
({ 
    id,
}) => {
    const { data : profile } = api.profile.getById.useQuery({ id });
    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
        { userId: id },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

    const trpcUtils = api.useContext();
    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess: ({ addedFollow }) => {
          trpcUtils.profile.getById.setData({ id }, (oldData) => {
            if (oldData == null) return ;
    
            const countModifier = addedFollow ? 1 : -1;
            return {
              ...oldData,
              isFollowing: addedFollow,
              followersCount: oldData.followersCount + countModifier,
            };
          });
        },
      });
    

    if(profile == null ||  profile ==undefined || profile.name == null) return <ErrorPage statusCode={404}/>

    return (
        <>
      <Head>
        <title>{`Twitter Clone - ${profile.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <div className="text-gray-500">
            {profile.tweetsCount}{" "}
            {getPlural(profile.tweetsCount, "Tweet", "Tweets")} - {" "}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "Follower", "Followers")} - {" "}
            {profile.followsCount} Following
          </div>
        </div>
        <FollowButton
          isFollowing={profile.isFollowing}
          isLoading={toggleFollow.isLoading}
          userId={id}
          onClick={() => toggleFollow.mutate({ userId: id })}
        />
      </header>
      <main>
        <InfiniteTweetList
          tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
          isError={tweets.isError}
          isLoading={tweets.isLoading}
        //   hasMore={tweets.hasNextPage}
          hasMore={tweets.hasNextPage==true}
          fetchNewTweets={tweets.fetchNextPage}
        />
      </main>
    </>
    );
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        //empty array: don't generate any pages at all by default
        paths: [],
        //fallback: what I want to when I can't find a page in my path
        /*
            blocking: whenever I try to request a page that doesn't exist, dont send the 
            HTML down to the client until it's done generating.
        */
        fallback: "blocking",
    }
}


const pluralRules = new Intl.PluralRules();
function getPlural(number: number, singular: string, plural: string) {
  return pluralRules.select(number) === "one" ? singular : plural;
}

export async function getStaticProps(
    context: GetStaticPropsContext<{ id:string }>
) {
    const id = context.params?.id;

    if(id == null){
        return {
            redirect: {
                destination: "/"
            }
        }
    }

    const ssg = ssgHelper();
    //prefetch all these data for statically generating the site whenever it needs to
    await ssg.profile.getById.prefetch({ id });

    return({
        props:{
            trpcState: ssg.dehydrate(),
            id,
        }
    })
}

export default ProfilePage;