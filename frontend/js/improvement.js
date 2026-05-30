const params = new URLSearchParams(window.location.search);

const inspectionId = params.get("id");

console.log(inspectionId);