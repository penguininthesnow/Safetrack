
// sidebar互動
function openSidebar() {
    document.getElementById("sidebar").style.left = "0";
    document.getElementById("sidebarOverlay").style.display = "block";

    // 顯示選單時，隱藏漢堡
    document.querySelector(".tag").style.display = "none";
}

function closeSidebar() {
    document.getElementById("sidebar").style.left = "-260px";
    document.getElementById("sidebarOverlay").style.display = "none";

    // 關閉選單時，顯示漢堡
    document.querySelector(".tag").style.display = "block";

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.style.display = "none";
}

// 通知設定用
async function loadCurrentUserForSidebar() {
    const token = localStorage.getItem("token");

    console.log("sidebar token:", token);

    if (!token) return;

    const response = await fetch(`${API_BASE}/users/member`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    console.log("sidebar response_status:", response.status);

    if (!response.ok) return;

    const user = await response.json();
    console.log("sidebar user:", user);

    const notificationMenu = document.getElementById("notificationSettingMenu");
    console.log("notificationMenu:", notificationMenu);

    if (user.role === "admin" && notificationMenu) {
        notificationMenu.style.display = "block";
    }
}

// 巡檢系統
function handleInspectionClick(event) {
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
        closeSidebar();
        openModal();
        return;
    }
    //已登入 => 展開子選單
    const parent = event.target.closest(".menu-item");
    parent.classList.toggle("open");
}
// 建立巡檢資料
function goCreateInspection(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
        closeSidebar();
        openModal();
        return;
    }
    window.location.href = "inspection.html";
}
// 查詢歷史紀錄
function goHistoryPage(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
        closeSidebar();
        openModal();
        return;
    }
    window.location.href = "inspection-history.html";
}


// sidebar 專用資料
async function loadSidebarYears() {
    try {
        const response = await fetch(`${API_BASE}/inspections/years`);
        const years = await response.json();

        const container = document.getElementById("yearList");
        container.innerHTML = "";

        years.forEach(year => {
            const link = document.createElement("a");

            link.href = `inspection-history.html?year=${year}`;
            link.textContent = `${year} 年`;

            container.appendChild(link);
        });
    } catch (err) {
        console.error("載入年份失敗", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("yearList");
    if (container) {
        loadSidebarYears();
    }
    loadCurrentUserForSidebar();
});