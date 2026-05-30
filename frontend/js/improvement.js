document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);

    const inspectionId = params.get("id");

    console.log("inspectionId:", inspectionId);

    try {
        const response = await fetch(
            `/api/inspections/${inspectionId}`
        );

        if (!response.ok) {
            throw new Error("取得巡檢資料失敗");
        }

        const data = await response.json();
        console.log(data);

        document.getElementById("inspectionNumber")
            .textContent = data.inspection_number;

        document.getElementById("description")
            .textContent = data.description;

        if (data.image_url) {
            document.getElementById("previewImage")
                .src = data.image_url;
        }

    } catch (error) {
        console.error(error);
        alert("載入巡檢資料失敗");
    }

});


// console.log("improvement.js loaded");



