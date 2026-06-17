import { Redirect } from "wouter";
export default function ProtectedRoute({ component: Component, }) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Redirect to="/signin"/>;
    }
    return <Component />;
}
