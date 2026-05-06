const departments = {
  mete: {
    label: "METE SYSTEMS",
    code: "MS-001",
    color: "#2a8a7a",
    subtitle: "Assigned through sustained nutritional systems engagement.",
    titleSize: "24px",
    titleSpacing: "3px"
  },
  hael: {
    label: "HÆL INTELLIGENCE",
    code: "HI-003",
    color: "#6aa6ff",
    subtitle: "Assigned through sustained biometric intelligence engagement.",
    titleSize: "20px",
    titleSpacing: "2px"
  },
  wel: {
    label: "WĒL OUTREACH",
    code: "WO-002",
    color: "#e8eaeb",
    subtitle: "Assigned through sustained outreach and flow engagement.",
    titleSize: "23px",
    titleSpacing: "2.6px"
  }
};

const assignedKey = "iongAssignedDepartment";
const timesKey = "iongDepartmentPanelTimes";
const lastInteractedKey = "iongLastInteractedDepartment";
const departmentOrder = ["mete", "hael", "wel"];

function readDepartmentTimes() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(timesKey) || "{}");
    return {
      mete: Number(stored.mete) || 0,
      hael: Number(stored.hael) || 0,
      wel: Number(stored.wel) || 0
    };
  } catch (error) {
    return { mete: 0, hael: 0, wel: 0 };
  }
}

function getAssignedDepartment() {
  const times = readDepartmentTimes();
  const hasTimeData = departmentOrder.some((id) => times[id] > 0);

  if (!hasTimeData) {
    return window.sessionStorage.getItem(assignedKey) || "mete";
  }

  const highestTime = Math.max(...departmentOrder.map((id) => times[id]));
  const tiedDepartments = departmentOrder.filter((id) => times[id] === highestTime);
  let assigned = tiedDepartments[0] || "mete";

  try {
    const lastInteracted = window.sessionStorage.getItem(lastInteractedKey);
    if (tiedDepartments.includes(lastInteracted)) assigned = lastInteracted;
    window.sessionStorage.setItem(assignedKey, assigned);
  } catch (error) {
    // Storage can be unavailable in private contexts; the fallback still renders.
  }

  return assigned;
}

const assigned = getAssignedDepartment();
const department = departments[assigned] || departments.mete;

document.documentElement.style.setProperty("--assigned", department.color);
document.documentElement.style.setProperty("--badge-title-size", department.titleSize);
document.documentElement.style.setProperty("--badge-title-spacing", department.titleSpacing);
document.documentElement.dataset.assignedDepartment = assigned;
document.querySelector("[data-assigned-label]").textContent = department.label;
