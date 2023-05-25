import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import PageHead from "~/components/elements/PageHead";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const goDaddy = api.example.getDomain.useQuery();

  useEffect(() => {
    goDaddy.data && console.log(goDaddy.data);
  }, [goDaddy.data]);

  // border-pink-500

  return (
    <>
      <PageHead
        title="AI Domain search"
        descriptionShort="Unlock AI-Powered Domain Recommendations!"
        descriptionLong="Unlock AI-Powered Domain Recommendations! Describe your business or
            project below and let our advanced AI technology generate
            personalized domain name suggestions exclusively for you. Take your
            online presence to the next level!"
      />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="max-w-4xl">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-50 sm:text-[2rem] md:text-6xl">
            Unlock <span className="text-pink-500">AI</span> Powered Domain
            Recommendations!
          </h1>

          <p className="mb-10 mt-6 max-w-2xl text-xl tracking-wider text-gray-50">
            Share your business or project details, and our AI will create
            unique domain name suggestions tailored exclusively to you. Discover
            available domains, saving you valuable time and money.
          </p>

          <div>
            <Link
              href="/generate"
              className="rounded-md border-2 border-pink-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-pink-500"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
          <AuthShowcase />
        </div>
      </div>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
