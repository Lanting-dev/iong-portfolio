(function () {
  const currentDepartment = document.documentElement.dataset.department;
  if (!currentDepartment) return;

  const visitedKey = "iongVisitedDepartments";

  try {
    const visited = JSON.parse(window.sessionStorage.getItem(visitedKey) || "{}");
    visited[currentDepartment] = true;
    window.sessionStorage.setItem(visitedKey, JSON.stringify(visited));
  } catch (error) {
    // The site still works when storage is unavailable.
  }
})();
