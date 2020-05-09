import { eventOn, eventOff } from './events'
import { isArray, isString } from './inspect'
import { keys } from './object'

const allListenTypes = { hover: true, click: true, focus: true }

const BVBoundListeners = '__BV_boundEventListeners__'

export const getTargets = ({ modifiers, arg, value }) => {
  const targets = keys(modifiers || {}).filter(t => !allListenTypes[t])

  if (arg && isString(arg)) {
    targets.push(arg)
  }

  if (value && isString(value)) {
    targets.push(value)
  } else if (isArray(value)) {
    value.forEach(t => t && isString(t) && targets.push(t))
  }

  // return only unique targets
  return targets.filter((target, index, array) => array.indexOf(target) === index)
}

export const bindTargets = (vnode, binding, listenTypes, fn) => {
  const targets = getTargets(binding)

  const listener = () => {
    fn({ targets, vnode })
  }

  keys(allListenTypes).forEach(type => {
    if (listenTypes[type] || binding.modifiers[type]) {
      eventOn(vnode.elm, type, listener)
      const boundListeners = vnode.elm[BVBoundListeners] || {}
      boundListeners[type] = (boundListeners[type] || []).push(listener)
      vnode.elm[BVBoundListeners] = boundListeners
    }
  })

  // Return the list of targets
  return targets
}

export const unbindTargets = (vnode, binding, listenTypes) => {
  keys(allListenTypes).forEach(type => {
    if (listenTypes[type] || binding.modifiers[type]) {
      const boundListeners = vnode.elm[BVBoundListeners] && vnode.elm[BVBoundListeners][type]
      if (boundListeners) {
        boundListeners.forEach(listener => eventOff(vnode.elm, type, listener))
        delete vnode.elm[BVBoundListeners][type]
      }
    }
  })
}

export default bindTargets
