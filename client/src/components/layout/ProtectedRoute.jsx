import {Navigate} from 'react-router-dom';
// A <Navigate> element changes the current location when it is rendered. 
// It's a component wrapper around useNavigate, and accepts all the same arguments as props.
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const {user, loading} = useAuth();
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;