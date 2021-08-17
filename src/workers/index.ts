import path from 'path'
import * as workerpool from 'workerpool'

export const math = workerpool.pool(path.join(__dirname, './math.js'))
