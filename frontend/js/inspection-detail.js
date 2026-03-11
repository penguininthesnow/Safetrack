document.addEventListener("DOMContentLoaded", () => {
    loadInspection()
})

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
}

function setText(id, value) {

    const el = document.getElementById(id)

    if (el) {
        el.innerText = value
    }

}

async function loadInspection() {

    const number = getQueryParam("number")

    if (!number) {
        alert("找不到巡檢紀錄")
        return
    }

    try {

        const response = await fetch(
            `${API_BASE}/inspections/number/${number}`
        )

        if (!response.ok) {
            throw new Error("API錯誤")
        }

        const data = await response.json()

        console.log("inspection data:", data)

        setText("inspectionNumber", data.inspection_number)
        setText("date", data.date)
        setText("location", data.location)
        setText("item", data.item)
        setText("description", data.description)
        setText("abnormal", data.is_abnormal ? "是 ⚠" : "否")


        if (data.image_url) {
            document.getElementById("image").src = data.image_url
        }

    } catch (error) {

        console.error("取得巡檢資料失敗", error)
        alert("讀取巡檢紀錄失敗")

    }
}