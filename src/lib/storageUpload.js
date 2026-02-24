import { supabase } from '@/lib/customSupabaseClient';

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

const normalizeMimeType = (type) => (typeof type === 'string' ? type.trim().toLowerCase() : '');

const safeExtFromFile = (file) => {
  const fileName = typeof file?.name === 'string' ? file.name : '';
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  return (ext || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getUploadErrorMessage = (error, fallback = 'Opplasting feilet.') => {
  const message = [
    error?.message,
    error?.error_description,
    error?.details,
    error?.cause?.message,
  ].find((value) => typeof value === 'string' && value.trim());

  if (!message) {
    return fallback;
  }

  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Nettverksfeil mot bildelagring. Prøv hard refresh og forsøk igjen.';
  }

  return message;
};

export async function uploadImageToPublicBucket({
  file,
  bucket = 'Images',
  folder = '',
  prefix = 'image',
  allowedTypes = null,
  maxBytes = DEFAULT_MAX_BYTES,
}) {
  if (!file) {
    throw new Error('Ingen fil valgt.');
  }

  const mimeType = normalizeMimeType(file.type);

  if (Array.isArray(allowedTypes) && allowedTypes.length > 0) {
    const normalizedAllowedTypes = allowedTypes.map(normalizeMimeType);
    if (mimeType && !normalizedAllowedTypes.includes(mimeType)) {
      throw new Error(`Filtypen støttes ikke (${file.type}).`);
    }
  }

  if (typeof file.size === 'number' && file.size > maxBytes) {
    throw new Error(`Filen er for stor (maks ${Math.round(maxBytes / (1024 * 1024))} MB).`);
  }

  const ext = safeExtFromFile(file);
  const cleanedFolder = folder.replace(/^\/+|\/+$/g, '');
  const fileName = `${prefix}-${generateId()}.${ext}`;
  const filePath = cleanedFolder ? `${cleanedFolder}/${fileName}` : fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      ...(mimeType ? { contentType: mimeType } : {}),
    });

  if (uploadError) {
    console.error('Supabase Storage Upload Error:', {
      error: uploadError,
      bucket,
      filePath,
      mimeType,
    });
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('Kunne ikke generere offentlig URL for opplastet bilde.');
  }

  return {
    filePath,
    publicUrl: data.publicUrl,
  };
}
