import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';

const NotificationSnackbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.ui);

  const currentNotification = notifications[0];

  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(currentNotification.id));
      }, currentNotification.duration);

      return () => clearTimeout(timer);
    }
  }, [currentNotification, dispatch]);

  const handleClose = () => {
    if (currentNotification) {
      dispatch(removeNotification(currentNotification.id));
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={true}
      autoHideDuration={currentNotification.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
