import React from "react";
import Card from "../../UI/Card";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const formatDate = (d) => new Date(d).toLocaleDateString("pl-PL");

const statusColor = (s) =>
  s === "pending"
    ? "text-yellow-600 bg-yellow-100"
    : s === "accepted"
    ? "text-green-600 bg-green-100"
    : s === "rejected"
    ? "text-red-600 bg-red-100"
    : "text-gray-600 bg-gray-100";

const statusIcon = (s) =>
  s === "pending" ? (
    <AlertCircle className="w-4 h-4" />
  ) : s === "accepted" ? (
    <CheckCircle className="w-4 h-4" />
  ) : s === "rejected" ? (
    <XCircle className="w-4 h-4" />
  ) : (
    <Clock className="w-4 h-4" />
  );

const statusText = (s) =>
  s === "pending"
    ? "Oczekuje"
    : s === "accepted"
    ? "Zaakceptowany"
    : s === "rejected"
    ? "Odrzucony"
    : "Nieznany";

export default function ApplicationsList({ applications, castings }) {
  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-[#2B2628]">
          Moje zgłoszenia
        </h2>
      </Card.Header>
      <Card.Content>
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nie masz jeszcze żadnych zgłoszeń
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => {
              const casting = castings.find(
                (c) => c.id === application.castingId
              );
              if (!casting) return null;
              return (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">
                    {casting.title}
                  </h3>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                      application.status
                    )}`}
                  >
                    {statusIcon(application.status)}
                    <span className="ml-1">
                      {statusText(application.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Zgłoszono: {formatDate(application.appliedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
