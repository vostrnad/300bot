import { evaluate, format } from 'mathjs'
import { worker } from 'workerpool'
import { roundIfClose } from '../utils/math'

type MathJsResult = number | { re: number; im: number }

const evaluateAndFormat = (expression: string) => {
  const res = evaluate(expression) as MathJsResult

  if (typeof res === 'object') {
    if (typeof res.re === 'number' && typeof res.im === 'number') {
      res.re = roundIfClose(res.re, 1e-12)
      res.im = roundIfClose(res.im, 1e-12)
    }
    return format(res)
  } else {
    if (Number.isFinite(res)) {
      return roundIfClose(res, 1e-12).toString()
    } else {
      throw new Error('The result is too big')
    }
  }
}

worker({
  evaluate: evaluateAndFormat,
})
