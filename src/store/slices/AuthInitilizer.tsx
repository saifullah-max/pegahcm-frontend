import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { markAuthHydrated, setCredentials, setPermissions } from "./authSlice";
import { jwtDecode } from "jwt-decode";

const AuthInitializer = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const rawPermissions = localStorage.getItem("permissions");

        // ✅ Load permissions into Redux
        if (rawPermissions) {
            try {
                const parsed = JSON.parse(rawPermissions);
                dispatch(setPermissions(parsed));
                console.log("✅ Loaded permissions from localStorage:", parsed);
            } catch (err) {
                console.error("❌ Failed to parse permissions from localStorage:", err);
            }
        }

        // ✅ Decode and set user from token
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                console.log("DOCODED:", decoded);
                dispatch(
                    setCredentials({
                        user: {
                            id: decoded.userId,
                            username: decoded.username,
                            fullName: decoded.fullName || decoded.username,
                            email: decoded.email || decoded.username,
                            employee: decoded.employee,
                            role: decoded.role,
                            subRole: decoded.subRole || null,
                            impersonatedBy: decoded.impersonatedBy || null,
                            status: "active",
                        },
                        token,
                    })
                );
            } catch (err) {
                console.error("Token decoding failed:", err);
            }
        } else {
            console.log(" No token found in localStorage.");
        }

        dispatch(markAuthHydrated());
    }, [dispatch]);

    return null;
};

export default AuthInitializer;
