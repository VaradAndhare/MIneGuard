import { Redirect } from "wouter";

export default function ProtectedRoute({
  component: Component,
}: any) {

  const token =
    localStorage.getItem("token");

  if (!token) {
    return <Redirect to="/signin" />;
  }

  return <Component />;
}