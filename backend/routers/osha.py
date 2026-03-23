from fastapi import APIRouter, HTTPException
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import urllib3

router = APIRouter(prefix="/api/osha", tags=["osha"])

OSHA_URL = "https://www.osha.gov.tw/"

# 關閉未驗證 HTTPS 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

@router.get("/bulletin")
def get_osha_bulletin():
    try:
        resp = requests.get(
            OSHA_URL,
            timeout=15,
            verify=False,   # 關鍵：略過該站 SSL 憑證驗證
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                ),
                "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
                "Referer": "https://www.google.com/"
            }
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"無法連線至職安署網站: {str(e)}")
    
    soup = BeautifulSoup(resp.text, "html.parser")

    # 找公佈欄標題
    heading = None
    for tag in soup.find_all(["h2", "h3", "h4"]):
        if tag.get_text(strip=True) == "公布欄":
            heading = tag
            break
        
    if not heading:
        raise HTTPException(status_code=500, detail="找不到公布欄區塊")
    
    items = []
    more_url = None

    # 從公佈欄標題往後找內容
    current = heading.find_next_sibling()
    while current:
        text = current.get_text(" ", strip=True)

        # 遇到下一個區塊就停止
        if current.name in ["h2", "h3", "h4"] and text != "公布欄":
            break
        
        # 抓 Li > a
        for li in current.find_all("li"):
            a = li.find("a")
            if not a:
                continue

            title = a.get_text(" ", strip=True)
            href = a.get("href", "").strip()

            if not title:
                continue

            items.append({
                "title": title,
                "url": urljoin(OSHA_URL, href)
            })

        # 抓 "更多公佈欄"
        for a in current.find_all("a"):
            link_text = a.get_text(" ", strip=True)
            if "更多公布欄" in link_text:
                more_url = urljoin(OSHA_URL, a.get("href", "").strip())


        current = current.find_next_sibling()

    return {
        "source": OSHA_URL,
        "more_url": more_url,
        "items": items[:5]
    }