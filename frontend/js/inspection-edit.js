document.addEventListener("DOMContentLoaded", () => {
    loadInspectionForEdit();

    const itemSelect = document.getElementById("item");
    const otherItemInput = document.getElementById("other_item");

    if (itemSelect) {
        itemSelect.addEventListener("change", () => {
            if (itemSelect.value === "其他") {
                otherItemInput.style.display = "block";
            } else {
                otherItemInput.style.display = "none";
                otherItemInput.value = "";
            }
        });
    }
});

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// loadInspectionForEdit 進頁面先抓取目前資料
async function loadInspectionForEdit() {
    const id = getQueryParam("id");

    if (!id) {
        alert("找不到巡檢紀錄 id");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/inspections/${id}`);

        if (!response.ok) {
            throw new Error("讀取資料失敗");
        }

        const data = await response.json();

        document.getElementById("location").value = data.location || "";
        // document.getElementById("item").value = data.item || "";
        const itemSelect = document.getElementById("item");
        const otherItemInput = document.getElementById("other_item");

        const defaultOptions = ["作業人員", "機械設備", "原物料", "環境", "消防設備", "其他"];

        if (defaultOptions.includes(data.item)) {
            itemSelect.value = data.item;
        } else {
            itemSelect.value = "其他";
            otherItemInput.style.display = "block";
            otherItemInput.value = data.item || "";
        }

        document.getElementById("description").value = data.description || "";

        if (data.is_abnormal) {
            document.getElementById("abnormal_yes").checked = true;
        } else {
            document.getElementById("abnormal_no").checked = true;
        }
    } catch (error) {
        console.error("載入巡檢資料失敗", error);
        alert("載入巡檢資料失敗");
    }
}

// updateInspection 按儲存後送PUT
async function updateInspection() {
    const id = getQueryParam("id");
    const token = localStorage.getItem("token");

    console.log("token", token);

    if (!token) {
        alert("請先登入!!");
        return;
    }

    const location = document.getElementById("location").value.trim();
    // const item = document.getElementById("item").value.trim();
    let item = document.getElementById("item").value;
    const otherItem = document.getElementById("other_item").value.trim();

    if (item === "其他") {
        item = otherItem;
    }

    const description = document.getElementById("description").value.trim();
    const checked = document.querySelector('input[name="abnormal"]:checked');

    if (!location || !item || !description) {
        alert("請完整填寫資料");
        return;
    }

    const is_abnormal = checked.value;

    const formData = new FormData();
    formData.append("location", location);
    formData.append("item", item);
    formData.append("description", description);
    formData.append("is_abnormal", is_abnormal);

    try {
        const response = await fetch(`${API_BASE}/inspections/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "修改失敗");
            return;
        }

        alert("修改成功");
        window.location.href = `inspection-detail.html?number=${data.inspection_number}`;
    } catch (error) {
        console.error("修改失敗!", error);
        alert("修改失敗");
    }
}