import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import { Spinner, SPINNER_LG_CLASSNAMES } from "../components/Spinner";
import { useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/auth";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
const Home: NextPage = () => {
  const router = useRouter();
  const session = useSession();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/habits");
    } else if (session.status === "unauthenticated") {
      router.push("/home");
    }
  }, [session.status]);

  return (
    <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
      <Spinner className={SPINNER_LG_CLASSNAMES} />
    </div>
  );
};

export default Home;
