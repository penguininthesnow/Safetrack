import requests
import os
from dotenv import load_dotenv

load_dotenv()

CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
# GROUP_ID = os.getenv("LINE_GROUP_ID")
# USER_ID = os.getenv("USER_ID")

def send_line_message(message: str, image_url=None, to_id: str = None):
    """
    發送 LINE 訊息
    :parm message:
    :parm image_url: 可選，圖片 url
    :param to_id: 
    """
    url = "https://api.line.me/v2/bot/message/push"
    
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    # to = to_id or GROUP_ID

    messages = [
        {
            "type": "text",
            "text": message
        }
    ]

    # 加圖片
    if image_url:
        messages.append({
            "type": "image",
            "originalContentUrl": image_url,
            "previewImageUrl": image_url
        })

    if not to_id:
        print("未提供 to_id，無法發送 LINE 訊息")
        return None

    data = {
        "to": to_id,
        "messages": messages
    }

    response = requests.post(url, headers=headers, json=data)

    print("Send to: ", to_id)
    print("LINE API response:", response.status_code)
    print("LINE API body:", response.text)

    if response.status_code != 200:
        print("LINE Notify 發送失敗:", response.text)

    try:
        return response.json()
    except:
        return {"status_code": response.status_code, "text": response.text}
    

     # 選傳送其中一個的寫法
    # data = {
    #     "to": GROUP_ID,
    #     "to": USER_ID,
    #     "messages": messages
    # }

    # targets = [GROUP_ID, USER_ID]

    # for target in targets:
    #     if not target:
    #         continue
        
    #     data = {
    #         "to": to_id,
    #         "messages": messages
    #     }