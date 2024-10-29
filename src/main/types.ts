import { TS } from '-/tagspaces.namespace';

export interface Extensions {
  extensions: TS.Extension[];
  supportedFileTypes: TS.FileTypes[];
}

export interface ApiResponse {
  models: TS.Model[];
}
