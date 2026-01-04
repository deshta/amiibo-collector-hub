import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { getAmiiboImageUrl } from '@/lib/amiibo-images';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Gamepad2, Plus, Pencil, Trash2, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STORAGE_KEY = 'admin_amiibos_filters';
const ITEMS_PER_PAGE = 20;

interface Amiibo {
  id: string;
  name: string;
  series: string | null;
  type: string | null;
  character: string | null;
  image_path: string | null;
  amiibo_hex_id: string | null;
  release_na: string | null;
  release_jp: string | null;
  release_eu: string | null;
  release_au: string | null;
}

interface Filters {
  search: string;
  type: string;
  series: string;
  character: string;
}

const emptyAmiibo: Omit<Amiibo, 'id'> = {
  name: '',
  series: '',
  type: '',
  character: '',
  image_path: '',
  amiibo_hex_id: '',
  release_na: '',
  release_jp: '',
  release_eu: '',
  release_au: '',
};

const defaultFilters: Filters = {
  search: '',
  type: '',
  series: '',
  character: '',
};

export function AdminAmiibosTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Load filters from localStorage
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    amiibo: Amiibo | null;
    isNew: boolean;
  }>({ open: false, amiibo: null, isNew: false });
  const [formData, setFormData] = useState<Omit<Amiibo, 'id'>>(emptyAmiibo);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    amiibo: Amiibo | null;
  }>({ open: false, amiibo: null });

  // Get unique types, series and characters from amiibos
  const uniqueTypes = useMemo(() => {
    const types = new Set(amiibos.map(a => a.type).filter(Boolean));
    return Array.from(types).sort() as string[];
  }, [amiibos]);

  const uniqueSeries = useMemo(() => {
    const series = new Set(amiibos.map(a => a.series).filter(Boolean));
    return Array.from(series).sort() as string[];
  }, [amiibos]);

  const uniqueCharacters = useMemo(() => {
    const characters = new Set(amiibos.map(a => a.character).filter(Boolean));
    return Array.from(characters).sort() as string[];
  }, [amiibos]);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.type || filters.series || filters.character;

  const fetchAmiibos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('amiibos')
        .select('*')
        .order('name');

      if (error) throw error;
      setAmiibos(data || []);
    } catch (error) {
      console.error('Error fetching amiibos:', error);
      toast({
        title: t('toast.error'),
        description: t('admin.loadAmiibosError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmiibos();
  }, []);

  const openEditDialog = (amiibo: Amiibo | null) => {
    if (amiibo) {
      setFormData({
        name: amiibo.name,
        series: amiibo.series || '',
        type: amiibo.type || '',
        character: amiibo.character || '',
        image_path: amiibo.image_path || '',
        amiibo_hex_id: amiibo.amiibo_hex_id || '',
        release_na: amiibo.release_na || '',
        release_jp: amiibo.release_jp || '',
        release_eu: amiibo.release_eu || '',
        release_au: amiibo.release_au || '',
      });
      setEditDialog({ open: true, amiibo, isNew: false });
    } else {
      setFormData(emptyAmiibo);
      setEditDialog({ open: true, amiibo: null, isNew: true });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}.${extension}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('amiibo-images')
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Set the image path (just the filename, the getAmiiboImageUrl will handle it)
      setFormData(prev => ({ ...prev, image_path: filename }));

      toast({
        title: t('toast.added'),
        description: t('admin.imageUploaded'),
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: t('toast.error'),
        description: t('admin.imageUploadError'),
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t('toast.error'),
        description: t('admin.nameRequired'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        name: formData.name.trim(),
        series: formData.series?.trim() || null,
        type: formData.type?.trim() || null,
        character: formData.character?.trim() || null,
        image_path: formData.image_path?.trim() || null,
        amiibo_hex_id: formData.amiibo_hex_id?.trim() || null,
        release_na: formData.release_na || null,
        release_jp: formData.release_jp || null,
        release_eu: formData.release_eu || null,
        release_au: formData.release_au || null,
      };

      if (editDialog.isNew) {
        const { data, error } = await supabase
          .from('amiibos')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setAmiibos([...amiibos, data]);
        toast({
          title: t('toast.added'),
          description: t('admin.amiiboAdded'),
        });
      } else if (editDialog.amiibo) {
        const { error } = await supabase
          .from('amiibos')
          .update(dataToSave)
          .eq('id', editDialog.amiibo.id);

        if (error) throw error;
        setAmiibos(amiibos.map(a => 
          a.id === editDialog.amiibo!.id ? { ...a, ...dataToSave } : a
        ));
        toast({
          title: t('toast.updated'),
          description: t('admin.amiiboUpdated'),
        });
      }

      setEditDialog({ open: false, amiibo: null, isNew: false });
    } catch (error) {
      console.error('Error saving amiibo:', error);
      toast({
        title: t('toast.error'),
        description: t('admin.saveAmiiboError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.amiibo) return;

    try {
      const { error } = await supabase
        .from('amiibos')
        .delete()
        .eq('id', deleteDialog.amiibo.id);

      if (error) throw error;

      setAmiibos(amiibos.filter(a => a.id !== deleteDialog.amiibo!.id));
      toast({
        title: t('toast.removed'),
        description: t('admin.amiiboDeleted'),
      });
    } catch (error) {
      console.error('Error deleting amiibo:', error);
      toast({
        title: t('toast.error'),
        description: t('admin.deleteAmiiboError'),
        variant: 'destructive',
      });
    }

    setDeleteDialog({ open: false, amiibo: null });
  };

  const filteredAmiibos = useMemo(() => {
    return amiibos.filter(amiibo => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        amiibo.name.toLowerCase().includes(searchLower) ||
        amiibo.series?.toLowerCase().includes(searchLower);
      const matchesType = !filters.type || amiibo.type === filters.type;
      const matchesSeries = !filters.series || amiibo.series === filters.series;
      const matchesCharacter = !filters.character || amiibo.character === filters.character;
      return matchesSearch && matchesType && matchesSeries && matchesCharacter;
    });
  }, [amiibos, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAmiibos.length / ITEMS_PER_PAGE);
  const paginatedAmiibos = filteredAmiibos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              {t('admin.amiibosManagement')}
            </div>
            <Button onClick={() => openEditDialog(null)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.addAmiibo')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('admin.searchAmiibos')}
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('admin.type')} />
              </SelectTrigger>
              <SelectContent>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.series} onValueChange={(value) => updateFilter('series', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('admin.series')} />
              </SelectTrigger>
              <SelectContent>
                {uniqueSeries.map((series) => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.character} onValueChange={(value) => updateFilter('character', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('admin.character')} />
              </SelectTrigger>
              <SelectContent>
                {uniqueCharacters.map((character) => (
                  <SelectItem key={character} value={character}>
                    {character}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-4 h-4" />
                {t('admin.clearFilters')}
              </Button>
            )}
            <Badge variant="outline">
              {filteredAmiibos.length} / {amiibos.length} {t('admin.totalAmiibos')}
            </Badge>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t('admin.image')}</TableHead>
                  <TableHead>{t('admin.name')}</TableHead>
                  <TableHead>{t('admin.character')}</TableHead>
                  <TableHead>{t('admin.series')}</TableHead>
                  <TableHead>{t('admin.type')}</TableHead>
                  <TableHead className="text-right">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAmiibos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin.noAmiibosFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAmiibos.map((amiibo) => (
                    <TableRow key={amiibo.id}>
                      <TableCell>
                        {amiibo.image_path ? (
                          <img
                            src={getAmiiboImageUrl(amiibo.image_path)}
                            alt={amiibo.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{amiibo.name}</TableCell>
                      <TableCell>{amiibo.character || '-'}</TableCell>
                      <TableCell>{amiibo.series || '-'}</TableCell>
                      <TableCell>
                        {amiibo.type && <Badge variant="secondary">{amiibo.type}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(amiibo)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, amiibo })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                {t('index.previous')}
              </Button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('index.next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => 
        setEditDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? t('admin.addAmiibo') : t('admin.editAmiibo')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('admin.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="character">{t('admin.character')}</Label>
              <Select 
                value={formData.character || ''} 
                onValueChange={(value) => setFormData({ ...formData, character: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.selectCharacter')} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCharacters.map((character) => (
                    <SelectItem key={character} value={character}>
                      {character}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="character_new"
                placeholder={t('admin.orTypeNew')}
                value={formData.character || ''}
                onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="series">{t('admin.series')}</Label>
                <Select 
                  value={formData.series || ''} 
                  onValueChange={(value) => setFormData({ ...formData, series: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.selectSeries')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSeries.map((series) => (
                      <SelectItem key={series} value={series}>
                        {series}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">{t('admin.type')}</Label>
                <Select 
                  value={formData.type || ''} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('admin.image')}</Label>
              <div className="flex items-center gap-4">
                {formData.image_path && (
                  <img
                    src={getAmiiboImageUrl(formData.image_path)}
                    alt="Preview"
                    className="w-16 h-16 object-contain rounded border"
                  />
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="gap-2"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {t('admin.uploadImage')}
                  </Button>
                  <Input
                    id="image_path"
                    value={formData.image_path || ''}
                    onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                    placeholder={t('admin.orEnterPath')}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amiibo_hex_id">Hex ID</Label>
              <Input
                id="amiibo_hex_id"
                value={formData.amiibo_hex_id || ''}
                onChange={(e) => setFormData({ ...formData, amiibo_hex_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="release_na">{t('admin.releaseNA')}</Label>
                <Input
                  id="release_na"
                  type="date"
                  value={formData.release_na || ''}
                  onChange={(e) => setFormData({ ...formData, release_na: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="release_jp">{t('admin.releaseJP')}</Label>
                <Input
                  id="release_jp"
                  type="date"
                  value={formData.release_jp || ''}
                  onChange={(e) => setFormData({ ...formData, release_jp: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="release_eu">{t('admin.releaseEU')}</Label>
                <Input
                  id="release_eu"
                  type="date"
                  value={formData.release_eu || ''}
                  onChange={(e) => setFormData({ ...formData, release_eu: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="release_au">{t('admin.releaseAU')}</Label>
                <Input
                  id="release_au"
                  type="date"
                  value={formData.release_au || ''}
                  onChange={(e) => setFormData({ ...formData, release_au: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, amiibo: null, isNew: false })}
            >
              {t('profile.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('profile.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.confirmDeleteDesc').replace('{name}', deleteDialog.amiibo?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('admin.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
