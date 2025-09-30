// src/pages/StatusUpdatePage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  fetchPendingUsers, 
  updateUserStatus, 
  getPhotoUrl,
  fetchAllPendingPhotos,
  updatePhotoStatus
} from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import {
  Clock,
  User,
  MapPin,
  Camera,
  Check,
  X,
  Users,
  RefreshCw,
  Eye,
  Image
} from "lucide-react";
import ConfirmModal from "../components/UI/ConfirmModal";


export default function StatusUpdatePage() {
  const navigate = useNavigate();
  const { accessToken, currentUser, loading: authLoading } = useAuth();

  // Tabs state
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [processingUsers, setProcessingUsers] = useState(new Set());

  // Photos state
  const [usersWithPhotos, setUsersWithPhotos] = useState([]);
  const [userPendingPhotos, setUserPendingPhotos] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Batched photo updates
  const [batchedPhotoUpdates, setBatchedPhotoUpdates] = useState([]);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
        });

  const [error, setError] = useState(null);

  useEffect(() => {
  if (authLoading) return;
  if (!currentUser) return;
  if (!accessToken) {
    navigate("/login");
    return;
  }
  if (currentUser.role !== "Admin") {
    navigate("/");
    return;
  }

  loadPendingUsers();
  loadPendingPhotos();
}, [authLoading, currentUser, accessToken, navigate]);


  // Load users
  const loadPendingUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const users = await fetchPendingUsers(accessToken);
      setPendingUsers(users || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Błąd pobierania oczekujących kont");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load photos
  const loadPendingPhotos = async () => {
    setLoadingPhotos(true);
    setError(null);
    try {
      const photos = await fetchAllPendingPhotos(accessToken);
      const photosMap = {};
      photos.forEach(photo => {
        if (!photosMap[photo.userId]) photosMap[photo.userId] = [];
        photosMap[photo.userId].push(photo);
      });
      setUserPendingPhotos(photosMap);

      const users = Object.keys(photosMap).map(userId => ({
        id: userId,
        mainPhoto: photosMap[userId][0]
      }));
      setUsersWithPhotos(users);
    } catch (err) {
      console.error(err);
      setError(err.message || "Błąd pobierania oczekujących zdjęć");
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Accept/reject user
  const handleStatusUpdate = (userId, status, event) => {
  event.stopPropagation();

  setConfirmModal({
    open: true,
    title: status === 'Active' ? 'Zaakceptuj użytkownika?' : 'Odrzuć użytkownika?',
    message: `Czy na pewno chcesz ${status === 'Active' ? 'zaakceptować' : 'odrzucić'} użytkownika?`,
    onConfirm: async () => {
      setConfirmModal(prev => ({ ...prev, open: false }));
      setProcessingUsers(prev => new Set(prev).add(userId));
      try {
        await updateUserStatus(userId, status, accessToken);
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        console.error(err);
        setError(err.message || "Błąd aktualizacji użytkownika");
      } finally {
        setProcessingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
  });
};

    // Mark all photos of a user as accepted
    const handleMarkAllAccepted = (userId) => {
    const photos = userPendingPhotos[userId] || [];
    setBatchedPhotoUpdates(prev => {
        const otherUpdates = prev.filter(p => !photos.some(photo => photo.id === p.id));
        const newUpdates = photos.map(photo => ({ id: photo.id, photoStatus: 'Active' }));
        return [...otherUpdates, ...newUpdates];
    });
    };

    // Mark all photos of a user as rejected
    const handleMarkAllRejected = (userId) => {
    const photos = userPendingPhotos[userId] || [];
    setBatchedPhotoUpdates(prev => {
        const otherUpdates = prev.filter(p => !photos.some(photo => photo.id === p.id));
        const newUpdates = photos.map(photo => ({ id: photo.id, photoStatus: 'Rejected' }));
        return [...otherUpdates, ...newUpdates];
    });
    };


  // Batch individual photo updates
    const handleBatchPhotoUpdate = (photoId, status) => {
    setBatchedPhotoUpdates(prev => {
        const existing = prev.find(p => p.id === photoId);
        if (existing) {
        // If same status clicked, remove it (toggle)
        if (existing.photoStatus === status) {
            return prev.filter(p => p.id !== photoId);
        }
        // If different status, replace
        return prev.map(p => p.id === photoId ? { ...p, photoStatus: status } : p);
        } else {
        return [...prev, { id: photoId, photoStatus: status }];
        }
    });
    };


  // Submit all batched photo updates
  const handleSubmitAllPhotoUpdates = () => {
  if (batchedPhotoUpdates.length === 0) return;

  setConfirmModal({
    open: true,
    title: "Zatwierdź wszystkie zmiany zdjęć?",
    message: "Czy na pewno chcesz zatwierdzić wszystkie zaznaczone zmiany zdjęć?",
    onConfirm: async () => {
      setConfirmModal(prev => ({ ...prev, open: false }));
      try {
        await updatePhotoStatus(batchedPhotoUpdates, accessToken);

        // Remove updated photos from state
        setUserPendingPhotos(prev => {
          const newPhotos = { ...prev };
          batchedPhotoUpdates.forEach(p => {
            Object.keys(newPhotos).forEach(uid => {
              newPhotos[uid] = newPhotos[uid].filter(photo => photo.id !== p.id);
            });
          });
          return newPhotos;
        });

        setUsersWithPhotos(prevUsers =>
          prevUsers.filter(u => (userPendingPhotos[u.id] || []).length > 0)
        );

        setBatchedPhotoUpdates([]);
      } catch (err) {
        console.error(err);
        setError("Błąd przy wysyłaniu zmian zdjęć: " + err.message);
      }
    },
  });
};


  const handleUserClick = (userId) => navigate(`/profile/${userId}`);

  const loading = activeTab === 'users' ? loadingUsers : loadingPhotos;

  if (loading) {
    return (
      <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
        <div className="max-w-6xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA1A62] mx-auto"></div>
          <p className="mt-2">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center">
            <Clock size={32} className="mr-3 text-[#EA1A62]" />
            Panel weryfikacji
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Zarządzaj oczekującymi użytkownikami i zdjęciami
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-medium transition-colors ${activeTab==='users' ? 'text-[#EA1A62] border-b-2 border-[#EA1A62]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center gap-2">
              <Users size={20} /> Użytkownicy
              <span className="bg-[#EA1A62] text-white px-2 py-1 rounded-full text-xs">{pendingUsers.length}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-4 px-4 font-medium transition-colors ${activeTab==='photos' ? 'text-[#EA1A62] border-b-2 border-[#EA1A62]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center gap-2">
              <Image size={20} /> Zdjęcia
              <span className="bg-[#EA1A62] text-white px-2 py-1 rounded-full text-xs">{usersWithPhotos.length}</span>
            </div>
          </button>
        </div>

        {/* Error */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* Refresh */}
        <div className="mb-6 flex justify-end">
          <Button onClick={activeTab==='users'?loadPendingUsers:loadPendingPhotos} variant="outline">
            <RefreshCw size={16} className="mr-2" /> Odśwież
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab==='users' && (
          pendingUsers.length===0 ? (
            <Card className="p-8 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4"/>
              <h2 className="text-2xl font-semibold mb-2 text-gray-600">Brak oczekujących kont</h2>
              <p className="text-gray-500">Wszystkie konta zostały już zatwierdzone lub odrzucone.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map(user => {
                const location = user.city && user.country ? `${user.city}, ${user.country}` : user.city||user.country||null;
                const isProcessing = processingUsers.has(user.id);
                return (
                  <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row cursor-pointer" onClick={()=>handleUserClick(user.id)}>
                      <div className="md:w-48 w-full h-48 md:h-auto bg-gray-200 flex-shrink-0 relative overflow-hidden">
                        {user.mainPhoto ? <img src={getPhotoUrl(user.mainPhoto.url)} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover hover:scale-105 transition-transform"/> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><Camera size={32} className="text-gray-400"/></div>}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div className="flex-1 mb-4">
                            <h2 className="text-2xl font-bold text-[#2b2628] mb-2">{user.firstName} {user.lastName}</h2>
                            <div className="flex items-center text-gray-600 mb-1">
                              <User size={16} className="mr-2" /> <span className="font-medium">@{user.userName}</span>
                              <span className="mx-2">•</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{user.role}</span>
                            </div>
                            {location && <div className="flex items-center text-gray-600 mb-1"><MapPin size={16} className="mr-2"/> {location}</div>}
                          </div>
                          <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 md:ml-6">
                            <Button onClick={(e)=>{e.stopPropagation(); handleUserClick(user.id)}} variant="outline" size="sm" className="flex items-center"><Eye size={16} className="mr-2"/>Profil</Button>
                            <Button onClick={(e)=>handleStatusUpdate(user.id,'Active',e)} variant="primary" size="sm" disabled={isProcessing} className="flex items-center bg-green-600 hover:bg-green-700">
                              {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Check size={16} className="mr-2"/>} Zaakceptuj
                            </Button>
                            <Button onClick={(e)=>handleStatusUpdate(user.id,'Rejected',e)} variant="primary" size="sm" disabled={isProcessing} className="flex items-center bg-red-600 hover:bg-red-700">
                              {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <X size={16} className="mr-2"/>} Odrzuć
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        )}

        {/* Photos Tab */}
        {activeTab==='photos' && (
            usersWithPhotos.length===0 ? (
                <Card className="p-8 text-center">
                <Image size={48} className="mx-auto text-gray-400 mb-4"/>
                <h2 className="text-2xl font-semibold mb-2 text-gray-600">Brak oczekujących zdjęć</h2>
                <p className="text-gray-500">Wszystkie zdjęcia zostały już zatwierdzone lub odrzucone.</p>
                </Card>
            ) : (
                <>
                {usersWithPhotos.map(user => {
                    const photos = userPendingPhotos[user.id] || [];
                    return (
                    <Card key={user.id} className="overflow-hidden">
                        {/* User info and Accept/Reject all buttons */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80" onClick={() => handleUserClick(user.id)}>
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {user.mainPhoto ? <img src={getPhotoUrl(user.mainPhoto.url)} alt="" className="w-full h-full object-cover"/> : <User size={24} className="text-gray-400"/>}
                            </div>
                            <div>
                            <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-600">@{user.userName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleMarkAllAccepted(user.id)}
                                size="sm"
                                className="bg-green-400 text-green-800 hover:bg-green-300 focus:ring-green-300"
                            >
                                Zaakceptuj wszystkie ({photos.length})
                            </Button>
                            <Button
                                onClick={() => handleMarkAllRejected(user.id)}
                                size="sm"
                                className="bg-red-400 text-red-800 hover:bg-red-300 focus:ring-red-300"
                            >
                                Odrzuć wszystkie
                            </Button>
                            </div>
                        </div>

                        {/* Photos grid */}
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {photos.map(photo => (
                            <div
                            key={photo.id}
                            className={`relative group rounded-lg overflow-hidden border-2 transition-all
                                ${batchedPhotoUpdates.find(p => p.id === photo.id)?.photoStatus === 'Active' ? 'border-green-500' : ''}
                                ${batchedPhotoUpdates.find(p => p.id === photo.id)?.photoStatus === 'Rejected' ? 'border-red-500' : 'border-gray-200'}
                                hover:border-[#EA1A62]`}
                            >
                            <img src={getPhotoUrl(photo.url)} alt={photo.originalFileName} className="w-full aspect-square object-cover"/>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <Button onClick={() => handleBatchPhotoUpdate(photo.id,'Active')} size="sm" className="flex items-center bg-green-600 hover:bg-green-700">
                                <Check size={16}/>
                                </Button>
                                <Button onClick={() => handleBatchPhotoUpdate(photo.id,'Rejected')} size="sm" className="flex items-center bg-red-600 hover:bg-red-700">
                                <X size={16}/>
                                </Button>
                            </div>
                            </div>
                        ))}
                        </div>
                    </Card>
                    );
                })}

                {/* Submit all changes button */}
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSubmitAllPhotoUpdates} size="md" className="bg-blue-600 hover:bg-blue-700" disabled={batchedPhotoUpdates.length === 0}>
                    Zatwierdź wszystkie zmiany ({batchedPhotoUpdates.length})
                    </Button>
                </div>
                </>
            )
            )}


      </div>
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={confirmModal.onConfirm}
        />
    </div>
  );
}
