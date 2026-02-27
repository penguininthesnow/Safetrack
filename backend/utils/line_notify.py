import requests
import os
from dotenv import load_dotenv

load_dotenv()

LINE_TOKEN = os.getenv("LINE_NOTIFY_TOKEN")
LINE_API = "https://notify-api.line.me/api/notify"

def send_line_notify(message: str):
    if not LINE_TOKEN:
        raise RuntimeError("LINE_NOTIFY_TOKEN not set in environment variables")
    
    headers = {"Authorization": f"Bearer {LINE_TOKEN}"}
    data = {"message": message}

    response = requests.post(LINE_API, headers=headers, data=data)
    if response.status_code != 200:
        print("LINE Notify 發送失敗:", response.text)