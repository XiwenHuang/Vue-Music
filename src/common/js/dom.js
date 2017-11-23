export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ') // 先把类名用空格作为间隔符切割成数组
  newClass.push(className)               // 然后把类名push进那个数组里面
  el.className = newClass.join(' ')       // 然后再把数组变回字符串加回dom元素的class列表里面
}

export function hasClass (el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  }
  return el.getAttribute(name)
}
