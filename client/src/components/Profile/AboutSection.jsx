import React from "react";

export default function AboutSection({ profile }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2B2628] mb-2">O mnie</h2>
        <p className="text-gray-600">{profile.description}</p>
      </div>
      {profile.experiences?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-[#2B2628] mb-2">Doświadczenie</h2>
          <ul className="space-y-3 text-gray-600">
            {profile.experiences.map(exp => (
              <li key={exp.id}>
                <p className="font-medium">{exp.projectName} - {exp.role}</p>
                <p className="text-sm">{exp.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
