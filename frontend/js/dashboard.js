// 巡檢統計, 儀表板功能
function gotoInspection() {
    const token = localStorage.getItem("token")

    if (!token) {
        openModal();
        return;
    }

    // 已登入 => 導向巡檢頁
    window.location.href = "inspection.html"
}


// 異常分析圖表
function loadStats(year) {
    fetch(`${API_BASE}/inspections/${year}/stats`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('chart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['異常數量'],
                    datasets: [{
                        label: `${year}年`,
                        data: [data.total_abnormal]
                    }]
                }
            });
        });
}