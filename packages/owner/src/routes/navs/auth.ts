export default {
  path: "/auth",
  segment: "auth",
  CP: "AuthLayout",
  props: {
    isLayout: true,
    lazy: true,
    layout: {
      enable: false
    }
  },
  //showNav: false,
  title: "Auth",
  children: [
    {
      title: "Login",
      path: "login",
      CP: "LoginPage",
      props: {
        lazy: true
      },
    },
    {
      path: "rest-password",
      CP: "ResetPasswordPage",
      props: {
        lazy: true
      },
    },
    {
      path: "forgot-password",
      CP: "Welcome",
    },
  ],
};
