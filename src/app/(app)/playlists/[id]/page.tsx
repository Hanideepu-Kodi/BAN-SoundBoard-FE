import PlaylistDetailPage from "@/components/PlaylistDetailPage";

type PlaylistPageProps = {
  params: {
    id: string;
  };
};

export default function PlaylistPage({ params }: PlaylistPageProps) {
  return <PlaylistDetailPage playlistId={params.id} />;
}
