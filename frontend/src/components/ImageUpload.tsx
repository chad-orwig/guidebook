import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import {
  useUploadImage,
  useSetActiveImage,
  useDeleteImage,
} from '@/hooks/useCharacters';

interface ImageUploadProps {
  characterId: string;
  images: string[];
  activeImage?: string;
  onUploadComplete: () => void;
}

export function ImageUpload({
  characterId,
  images,
  activeImage,
  onUploadComplete,
}: ImageUploadProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const uploadMutation = useUploadImage(characterId);
  const setActiveMutation = useSetActiveImage(characterId);
  const deleteMutation = useDeleteImage(characterId);

  // Client-side validation
  const validateFile = (file: File): string | null => {
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > MAX_SIZE) {
      return 'File size exceeds 15MB limit';
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed';
    }

    if (images.length >= 20) {
      return 'Maximum image limit reached (20 images)';
    }

    return null;
  };

  // Upload a file
  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      try {
        await uploadMutation.mutateAsync(file);
        toast.success('Image uploaded successfully');
        onUploadComplete();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to upload image';
        toast.error(message);
      }
    },
    [uploadMutation, onUploadComplete, validateFile]
  );

  // Fetch image from URL and convert to File
  const fetchImageFromUrl = useCallback(async (url: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      // Generate filename from URL or use default
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || 'pasted-image.png';
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error fetching image from URL:', error);
      toast.error('Failed to load image from URL');
      return null;
    }
  }, []);

  // Handle file drop/select
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await uploadFile(acceptedFiles[0]);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending || images.length >= 20,
    noClick: false,
    noKeyboard: false,
  });

  // Handle paste events (Ctrl/Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if not focused on an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      // Look for image in clipboard
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Handle direct image data (from screenshots, image editors)
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });
            await uploadFile(file);
          }
          return;
        }

        // Handle text that might be an image URL
        if (item.type === 'text/plain') {
          e.preventDefault();
          item.getAsString(async (text) => {
            const trimmed = text.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              const file = await fetchImageFromUrl(trimmed);
              if (file) await uploadFile(file);
            }
          });
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [uploadFile, fetchImageFromUrl]);

  // Set image as active
  const handleSetActive = async (filename: string) => {
    try {
      await setActiveMutation.mutateAsync(filename);
      toast.success('Active image updated');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to set active image';
      toast.error(message);
    }
  };

  // Delete image with confirmation
  const handleDeleteClick = (filename: string) => {
    setImageToDelete(filename);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      await deleteMutation.mutateAsync(imageToDelete);
      toast.success('Image deleted');
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(message);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Existing images as thumbnails */}
          {images.map((filename) => {
            const isActive = filename === activeImage;
            const imageUrl = `/uploads/characters/${characterId}/${filename}`;
            const hasFailed = failedImages.has(filename);

            return (
              <Card
                key={filename}
                className={cn(
                  'relative flex-shrink-0 w-24 h-24 cursor-pointer transition-all overflow-hidden p-0',
                  isActive && 'ring-2 ring-primary'
                )}
                onClick={() => !isActive && handleSetActive(filename)}
              >
                <CardContent className="p-0 h-full bg-muted relative">
                  {!hasFailed ? (
                    <img
                      src={imageUrl}
                      alt="Character"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(filename));
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Failed</div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(filename);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Upload box */}
          {images.length < 20 && (
            <div {...getRootProps()} className="flex-shrink-0">
              <Card
                className={cn(
                  'w-24 h-24 cursor-pointer transition-all p-0',
                  'border-2 border-dashed hover:border-primary',
                  isDragActive && 'border-primary bg-primary/10',
                  uploadMutation.isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <input {...getInputProps()} />
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="text-sm text-muted-foreground">
          {images.length === 0
            ? 'Drag, paste (Ctrl/Cmd+V), or click to upload images (max 15MB)'
            : `${images.length}/20 images. Click thumbnail to set as active. Paste (Ctrl/Cmd+V) to add more.`}
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
