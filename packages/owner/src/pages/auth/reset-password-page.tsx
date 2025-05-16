import React, { useState } from 'react';
import {
  Button, Input, Text, Snackbar, IconButton, styled, memoTheme
} from '@funext/ui';

import { useNavigate } from 'react-router';

import ArrowBackIcon from '@funext/icons/ArrowBack';
import LoginLayout from './LoginLayout';
import useQuery from '../../hooks/use-query';
import { useCatch } from '../../hooks/use-catch';
import { snackBarDurationShortMs } from '~/utils/constant';
import { i18n } from '~/utils/i18n';


const PREFIX = 'ResetPassword';

export const ResetPasswordClasses = {
  container: `${PREFIX}-success`,
  header: `${PREFIX}-error`,
  title: `${PREFIX}-warning`
};

const ContainerRoot = styled('div')(memoTheme(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  [`& .${ResetPasswordClasses.header}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${ResetPasswordClasses.title}`]:{
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: 'uppercase',
  },
})));

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const t = i18n.get;
  const query = useQuery();

  const token = query.get('passwordReset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    let response;
    if (!token) {
      response = await fetch('/api/password/reset', {
        method: 'POST',
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      response = await fetch('/api/password/update', {
        method: 'POST',
        body: new URLSearchParams(`token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`),
      });
    }
    if (response.ok) {
      setSnackbarOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <LoginLayout>
      <ContainerRoot className={ResetPasswordClasses.container}>
        <div className={ResetPasswordClasses.header}>
          <IconButton color="primary" onClick={() => navigate('/login')}>
            <ArrowBackIcon />
          </IconButton>
          <Text className={ResetPasswordClasses.title} color="primary">
            {t('loginReset')}
          </Text>
        </div>
        {!token ? (
          <Input
            required
            type="email"
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            onChange={(event:any) => setEmail(event.target.value)}
          />
        ) : (
          <Input
            required
            label={t('userPassword')}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(event:any) => setPassword(event.target.value)}
          />
        )}
        <Button
          variant="filled"
          color="secondary"
          type="submit"
          onClick={handleSubmit}
          disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
          fullWidth
        >
          {t('loginReset')}
        </Button>
      </ContainerRoot>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate('/login')}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t('loginResetSuccess') : t('loginUpdateSuccess')}
      />
    </LoginLayout>
  );
};

export default ResetPasswordPage;
