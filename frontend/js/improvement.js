console.log("improvement.js loaded");

const params = new URLSearchParams(window.location.search);

const inspectionId = params.get("id");

console.log("inspectionId:", inspectionId);

const inspectionNumberEl =
    document.getElementById("inspectionNumber");

console.log(inspectionNumberEl);
inspectionNumberEl.textContent = "INSP-001";

document.getElementById("description")
    .textContent = "施工現場未配戴安全帽";