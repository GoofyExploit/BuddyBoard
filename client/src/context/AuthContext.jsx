import { createContext, use, useContext, useEffect, useState } from "react";
import { getMe} from "../api/auth.api.js";

const AuthContext = createContext();

// useEffect function to fetch user data - AuthProvider
const AuthProvider = ({ children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        getMe()
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
            // here loading is used to check whether the user data is being fetched or not
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading}}>
            {children}
        </AuthContext.Provider>
        // here children are the components wrapped inside AuthProvider in App.jsx
    )
}

// custom hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
}

// exporting AuthProvider
export  {AuthProvider};
    

