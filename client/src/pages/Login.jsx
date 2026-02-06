import { useEffect } from 'react';
import buddyBoardLogo from '../images/BuddyBoard.png';

const Login = () => {
    useEffect(() => {
        document.title = 'Login - BuddyBoard';
        return () => {
            document.title = 'BuddyBoard';
        };
    }, []);

    const login = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
            {/* Orange background with blur */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500"
                style={{
                    filter: 'blur(40px)',
                    transform: 'scale(1.1)'
                }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center mb-6 drop-shadow-lg p-4">
                    <img 
                        src={buddyBoardLogo} 
                        alt="BuddyBoard" 
                        className="w-full h-auto"
                    />
                </div>
                <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-lg">Welcome to BuddyBoard</h1>
                <button
                    onClick={login}
                    className="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition font-semibold shadow-lg"
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
}

export default Login;