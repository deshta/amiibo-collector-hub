import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, Check, Search } from "lucide-react";

interface Amiibo {
  id: string;
  name: string;
  series: string;
  image_url: string | null;
}

const AdminUpload = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchAmiibos();
  }, []);

  const fetchAmiibos = async () => {
    const { data, error } = await supabase
      .from("amiibos")
      .select("id, name, series, image_url")
      .order("name");

    if (error) {
      toast({
        title: "Erro ao carregar Amiibos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAmiibos(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (amiiboId: string, file: File) => {
    setUploading(amiiboId);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${amiiboId}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("amiibo-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("amiibo-images")
        .getPublicUrl(fileName);

      // Update amiibo record
      const { error: updateError } = await supabase
        .from("amiibos")
        .update({ image_url: urlData.publicUrl })
        .eq("id", amiiboId);

      if (updateError) throw updateError;

      // Update local state
      setAmiibos((prev) =>
        prev.map((a) =>
          a.id === amiiboId ? { ...a, image_url: urlData.publicUrl } : a
        )
      );

      toast({
        title: "Upload realizado!",
        description: "Imagem atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const filteredAmiibos = amiibos.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.series.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Upload de Imagens</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou série..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAmiibos.map((amiibo) => (
            <Card key={amiibo.id} className="overflow-hidden">
              <CardHeader className="p-3">
                <CardTitle className="text-sm truncate">{amiibo.name}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{amiibo.series}</p>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden flex items-center justify-center">
                  {amiibo.image_url ? (
                    <img
                      src={amiibo.image_url}
                      alt={amiibo.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">Sem imagem</span>
                  )}
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(amiibo.id, file);
                    }}
                    disabled={uploading === amiibo.id}
                  />
                  <Button
                    variant={amiibo.image_url ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={uploading === amiibo.id}
                    asChild
                  >
                    <span>
                      {uploading === amiibo.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : amiibo.image_url ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Substituir
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" /> Upload
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAmiibos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum Amiibo encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUpload;
