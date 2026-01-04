import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Search, Gamepad2, Plus, Pencil, Trash2, X } from 'lucide-react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const STORAGE_KEY = 'admin_amiibos_filters';
const ITEMS_PER_PAGE = 10;

interface Amiibo {
  id: string;
  name: string;
  series: string | null;
  type: string | null;
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
}

const emptyAmiibo: Omit<Amiibo, 'id'> = {
  name: '',
  series: '',
  type: '',
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
};

export function AdminAmiibosTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
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

  // Get unique types and series from amiibos
  const uniqueTypes = useMemo(() => {
    const types = new Set(amiibos.map(a => a.type).filter(Boolean));
    return Array.from(types).sort() as string[];
  }, [amiibos]);

  const uniqueSeries = useMemo(() => {
    const series = new Set(amiibos.map(a => a.series).filter(Boolean));
    return Array.from(series).sort() as string[];
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

  const hasActiveFilters = filters.search || filters.type || filters.series;

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
      return matchesSearch && matchesType && matchesSeries;
    });
  }, [amiibos, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAmiibos.length / ITEMS_PER_PAGE);
  const paginatedAmiibos = filteredAmiibos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                  <TableHead>{t('admin.series')}</TableHead>
                  <TableHead>{t('admin.type')}</TableHead>
                  <TableHead className="text-right">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAmiibos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => 
        setEditDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="sm:max-w-lg">
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
              <Label htmlFor="image_path">{t('admin.imagePath')}</Label>
              <Input
                id="image_path"
                value={formData.image_path || ''}
                onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                placeholder="image.png"
              />
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
