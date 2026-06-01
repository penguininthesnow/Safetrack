const params = new URLSearchParams(window.location.search);

const inspectionId = params.get("id");
// 載入頁面資料    
document.addEventListener("DOMContentLoaded", async () => {

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

// 提交改善按鈕設計
document.getElementById("submitBtn")
    .addEventListener("click", async () => {
        try {
            const improvementText = document.getElementById("improvementText").value;
            const status = document.getElementById("statusSelect").value;

            // request body
            const requestData = {
                inspection_id: Number(inspectionId),
                improvement_text: improvementText,
                status: status
            };
            console.log(requestData);


            // POST API
            const response = await fetch(
                "/api/improvements/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                throw new Error("提交改善失敗");
            }
            const result = await response.json();
            console.log(result);
            alert("改善資料提交成功!")
        } catch (error) {
            console.error(error);
            alert("提交失敗~");
        }
    });

