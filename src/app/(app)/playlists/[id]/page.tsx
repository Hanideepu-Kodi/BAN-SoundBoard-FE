import PlaylistDetailPage from "@/components/PlaylistDetailPage";

type PlaylistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  return <PlaylistDetailPage playlistId={id} />;
}
