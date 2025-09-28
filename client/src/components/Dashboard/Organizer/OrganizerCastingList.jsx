// src/components/Dashboard/Organizer/OrganizerCastingList.jsx
import Card from "../../UI/Card";
import { Calendar, MapPin } from "lucide-react";
import { BannerImage, BannerPlaceholder } from "../../UI/BannerImage";

const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

function OrganizerCastingCard({ casting, bannerUrl, selected, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-selected={selected}
      onClick={() => onSelect(casting)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(casting);
      }}
      className={[
        "border rounded-lg p-4 cursor-pointer transition-colors outline-none",
        "hover:bg-gray-50",
        "focus:ring-2 focus:ring-[#EA1A62] focus:ring-offset-0",
        selected
          ? "border-[#EA1A62] bg-pink-50 ring-2 ring-[#EA1A62]"
          : "border-gray-200",
      ].join(" ")}
    >
      <div className="w-full mb-3">
        {bannerUrl ? (
          <BannerImage
            src={bannerUrl}
            alt={`Banner castingu ${casting.title}`}
            className="rounded-lg"
          />
        ) : (
          <BannerPlaceholder />
        )}
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{casting.title}</h3>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {casting.location}
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(casting.eventDate).toLocaleDateString("pl-PL")}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-2">
        {casting.roles?.map((role, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {roleDisplayMap[role.role] || role.role} {role.acceptedCount || 0}/
            {role.capacity}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Utworzono:{" "}
          {casting.createdAt
            ? new Date(casting.createdAt).toLocaleDateString("pl-PL")
            : "-"}
        </p>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Aktywny
        </span>
      </div>
    </div>
  );
}

export default function OrganizerCastingList({
  castings,
  castingBanners,
  isLoading,
  selectedCastingId,
  onSelectCasting,
}) {
  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-[#2B2628]">Moje castingi</h2>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <p className="text-gray-500 text-center py-4">
            Ładowanie castingów...
          </p>
        ) : !castings?.length ? (
          <p className="text-gray-500 text-center py-4">
            Nie masz jeszcze żadnych castingów
          </p>
        ) : (
          <div className="space-y-4">
            {castings.map((c) => (
              <OrganizerCastingCard
                key={c.id}
                casting={c}
                bannerUrl={castingBanners[c.id]}
                selected={selectedCastingId === c.id}
                onSelect={onSelectCasting}
              />
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
