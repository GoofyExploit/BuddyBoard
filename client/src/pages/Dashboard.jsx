import {useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const {user} = useAuth();

    return (
        <div className = "flex">
            <aside>SideBar</aside>
            <main>
                <h1>Welcome, {user?.name}</h1>
                <button>Create Note</button>
            </main>
        </div>
    );
}
export default Dashboard;