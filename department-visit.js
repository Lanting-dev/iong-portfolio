(function () {
  const currentDepartment = document.documentElement.dataset.department;
  if (!currentDepartment) return;

  const visitedKey = "iongVisitedDepartments";
  const timesKey = "iongDepartmentPanelTimes";
  const lastInteractedKey = "iongLastInteractedDepartment";
  const startedAt = performance.now();
  let saved = false;

  function readTimes() {
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

  function saveElapsedTime() {
    if (saved) return;
    saved = true;

    try {
      const times = readTimes();
      times[currentDepartment] += performance.now() - startedAt;
      window.sessionStorage.setItem(timesKey, JSON.stringify(times));
    } catch (error) {
      // Storage can be unavailable in private contexts; the page still works.
    }
  }

  try {
    const visited = JSON.parse(window.sessionStorage.getItem(visitedKey) || "{}");
    visited[currentDepartment] = true;
    window.sessionStorage.setItem(visitedKey, JSON.stringify(visited));
    window.sessionStorage.setItem(lastInteractedKey, currentDepartment);
  } catch (error) {
    // The site still works when storage is unavailable.
  }

  window.addEventListener("pagehide", saveElapsedTime);
  window.addEventListener("beforeunload", saveElapsedTime);
})();
