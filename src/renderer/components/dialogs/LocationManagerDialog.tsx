import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DialogCloseButton from '-/components/common/DialogCloseButton';
import GenericDialog from '-/components/common/GenericDialog';
import { actions as AppActions } from '-/reducers/app';
import { actions as LocationsActions } from '-/reducers/locations';
import { getLocations } from '-/reducers/locations';
import { List, ListItem, ListItemText } from '@mui/material';

const sortSubfoldersCaseInsensitive = (a, b) =>
  (a?.name || '').localeCompare(b?.name || '', undefined, {
    sensitivity: 'base',
  });

export default function LocationManagerDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const locations = useSelector(getLocations);

  const sortedLocations = [...locations].sort(sortSubfoldersCaseInsensitive);

  return (
    <GenericDialog
      title={t('core:locationManager')}
      open
      onClose={() => dispatch(AppActions.toggleLocationManagerDialog())}
      actions={<DialogCloseButton onClose={() => dispatch(AppActions.toggleLocationManagerDialog())} />}
    >
      <List>
        {sortedLocations.map(location => (
          <ListItem
            key={location.uuid}
            button
            onClick={() => dispatch(LocationsActions.selectLocation(location.uuid))}
          >
            <ListItemText primary={location.name} />
          </ListItem>
        ))}
      </List>
    </GenericDialog>
  );
}
