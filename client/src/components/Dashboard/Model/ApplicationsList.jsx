import Card from "../../UI/Card";
import { Calendar, MapPin, BadgeCheck, Clock, XCircle } from "lucide-react";

function StatusPill({ status }) {
  const s = String(status).toLowerCase();
  if (s === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-50 text-green-800">
        <BadgeCheck className="w-3.5 h-3.5" />
        Zaakceptowano
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-800">
        <Clock className="w-3.5 h-3.5" />
        Oczekujące
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-50 text-red-800">
        <XCircle className="w-3.5 h-3.5" />
        Odrzucono
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

export default function ApplicationsList({ applications, castings }) {
  // applications: [{ castingId, assignmentId, assignmentStatus, role, title?, eventDate?, location? }]
  const rows = Array.isArray(aplicationsFix(applications)) ? applications : [];

  function aplicationsFix(a) {
    // helper defensive only
    return a;
  }

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-[#2B2628]">
          Moje zgłoszenia
        </h2>
      </Card.Header>
      <Card.Content>
        {!rows.length ? (
          <p className="text-gray-500 text-center py-4">Brak zgłoszeń.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const title =
                row.title ||
                castings?.find((c) => c.id === row.castingId)?.title ||
                "—";
              const location =
                row.location ||
                castings?.find((c) => c.id === row.castingId)?.location ||
                "—";
              const eventDate =
                row.eventDate ||
                castings?.find((c) => c.id === row.castingId)?.eventDate ||
                null;
              return (
                <div
                  key={row.assignmentId || row.castingId}
                  className="border rounded-lg p-3 bg-white flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {title}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {location}
                      </span>
                      <span className="inline-flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {eventDate
                          ? new Date(eventDate).toLocaleDateString("pl-PL")
                          : "—"}
                      </span>
                      {row.role ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                          {roleDisplayMap[row.role] || row.role}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <StatusPill status={row.assignmentStatus} />
                </div>
              );
            })}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
