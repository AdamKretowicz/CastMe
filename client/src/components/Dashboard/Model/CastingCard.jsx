import { Calendar, MapPin } from "lucide-react";
import Button from "../../UI/Button";
import { BannerImage, BannerPlaceholder } from "../../UI/BannerImage";
import { getRoleDisplayName } from "../../../constants/roles";

const formatDate = (d) => new Date(d).toLocaleDateString("pl-PL");

export default function CastingCard({
  casting,
  bannerUrl,
  hasApplied,
  onApply,
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
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

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#2B2628] mb-2">
            {casting.title}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {casting.location}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(casting.eventDate)}
            </div>
          </div>

          {casting.roles?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {casting.roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {getRoleDisplayName(role.role)} {role.acceptedCount || 0}/
                  {role.capacity}
                </span>
              ))}
            </div>
          )}

          {casting.compensation && (
            <div className="text-sm font-medium text-[#EA1A62] mb-3">
              Wynagrodzenie: {casting.compensation}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{casting.description}</p>

      {casting.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {casting.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-[#EA1A62] bg-opacity-10 text-[#FFFFFF] text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Opublikowano: {formatDate(casting.createdAt)}
        </p>
        {hasApplied ? (
          <Button variant="secondary" disabled>
            Już się zgłosiłeś
          </Button>
        ) : (
          <Button onClick={onApply}>Zgłoś się</Button>
        )}
      </div>
    </div>
  );
}
