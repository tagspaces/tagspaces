import { useContext } from 'react';

import { PerspectiveOnboardingContext } from '-/components/dialogs/hooks/PerspectiveOnboardingContextProvider';

export const usePerspectiveOnboardingContext = () =>
  useContext(PerspectiveOnboardingContext);
