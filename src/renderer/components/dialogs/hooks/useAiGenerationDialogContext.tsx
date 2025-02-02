import { useContext } from 'react';

import { AiGenerationDialogContext } from '-/components/dialogs/hooks/AiGenerationDialogContextProvider';

export const useAiGenerationDialogContext = () =>
  useContext(AiGenerationDialogContext);
