import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for toggle loading
  const [togglingId, setTogglingId] = useState(null);

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get('/slack/workspaces');
        setWorkspaces(response.data);
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
        setError('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleConnectSlack = () => {
    window.location.href = 'http://localhost:4000/slack/install';
  };

  const handleToggleWorkspace = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const response = await api.patch(`/slack/workspaces/${id}`, {
        isActive: !currentStatus
      });
      
      // Update local state
      setWorkspaces(workspaces.map(ws => 
        ws.id === id ? { ...ws, isActive: response.data.isActive } : ws
      ));
    } catch (err) {
      console.error('Failed to toggle workspace:', err);
      alert('Failed to update workspace status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (workspace) => {
    setWorkspaceToDelete(workspace);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete) return;
    
    setDeleting(true);
    try {
      await api.delete(`/slack/workspaces/${workspaceToDelete.id}`);
      
      // Remove from local state
      setWorkspaces(workspaces.filter(ws => ws.id !== workspaceToDelete.id));
      setDeleteModalOpen(false);
      setWorkspaceToDelete(null);
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      alert('Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setWorkspaceToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 space-y-8 relative">
      {/* User Profile Card */}
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

      {/* Slack Workspaces Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="flex items-center mb-6">
           <svg className="w-8 h-8 text-gray-700 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.52v2.52h-2.52zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.522-2.521v-2.52h2.522zM15.166 17.688a2.527 2.527 0 0 1-2.522-2.521 2.527 2.527 0 0 1 2.522-2.521h6.312A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/>
           </svg>
           <h2 className="text-2xl font-bold text-gray-900">Slack Workspaces</h2>
        </div>

        <button
          onClick={handleConnectSlack}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition transform hover:scale-105 flex items-center justify-center mb-8 shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
             <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.52v2.52h-2.52zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.522-2.521v-2.52h2.522zM15.166 17.688a2.527 2.527 0 0 1-2.522-2.521 2.527 2.527 0 0 1 2.522-2.521h6.312A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/>
          </svg>
          Connect Slack Workspace
        </button>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Connected Workspaces</h3>
          
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading workspaces...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No workspaces connected yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition duration-200 flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">{workspace.slackTeamName}</h4>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        workspace.isActive 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {workspace.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono mb-1">ID: {workspace.slackTeamId}</p>
                    <p className="text-xs text-gray-400">
                      Connected on {new Date(workspace.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleWorkspace(workspace.id, workspace.isActive)}
                      disabled={togglingId === workspace.id}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        workspace.isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } ${togglingId === workspace.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {togglingId === workspace.id ? '...' : workspace.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(workspace)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Workspace"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Workspace?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the workspace connection for <span className="font-semibold">{workspaceToDelete?.slackTeamName}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
