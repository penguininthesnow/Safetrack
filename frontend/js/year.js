const CACHE_KEY = "years";
const CACHE_TIME_KEY = "years_time";

// 1 週（7 天）
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

async function getYears() {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    const now = Date.now();

    // 有快取 + 未過期 → 直接用
    if (
        cached &&
        cachedTime &&
        now - Number(cachedTime) < CACHE_DURATION
    ) {
        try {
            return JSON.parse(cached);
        } catch (err) {
            clearYearsCache();
        }
    }

    // 否則重新打 API
    const response = await fetch(`${API_BASE}/inspections/years`);
    if (!response.ok) {
        throw new Error("取得年份失敗");
    }

    const years = await response.json();

    // 存快取
    localStorage.setItem(CACHE_KEY, JSON.stringify(years));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());

    return years;
}

// 手動清除快取（新增年份時用）
function clearYearsCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
}

// 如果沒有用 module（import/export）
window.getYears = getYears;
window.clearYearsCache = clearYearsCache;