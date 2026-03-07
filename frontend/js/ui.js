// tab切換、sidebar互動


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
// 年份查詢
function goHistoryYear(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
        closeSidebar();
        openModal();
        return;
    }

    window.location.href = "inspection-history-year.html";
}

// 年份動態顯示
function generateYearList() {
    const yearList = document.getElementById("yearList")
    if (!yearList) return

    const currentYear = new Date().getFullYear()
    for (let y = currentYear; y >= 2020; y--) {
        const a = document.createElement("a")

        a.href = `inspection-history-year.html?year=${y}`

        a.textContent = y + " 年"

        yearList.appendChild(a)
    }
}

generateYearList()
