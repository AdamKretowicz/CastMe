// src/components/Casting/Organizer/OrganizerDashboard.jsx
import { useMemo, useState } from "react";
import { useCasting } from "../../../context/CastingContext";
import Button from "../../UI/Button";
import { Plus } from "lucide-react";
import { useCastingBanners } from "../../../hooks/useCastingBanners";

import CreateCastingForm from "./CreateCastingForm";
import OrganizerCastingList from "./OrganizerCastingList";
import ApplicationsPanel from "./ApplicationsPanel";
import ParticipantsModal from "./ParticipantsModal"; // <-- UŻYWAMY DEDYKOWANEGO MODALA

export default function OrganizerDashboard() {
  const { castings, createCasting, getCastingApplications, isLoading } =
    useCasting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);

  // modal uczestników (dla organizatora)
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

  // nagłówek
  const header = useMemo(
    () => (
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
          Dashboard Organizatora
        </h1>
        <p className="text-gray-600">
          Zarządzaj swoimi castingami i zgłoszeniami
        </p>
      </div>
    ),
    []
  );

  // sort: createdAt DESC (fallback: eventDate DESC)
  const organizerCastings = useMemo(() => {
    const arr = Array.isArray(castings) ? [...castings] : [];
    arr.sort((a, b) => {
      const ad = new Date(a?.createdAt || a?.eventDate || 0).getTime();
      const bd = new Date(b?.createdAt || b?.eventDate || 0).getTime();
      return bd - ad;
    });
    return arr;
  }, [castings]);

  // bannery
  const { banners: castingBanners, fetchBannerFor } =
    useCastingBanners(organizerCastings);

  // otwarcie modala – klik na kartę castingu
  const openParticipantsModal = (casting) => {
    setSelectedCasting(casting);
    setParticipantsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          {header}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nowy casting
          </Button>
        </div>

        {showCreateForm && (
          <CreateCastingForm
            onClose={() => setShowCreateForm(false)}
            onCreated={() => setShowCreateForm(false)}
            createCasting={createCasting}
            onBannerUploaded={(id) => fetchBannerFor(id)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrganizerCastingList
            castings={organizerCastings}
            castingBanners={castingBanners}
            isLoading={isLoading}
            selectedCastingId={selectedCasting?.id}
            onSelectCasting={(c) => {
              setSelectedCasting(c);
              openParticipantsModal(c); // ← otwórz modal uczestników po kliknięciu karty
            }}
          />

          {/* Panel zgłoszeń zostaje po staremu (gdy dodacie statusy, wpięjemy akcje akceptacji/odrzucenia) */}
          <ApplicationsPanel
            selectedCasting={selectedCasting}
            getCastingApplications={getCastingApplications}
          />
        </div>
      </div>

      {/* Modal uczestników (avatar, imię+nazwisko, @userName, link do profilu po ID) */}
      <ParticipantsModal
        casting={selectedCasting}
        isOpen={participantsModalOpen}
        onClose={() => setParticipantsModalOpen(false)}
        onChanged={({ type, userId }) => {
          // opcjonalnie: tu możesz odświeżyć szczegóły castingu / liczniki ról po "removed"
          // np. re-fetch castings w useCasting() lub lokalna korekta acceptedCount
          // console.log(type, userId);
        }}
      />
    </div>
  );
}
