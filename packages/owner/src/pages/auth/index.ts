import React from 'react';

const AuthLayout = React.lazy(() => import("./auth-layout"));
const LoginPage = React.lazy(() => import("./login-page"));
const ResetPasswordPage = React.lazy(() => import("./reset-password-page"));

export {
  AuthLayout,
  LoginPage,
  ResetPasswordPage
}

