import fs from 'fs'
import path from 'path'

// 微信支付配置对象
export const wechatpayConfig = {
  appid: process.env.WECHAT_APPID!,
  mchid: process.env.WECHAT_MCHID!,
  apiv3Key: process.env.WECHAT_API_V3_KEY!,
  certSerialNo: process.env.WECHAT_CERT_SERIAL_NO!,
  privateKey: fs.readFileSync(
    path.resolve(process.env.WECHAT_PRIVATE_KEY_PATH || 'apiclient_key.pem'),
    'utf-8'
  ),
}