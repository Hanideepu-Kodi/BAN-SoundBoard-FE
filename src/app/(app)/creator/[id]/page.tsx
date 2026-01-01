import CreatorProfilePage from "@/components/CreatorProfilePage";

type CreatorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { id } = await params;
  return <CreatorProfilePage creatorId={id} />;
}
