import { useContext } from 'react';

import { OnboardingDialogContext } from '-/components/dialogs/hooks/OnboardingDialogContextProvider';

export const useOnboardingDialogContext = () =>
  useContext(OnboardingDialogContext);
