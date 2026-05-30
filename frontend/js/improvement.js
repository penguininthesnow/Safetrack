console.log("improvement.js loaded");

const params = new URLSearchParams(window.location.search);

const inspectionId = params.get("id");

console.log(inspectionId);

document.getElementById("inspectionNumber")
    .textContent = "INSP-001";

document.getElementById("description")
    .textContent = "施工現場未配戴安全帽";