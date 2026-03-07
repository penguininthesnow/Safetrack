// 歷史資料
function yearList(year) {
    fetch(`${API_BASE}/api/inspections/${year}`)
        .then(res => res.json())
        .then(data => {
            renderTable(data)
        });
}

// 動態載入年份清單
async function loadYears() {
    const response = await fetch(`${API_BASE}/api/inspections/years`);
    const years = await response.json();

    const container = document.getElementById("yearList");
    container.innerHTML = "";

    years.forEach(year => {
        const link = document.createElement("a");
        link.href = `inspection-history.html?year=${year}`;
        link.innerText = `${year} 年`;
        link.style.marginLeft = "15px";
        container.appendChild(link);
    });
}

document.addEventListener("DOMContentLoaded", loadYears);

// 分頁 tab
function showTab(tabName) {
    document.getElementById("records").style.display = "none";
    document.getElementById("stats").style.display = "none";
    document.getElementById(tabName).style.display = "block";
}