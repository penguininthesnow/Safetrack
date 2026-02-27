# 使用方法
from backend.utils.line_notify import send_line_notify

if inspection.is_abnormal:
    send_line_notify(
        f"工安異常通知\n地點: {inspection.location}\n項目: {inspection.item}\n日期: {inspection.date}"
    )