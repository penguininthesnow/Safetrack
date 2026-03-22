
// 載入會員清單
async function loadMembers() {
    const token = localStorage.getItem("token");
    const keyword = document.getElementById("searchKeyword").value;

    const response = await fetch(`${API_BASE}/users`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status === 403) {
        alert("沒有權限查看此頁面");
        location.href = "index.html";
        return;
    }

    if (!response.ok) {
        alert("載入會員資料失敗");
        return;
    }

    const members = await response.json();

    const filteredMembers = keyword
        ? members.filter(member =>
            (member.name && member.name.includes(keyword)) ||
            (member.username && member.username.includes(keyword))
        )
        : members;

    const tbody = document.getElementById("memberTableBody");
    tbody.innerHTML = "";

    filteredMembers.forEach(member => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${member.name || ""}</td>
            <td>${member.username}</td>
            <td>${member.email || ""}</td>
            <td>${member.role === "admin" ? "主管" : "現場人員"}</td>
            <td>
                <select id="role-${member.id}">
                    <option value="staff" ${member.role === "staff" ? "selected" : ""}>現場人員</option>
                    <option value="admin" ${member.role === "admin" ? "selected" : ""}>主管</option>
                </select>
            </td>
            <td>
                <button onclick="updateMemberRole(${member.id})">儲存</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateMemberRole(userId) {
    const token = localStorage.getItem("token");
    const role = document.getElementById(`role-${userId}`).value;

    const response = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role })
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.detail || "無權限，修改失敗");
        return;
    }

    alert(result.message || "職位更新成功");
    loadMembers();
}


document.addEventListener("DOMContentLoaded", () => {
    loadMembers();

    const searchInput = document.getElementById("searchKeyword");
    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                loadMembers();
            }
        });
    }
});