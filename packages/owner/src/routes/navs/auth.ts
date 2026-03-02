export default {
  path: "/auth",
  segment: "auth",
  CP: "AuthLayout",
  showNav: false,
  children: [
    {
      path: "login",
      CP: "LoginPage",
    },
    {
      path: "rest-password",
      CP: "ResetPasswordPage",
    },
    {
      path: "forgot-password",
      CP: "Welcome",
    },
  ],
};
