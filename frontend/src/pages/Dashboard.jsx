import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600">You're successfully logged in</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Full Name</span>
              <span className="text-gray-900 font-semibold">{user?.fullName}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Email Address</span>
              <span className="text-gray-900 font-semibold">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600 font-medium">User ID</span>
              <span className="text-gray-900 font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
