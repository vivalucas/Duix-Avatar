import path from 'path'
import os from 'os'

const isDev = process.env.NODE_ENV === 'development'
const isWin = process.platform === 'win32'

export const serviceUrl = {
  face2face: F2F_URL,
  tts: TTS_URL
}

export const assetPath = {
  model: isWin
    ? path.join(DATA_ROOT_WIN, 'face2face', 'temp')
    : path.join(DATA_ROOT_LINUX, 'face2face', 'temp'), // 模特视频
  ttsProduct: isWin
    ? path.join(DATA_ROOT_WIN, 'face2face', 'temp')
    : path.join(DATA_ROOT_LINUX, 'face2face', 'temp'), // TTS 产物
  ttsRoot: isWin
    ? path.join(DATA_ROOT_WIN, 'voice', 'data')
    : path.join(DATA_ROOT_LINUX, 'voice', 'data'), // TTS服务根目录
  ttsTrain: isWin
    ? path.join(DATA_ROOT_WIN, 'voice', 'data', 'origin_audio')
    : path.join(DATA_ROOT_LINUX, 'voice', 'data', 'origin_audio') // TTS 训练产物
}

const TTS_URL = process.env.DUIX_TTS_URL || 'http://10.1.1.6:18180'
const F2F_URL = process.env.DUIX_F2F_URL || 'http://10.1.1.6:8383/easy'
const DATA_ROOT_WIN = process.env.DUIX_DATA_ROOT_WIN || path.join('D:', 'duix_avatar_data')
const DATA_ROOT_LINUX = process.env.DUIX_DATA_ROOT_LINUX || path.join(os.homedir(), 'duix_avatar_data')
