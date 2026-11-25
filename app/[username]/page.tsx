import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { getPublicProfile } from "@/lib/supabase/public-profile";
import { PublicProfile } from "@/components/public-profile/public-profile";
import Loading from "@/app/dashboard/loading";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default function PublicProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent params={params} />
    </Suspense>
  );
}

async function ProfileContent({ params }: Props) {
  await connection();

  const { username } = await params;

  const result = await getPublicProfile(username);

  if (!result) {
    notFound();
  }

  return <PublicProfile profile={result.profile} links={result.links} />;
}
