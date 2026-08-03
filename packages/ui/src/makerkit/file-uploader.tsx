import type { SupabaseClient } from '@supabase/supabase-js';

import { useSupabaseUpload } from '../hooks/use-supabase-upload';
import { cn } from '../lib/utils/cn';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from './dropzone';

export const FileUploader = (props: {
  className?: string;
  maxFiles: number;
  bucketName: string;
  path?: string;
  allowedMimeTypes: string[];
  maxFileSize: number | undefined;
  cacheControl?: number;
  client: SupabaseClient;
  onUploadSuccess?: (files: string[]) => void;
}) => {
  const uploader = useSupabaseUpload(props);

  return (
    <div className={cn(props.className)}>
      <Dropzone {...uploader}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};
