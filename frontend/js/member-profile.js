// 頁面載入時，先取得使用者資訊
async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("請先登入");
        location.href = "index.html";
        return;
    }

    const response = await fetch(`${API_BASE}/users/member`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        alert("登入已失效，請重新登入!");
        localStorage.removeItem("token");
        location.href = "index.html";
        return;
    }

    if (!response.ok) {
        alert("載入會員資料失敗");
        return;
    }

    const data = await response.json();

    document.getElementById("username").textContent = data.username;
    document.getElementById("role").textContent = data.role === "admin" ? "主管" : "現場人員";
    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("department").value = data.department || "";

    if (data.role === "admin") {
        document.getElementById("adminPanel").style.display = "block";
    }
}

// 更新個人資料
async function updateProfile() {
    const token = localStorage.getItem("token");

    const body = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value
    };

    const response = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    alert(result.message || "資料更新成功");
}

// 修改密碼
async function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("新密碼與確認密碼不一致~");
        return;
    }

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/users/me/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    });

    const result = await response.json();
    alert(result.message || "密碼修改成功");
}

document.addEventListener("DOMContentLoaded", loadProfile);