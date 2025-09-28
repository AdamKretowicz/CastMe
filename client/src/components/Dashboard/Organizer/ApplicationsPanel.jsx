// src/components/Dashboard/Organizer/ApplicationsPanel.jsx
import Card from "../../UI/Card";
import Button from "../../UI/Button";
import { AlertCircle, CheckCircle, Users, XCircle } from "lucide-react";
import { apiFetch } from "../../../utils/api";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "accepted":
      return "text-green-600 bg-green-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return <AlertCircle className="w-4 h-4" />;
    case "accepted":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function ApplicationsPanel({
  selectedCasting,
  getCastingApplications,
}) {
  const handleUpdateStatus = async (applicationId, newStatus) => {
    if (!selectedCasting) return;
    try {
      await apiFetch(
        `/casting/casting/${applicationId}/status?castingId=${selectedCasting.id}&status=${newStatus}`,
        { method: "GET" }
      );
      await getCastingApplications(selectedCasting.id);
      alert(
        newStatus === "accepted"
          ? "Zgłoszenie zaakceptowane"
          : "Zgłoszenie odrzucone"
      );
    } catch (err) {
      console.error("Błąd przy zmianie statusu:", err);
      alert("Nie udało się zmienić statusu zgłoszenia");
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-[#2B2628]">
          {selectedCasting
            ? `Zgłoszenia: ${selectedCasting.title}`
            : "Wybierz casting"}
        </h2>
      </Card.Header>
      <Card.Content>
        {!selectedCasting ? (
          <p className="text-gray-500 text-center py-4">
            Wybierz casting, aby zobaczyć zgłoszenia
          </p>
        ) : (
          (() => {
            const castingApplications =
              getCastingApplications(selectedCasting.id) || [];
            return !castingApplications.length ? (
              <p className="text-gray-500 text-center py-4">
                Brak zgłoszeń do tego castingu
              </p>
            ) : (
              <div className="space-y-4">
                {castingApplications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      {application.status === "pending" && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(application.id, "accepted")
                            }
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Akceptuj
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(application.id, "rejected")
                            }
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Odrzuć
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Użytkownik #{application.userId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Zgłoszono:{" "}
                            {new Date(application.appliedAt).toLocaleDateString(
                              "pl-PL"
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="ml-1">
                          {application.status === "pending"
                            ? "Oczekuje"
                            : application.status === "accepted"
                            ? "Zaakceptowany"
                            : "Odrzucony"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </Card.Content>
    </Card>
  );
}
