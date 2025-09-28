export const roleEnumMap = {
  0: "Model",
  1: "Photographer",
  2: "Designer",
  3: "Volunteer",
};

export const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
  0: "Model",
  1: "Fotograf",
  2: "Projektant",
  3: "Wolontariusz",
};

export const getRoleDisplayName = (role) => {
  if (typeof role === "number") {
    const englishName = roleEnumMap[role];
    return (
      roleDisplayMap[englishName] || roleDisplayMap[role] || `Rola ${role}`
    );
  }
  return roleDisplayMap[role] || role;
};
