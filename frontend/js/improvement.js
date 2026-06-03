const params = new URLSearchParams(window.location.search);

const inspectionId = params.get("id");

// 改善圖片
const imageInput =
    document.getElementById("improvementImage");
imageInput.addEventListener("change", () => {
    if (imageInput.files.length > 3) {
        alert("最多只能上傳 3 張圖片");
        imageInput.value = "";
    }
});

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

            const formData = new FormData();
            formData.append("inspection_id", Number(inspectionId));
            formData.append("improvement_text", improvementText);
            formData.append("status", status);

            // 上傳多張圖片
            const files = document.getElementById("improvementImage").files;
            for (let i = 0; i < files.length; i++) {
                formData.append("images", files[i]);
            }

            // POST API
            const response = await fetch(
                "/api/improvements/",
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error("提交改善失敗");
            }
            const result = await response.json();
            console.log(result);
            alert("改善資料提交成功!");

            window.location.href = "/inspection-history.html";
        } catch (error) {
            console.error(error);
            alert("提交失敗~");
        }
    });

