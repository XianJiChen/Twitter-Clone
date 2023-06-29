import { date, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input : { content }, ctx }) => {
      const tweet = await ctx.prisma.tweet.create({ data : { 
          content, 
          userId : ctx.session.user.id}
        });

      return tweet;
    }),
    infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(), 
        cursor: z.object({ 
          id: z.string(),
          createdAt: z.date(),
        }).optional()
      })
    ).query(async ({ input : { limit = 10, cursor }, ctx }) => {
        const curruentUserId = ctx.session?.user.id;

        const data = await ctx.prisma.tweet.findMany({
          //+1 because this will give us the next item we start with
          take: limit + 1,
          cursor: cursor ? { createdAt_id: cursor } : undefined,
          orderBy: [{ createdAt: "desc"}, { id: "desc"}],
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
          nextCursor}
    })

});

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
