
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Trash2, Filter, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  source_tag: string | null;
  created_at: string;
  updated_at: string;
}

const MyFiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null);
  const [sourceTagFilter, setSourceTagFilter] = useState<string | null>(null);
  const [uniqueSourceTags, setUniqueSourceTags] = useState<string[]>([]);
  const [uniqueFileTypes, setUniqueFileTypes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserFiles();
    }
  }, [user]);

  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setFiles(data);
        
        // Extract unique source tags and file types for filters
        const tags = Array.from(new Set(data.filter(f => f.source_tag).map(f => f.source_tag))) as string[];
        const types = Array.from(new Set(data.map(f => f.file_type)));
        
        setUniqueSourceTags(tags);
        setUniqueFileTypes(types);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Erro ao carregar arquivos",
        description: "Não foi possível carregar seus arquivos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      // Create a folder path with user ID for isolation
      const folderPath = `${user!.id}/${file.storage_path}`;
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(folderPath);
        
      if (error) {
        throw error;
      }
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: `O arquivo ${file.file_name} está sendo baixado.`,
      });
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Erro ao baixar arquivo",
        description: "Não foi possível baixar o arquivo. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      // First delete the file from storage
      const folderPath = `${user!.id}/${file.storage_path}`;
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([folderPath]);
        
      if (storageError) {
        throw storageError;
      }
      
      // Then delete the file metadata from the database
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', file.id);
        
      if (dbError) {
        throw dbError;
      }
      
      // Update UI
      setFiles(files.filter(f => f.id !== file.id));
      
      toast({
        title: "Arquivo excluído",
        description: `O arquivo ${file.file_name} foi excluído com sucesso.`,
      });
      
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erro ao excluir arquivo",
        description: "Não foi possível excluir o arquivo. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const getFileTypeIcon = (fileType: string): JSX.Element => {
    // Simplified - we could add more icons for different file types
    if (fileType.includes('image')) {
      return <div className="w-6 h-6 bg-blue-100 text-blue-800 flex items-center justify-center rounded">🖼️</div>;
    } else if (fileType.includes('video')) {
      return <div className="w-6 h-6 bg-red-100 text-red-800 flex items-center justify-center rounded">🎥</div>;
    } else if (fileType.includes('pdf')) {
      return <div className="w-6 h-6 bg-red-100 text-red-800 flex items-center justify-center rounded">📄</div>;
    } else {
      return <div className="w-6 h-6 bg-gray-100 text-gray-800 flex items-center justify-center rounded">📁</div>;
    }
  };

  // Apply filters to the files
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === "" || 
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFileType = fileTypeFilter === null || 
      file.file_type === fileTypeFilter;
    
    const matchesSourceTag = sourceTagFilter === null || 
      file.source_tag === sourceTagFilter;
    
    return matchesSearch && matchesFileType && matchesSourceTag;
  });
  
  const clearFilters = () => {
    setSearchQuery("");
    setFileTypeFilter(null);
    setSourceTagFilter(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Meus Arquivos</h1>
      
      {/* Search and filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome do arquivo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={fileTypeFilter || ""} onValueChange={(value) => setFileTypeFilter(value || null)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de arquivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {uniqueFileTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.split('/')[1]?.toUpperCase() || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sourceTagFilter || ""} onValueChange={(value) => setSourceTagFilter(value || null)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as origens</SelectItem>
                {uniqueSourceTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
      
      {/* Files grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando arquivos...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Nenhum arquivo encontrado</h3>
          <p className="text-muted-foreground">
            {files.length === 0 
              ? "Você ainda não possui arquivos armazenados." 
              : "Nenhum arquivo corresponde aos filtros selecionados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getFileTypeIcon(file.file_type)}
                  <h3 className="font-medium truncate" title={file.file_name}>
                    {file.file_name}
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between items-center mb-1">
                    <span>Tamanho:</span>
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Tipo:</span>
                    <span>{file.file_type.split('/')[1] || file.file_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data:</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                  {file.source_tag && (
                    <div className="mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {file.source_tag}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-2 bg-muted/20 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Ações
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Baixar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFiles;
