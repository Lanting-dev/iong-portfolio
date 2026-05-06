const departments = {
  mete: {
    label: "METE SYSTEMS",
    code: "MS-001",
    color: "#2a8a7a",
    subtitle: "Assigned through sustained nutritional systems engagement."
  },
  hael: {
    label: "HÆL INTELLIGENCE",
    code: "HI-003",
    color: "#6aa6ff",
    subtitle: "Assigned through sustained biometric intelligence engagement."
  },
  wel: {
    label: "WĒL OUTREACH",
    code: "WO-002",
    color: "#e8eaeb",
    subtitle: "Assigned through sustained outreach and flow engagement."
  }
};

const assignedKey = "iongAssignedDepartment";
const assigned = window.sessionStorage.getItem(assignedKey) || "mete";
const department = departments[assigned] || departments.mete;

document.documentElement.style.setProperty("--assigned", department.color);
document.querySelector("[data-assigned-label]").textContent = department.label;
document.querySelector("[data-assigned-subtitle]").textContent = department.subtitle;
document.querySelector("[data-assigned-code]").textContent = department.code;
