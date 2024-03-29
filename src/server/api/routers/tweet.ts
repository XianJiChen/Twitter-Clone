import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { date, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input : { content }, ctx }) => {
      const tweet = await ctx.prisma.tweet.create({ data : { 
          content, 
          userId : ctx.session.user.id}
        });

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return tweet;
    }),
  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(), 
        cursor: z.object({ 
          id: z.string(),
          createdAt: z.date(),
        }).optional()
      })
    ).query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user.id;
        return await getInfiniteTweets({
          limit,
          ctx,
          cursor,
          whereClause:
            (currentUserId == null || !onlyFollowing)
              ? undefined
              : {
                  user: {
                    followers: { some: { id: currentUserId } },
                  },
                },
        });
      }
      ),
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
      return await getInfiniteTweets({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string()}))
    .mutation(async ({ input: {id}, ctx}) => {
      
      const data = { tweetId: id, userId: ctx.session.user.id}
      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_tweetId: data }
      })

      if(existingLike == null) {
        await ctx.prisma.like.create({ data })
        return { addedLike: true}
      }
      else{
        await ctx.prisma.like.delete({ where: { userId_tweetId: data} })
        return { addedLike: false}
      }
    }),
});

async function getInfiniteTweets({
  whereClause,
  ctx,
  limit,
  cursor,
} : {
  whereClause?: Prisma.TweetWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date;} | undefined;
  ctx : inferAsyncReturnType<typeof createTRPCContext>
}) {
  const curruentUserId = ctx.session?.user.id;
    const data = await ctx.prisma.tweet.findMany({
      //+1 because this will give us the next item we start with
      take: limit + 1,
      cursor: cursor ? { createdAt_id: cursor } : undefined,
      orderBy: [{ createdAt: "desc"}, { id: "desc"}],
      where: whereClause,
      select: {
        id: true,
        content: true,
        createdAt: true,
        _count: {select: {likes: true}},
        likes: curruentUserId==null ? false : {where: { userId: curruentUserId}}, 
        user: {
          select: {
            name: true,
            id: true,
            image: true
          }
        }
      }
    });

    let nextCursor: typeof cursor | undefined
    if(data.length>limit){
      const nextItem = data.pop();
      if(nextItem!=null){
        nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt}
      }
    }

    return {
      tweets: data.map(tweet => {
        return {
          id: tweet.id,
          content: tweet.content,
          createdAt: tweet.createdAt,
          likeCount: tweet._count.likes,
          user: tweet.user,
          likedByMe: tweet.likes?.length>0 ? true: false
        };
      }), 
    nextCursor
   };
};

// export const exampleRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ text: z.string() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input.text}`,
//       };
//     }),

//   getAll: publicProcedure.query(({ ctx }) => {
//     return ctx.prisma.example.findMany();
//   }),

//   getSecretMessage: protectedProcedure.query(() => {
//     return "you can now see this secret message!";
//   }),
// });
