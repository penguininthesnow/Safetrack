document.addEventListener("DOMContentLoaded", () => {
    setupOtherItemField();
    setupFileListPreview();
});

// 控制「巡檢項目 -> 其他」輸入框顯示
function setupOtherItemField() {
    const itemSelect = document.getElementById("item");
    const otherItemInput = document.getElementById("other_item");

    if (!itemSelect || !otherItemInput) return;

    function toggleOtherItemField() {
        if (itemSelect.value === "其他") {
            otherItemInput.style.display = "block";
        } else {
            otherItemInput.style.display = "none";
            otherItemInput.value = "";
        }
    }

    itemSelect.addEventListener("change", toggleOtherItemField);

    // 頁面載入時先判斷一次
    toggleOtherItemField();
}

// 多檔上傳時，逐列顯示檔名
function setupFileListPreview() {
    const fileInput = document.getElementById("photo");
    const fileListContainer = document.getElementById("file-name-list");

    if (!fileInput || !fileListContainer) return;

    fileInput.addEventListener("change", () => {
        fileListContainer.innerHTML = "";

        const files = fileInput.files;

        if (!files || files.length === 0) {
            fileListContainer.innerHTML = "<li>尚未選擇檔案</li>";
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const li = document.createElement("li");
            li.textContent = files[i].name;
            fileListContainer.appendChild(li);
        }
    });
}

// 巡檢區
async function createInspection() {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
        openModal();
        return;
    }

    const dateValue = document.getElementById("date").value;
    const location = document.getElementById("location").value.trim();
    const itemSelectValue = document.getElementById("item").value;
    const otherItem = document.getElementById("other_item").value.trim();
    const description = document.getElementById("description").value.trim();
    const abnormalRadio = document.querySelector('input[name="abnormal"]:checked');
    const fileInput = document.getElementById("photo");

    let item = itemSelectValue;

    // 若選「其他」，實際送出的 item 改成輸入框內容
    if (itemSelectValue === "其他") {
        item = otherItem;
    }

    if (!dateValue || !location || !item || !description || !abnormalRadio) {
        alert("巡檢資料未填寫完整，請重新確認!");
        return;
    }

    const formData = new FormData();
    formData.append("date_value", dateValue);
    formData.append("location", location);
    formData.append("item", item);
    formData.append("description", description);
    formData.append("is_abnormal", abnormalRadio.value === "true");
    formData.append("abnormal_count", 0);

    // 多檔上傳
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append("files", fileInput.files[i]);
    }

    try {
        const response = await fetch(`${API_BASE}/inspections/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${savedToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href =
                `inspection-success.html?number=${data.inspection_number}&abnormal=${data.is_abnormal}`;
        } else {
            alert(data.detail || data.message || "送出失敗，請稍後再試");
        }
    } catch (error) {
        console.error("建立巡檢失敗:", error);
        alert("系統發生錯誤，請稍後再試");
    }
}

function gotoInspection() {
    const token = localStorage.getItem("token")

    if (!token) {
        openModal();
        return;
    }

    // 已登入 => 導向巡檢頁
    window.location.href = "inspection.html"
}

