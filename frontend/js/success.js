document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const number = params.get("number");
    const abnormal = params.get("abnormal") === "true"; // 轉成布林值

    document.getElementById("inspectionNumber").innerText = `巡檢編號: ${number}`;

    const title = document.getElementById("successTitle");

    const statusText = document.getElementById("statusText");
    if (abnormal) {
        title.innerText = "⚠ 巡檢系統異常，已回報";
        statusText.innerText = "系統已自動發送 LINE 通知";
        statusText.style.color = "red";
    } else {
        title.innerText = "✅ 巡檢紀錄填寫完成";
        statusText.innerText = "巡檢正常，已儲存至歷史紀錄。";
        statusText.style.color = "green";
    }

    console.log(params.get("abnormal"));

    document.getElementById("viewLink").href =
        `inspection-detail.html?number=${number}`;


});

