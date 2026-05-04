// DOM
document.addEventListener("DOMContentLoaded", async () => {
    await loadYears(); // 等這個跑完再跑後面的
    setupTabs();
    loadSidebarYears();

    // 讀取 URL 參數
    const params = new URLSearchParams(window.location.search);
    const yearFromUrl = params.get("year");
    const abnormalFromUrl = params.get("abnormal");

    if (yearFromUrl) {
        document.getElementById("yearSelect").value = yearFromUrl;
    }
    if (abnormalFromUrl) {
        document.getElementById("abnormalFilter").value = abnormalFromUrl;
    }

    // 切換按鈕
    const chartBtn = document.getElementById('chartTypeBtn');
    if (chartBtn) {
        chartBtn.addEventListener('click', () => {
            chartType = chartType === 'pie' ? 'bar' : 'pie';

            renderChart(currentData);

            chartBtn.innerText =
                chartType === 'pie' ? '切換長條圖' : '切換圓餅圖';
        });
    }

    loadInspections();

    document.getElementById("searchBtn").addEventListener("click", loadInspections);
    document.getElementById("downloadCsvBtn").addEventListener("click", downloadCsv);


});


// 動態載入年份清單
async function loadYears() {
    const response = await fetch(`${API_BASE}/inspections/years`);
    const years = await response.json();

    const select = document.getElementById("yearSelect");
    select.innerHTML = "";

    // 加入全部年份選項:
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "全部年份";
    select.appendChild(allOption);

    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = `${year} 年`;
        select.appendChild(option);
    });
}

// document.addEventListener("DOMContentLoaded", loadYears);

// 分頁 tab 切換
function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            panels.forEach(p => p.style.display = "none");
            document.getElementById(tab.dataset.tab).style.display = "block";
        });
    });
}

function showTab(tabName) {
    document.getElementById("records").style.display = "none";
    document.getElementById("stats").style.display = "none";
    document.getElementById(tabName).style.display = "block";


    if (tabName === "stats") {
        chartType = "pie";
        renderChart(currentData);
    }
}

// 根據年份、地點、項目、異常篩選查詢
async function loadInspections() {
    const year = document.getElementById("yearSelect").value;
    const location = document.getElementById("locationFilter").value;
    const item = document.getElementById("itemFilter").value;
    const abnormal = document.getElementById("abnormalFilter").value;

    let url = `${API_BASE}/inspections`;

    const params = [];

    if (year && year !== "all") {
        params.push(`year=${year}`);
    }
    if (location) {
        params.push(`location=${location}`);
    }
    if (item) {
        params.push(`item=${item}`);
    }
    if (abnormal !== "") {
        params.push(`is_abnormal=${abnormal}`);
    }

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    const response = await fetch(url);
    const data = await response.json();

    currentData = data;

    renderTable(data);
    populateLocationOptions(data);


    const activeTab = document.querySelector(".tab.active").dataset.tab;
    if (activeTab === "stats") {
        renderChart(data);
    }
}

// 巡檢地點 : 渲染動態生成下拉式選單
function populateLocationOptions(data) {
    const select = document.getElementById("locationFilter");

    const locations = [...new Set(data.map(i => i.location))];

    // 清空（保留第一個）
    select.innerHTML = '<option value="">全部地點</option>';

    locations.forEach(loc => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        select.appendChild(option);
    });
}

// 動態生成表格
function renderTable(data) {
    const tbody = document.querySelector("#inspectionTable tbody");
    tbody.innerHTML = "";
    data.forEach(ins => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${ins.inspection_number}</td>
        <td>${ins.date}</td>
        <td>${ins.location}</td>
        <td>${ins.item}</td>
        <td>${ins.is_abnormal ? "異常" : "正常"}</td>
        <td>${ins.description}</td>
        <td class="action-buttons">
            <button class="preview-btn" onclick="previewInspection('${ins.inspection_number}')">預覽</button>
            <button class="edit-btn" onclick="editInspection(${ins.id})">修改</button>
            <button class="delete-btn" onclick="deleteInspection(${ins.id})">刪除</button>
        </td>
        `;
        tbody.appendChild(tr);
    });

}

// 預覽頁面
function previewInspection(inspectionNumber) {
    window.location.href = `inspection-detail.html?number=${inspectionNumber}`;
}

// 編輯表單
function editInspection(id) {
    window.location.href = `inspection-edit.html?id=${id}`;
}

// 刪除表單
async function deleteInspection(id) {
    const confirmed = confirm("確定要刪除這筆巡檢紀錄嗎?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE}/inspections/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "刪除失敗");
            return;
        }

        alert("刪除成功!");

        // 刪除完重新載入
        loadInspections();
    } catch (error) {
        console.error("刪除失敗", error);
        alert("刪除失敗!");
    }
}

// 異常統計圖表
let chartType = 'pie'; // 初始圓餅圖
let currentData = [];

function renderChart(data) {
    const ctx = document.getElementById('inspectionChart').getContext('2d');
    const abnormalCount = data.filter(i => i.is_abnormal).length;
    const normalCount = data.length - abnormalCount;
    const customLegend = document.getElementById("customLegend");

    if (chartType === 'pie') {
        customLegend.style.display = "none";
    } else {
        customLegend.style.display = "flex";
    }

    // 防呆
    if (window.inspectionChart && typeof window.inspectionChart.destroy === "function") {
        window.inspectionChart.destroy();
    }

    const chartData = {
        labels: ['正常', '異常'],
        datasets: [{
            data: [normalCount, abnormalCount],
            backgroundColor: ['#4CAF50', '#F44336']
        }]
    };


    window.inspectionChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            plugins: {
                legend: {
                    display: chartType === 'pie'
                }
            },
            responsive: true
        }
    });
}


// 下載 CSV
function downloadCsv() {
    const rows = [["巡檢編號", "日期", "地點", "項目", "異常", "說明"]];
    document.querySelectorAll("#inspectionTable tbody tr").forEach(tr => {
        const cols = Array.from(tr.children)
            .map(td => td.textContent)
            .slice(0, -1) // 排除功能操作那一欄
        rows.push(cols);
    });
    const csvContent = rows.map(row => row.join(",")).join("\n");

    // 加入 BOM 避免亂碼
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inspection_record.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    // const encodeUri = encodeURI(csvContent);
    // const link = document.createElement("a");
    // link.setAttribute("href", encodeUri);
    // link.setAttribute("download", "inspection_records.csv");
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
}