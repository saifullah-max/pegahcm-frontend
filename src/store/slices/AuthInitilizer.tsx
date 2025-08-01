// components/AuthInitializer.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { markAuthHydrated, setCredentials } from "./authSlice";
import { jwtDecode } from "jwt-decode";

const AuthInitializer = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);
        if (token) {

            try {
                const decoded: any = jwtDecode(token);
                console.log("Decoded Token:", decoded);
                console.log("Dispatching setCredentials with:", {
                    user: {
                        id: decoded.userId,
                        username: decoded.username,
                        fullName: decoded.fullName || "",
                        email: decoded.email || "",
                        role: decoded.role,
                        subRole: decoded.subRole || null,
                        status: "active"
                    },
                    token
                });

                dispatch(setCredentials({
                    user: {
                        id: decoded.userId,
                        username: decoded.username,
                        fullName: decoded.fullName || decoded.username, // fallback
                        email: decoded.email || decoded.username, // fallback
                        employee: decoded.employee,
                        role: decoded.role,
                        subRole: decoded.subRole || null,
                        impersonatedBy: decoded.impersonatedBy || null,
                        status: "active"
                    },
                    token
                }));
                dispatch(markAuthHydrated()); // ✅ mark as initialized
            } catch (err) {
                console.error("Token decoding failed:", err);
            }
        } else {
            console.log("No token found.");
        }
    }, [dispatch]);

    return null; // nothing rendered
};

export default AuthInitializer;
