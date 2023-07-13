import type { GetStaticPaths, GetStaticPathsContext, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";

//telling that the props that are passed in here are coming from the return value of function "getStaticProps "
const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = 
({ 
    id,
}) => {
    const { data : profile } = api.profile.getById.useQuery({ id });

    if(profile == null ||  profile ==undefined || profile.name == null) return <ErrorPage statusCode={404}/>

    return (
        <>
            <Head>
                <title>{`Twitter Clone - ${profile.name}`}</title>
            </Head>
            {profile.name}
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