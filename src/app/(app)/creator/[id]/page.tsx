import CreatorProfilePage from "@/components/CreatorProfilePage";

type CreatorPageProps = {
  params: {
    id: string;
  };
};

export default function CreatorPage({ params }: CreatorPageProps) {
  return <CreatorProfilePage creatorId={params.id} />;
}
