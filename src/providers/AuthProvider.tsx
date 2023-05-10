import { SessionProvider } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export function withAuthProvider<P>(Component: React.ComponentType<P>) {
  return function WithAuthProvider(props: P) {
    return (
      <AuthProvider>
        <Component {...(props as any)} />
      </AuthProvider>
    );
  };
}
