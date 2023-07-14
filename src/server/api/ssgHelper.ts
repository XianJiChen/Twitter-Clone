import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter } from "./root";
import superjson from "superjson";
import { createInnerTRPCContext } from "./trpc"

export function ssgHelper() {
    return createServerSideHelpers({
        router: appRouter,
        //cause we're doing static site generation so we don't have any user information
        ctx: createInnerTRPCContext({ session : null, revalidateSSG: null }),
         transformer: superjson
    });
}