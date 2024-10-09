import React, { useRef, useEffect, useContext } from 'https://cdn.skypack.dev/react';
import { CSSTransition as ReactCSSTransition } from 'https://cdn.skypack.dev/react-transition-group';

const TransitionContext = React.createContext({
  parent: {},
})

/**
 * 使用useIsInitialRender自定义hook来判断组件是否处于初次渲染
 * 
 * 该hook利用了useRef和useEffect来追踪渲染状态
 * 初次渲染时，返回true；之后的渲染，返回false
 * 
 * @returns {boolean} 返回当前渲染是否为初次渲染的布尔值
 */
function useIsInitialRender() {
  // 使用useRef来保持一个布尔值，用于判断是否为初次渲染
  const isInitialRender = useRef(true);
  
  // 使用useEffect来更新isInitialRender.current，仅在初次渲染后立即设置为false
  // 由于依赖项为空数组，该useEffect仅在组件初次挂载时执行
  useEffect(() => {
    isInitialRender.current = false;
  }, []);
  
  // 返回isInitialRender.current的值，以指示当前是否为初次渲染
  return isInitialRender.current;
}

function CSSTransition({
  show,
  enter = '',
  enterStart = '',
  enterEnd = '',
  leave = '',
  leaveStart = '',
  leaveEnd = '',
  appear,
  unmountOnExit,
  tag = 'div',
  children,
  ...rest
}) {
  const enterClasses = enter.split(' ').filter((s) => s.length);
  const enterStartClasses = enterStart.split(' ').filter((s) => s.length);
  const enterEndClasses = enterEnd.split(' ').filter((s) => s.length);
  const leaveClasses = leave.split(' ').filter((s) => s.length);
  const leaveStartClasses = leaveStart.split(' ').filter((s) => s.length);
  const leaveEndClasses = leaveEnd.split(' ').filter((s) => s.length);
  const removeFromDom = unmountOnExit;

  function addClasses(node, classes) {
    classes.length && node.classList.add(...classes);
  }

  function removeClasses(node, classes) {
    classes.length && node.classList.remove(...classes);
  }

  const nodeRef = React.useRef(null);
  const Component = tag;

  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        nodeRef.current.addEventListener('transitionend', done, false)
      }}
      onEnter={() => {
        if (!removeFromDom) nodeRef.current.style.display = null;
        addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses])
      }}
      onEntering={() => {
        removeClasses(nodeRef.current, enterStartClasses)
        addClasses(nodeRef.current, enterEndClasses)
      }}
      onEntered={() => {
        removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses])
      }}
      onExit={() => {
        addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses])
      }}
      onExiting={() => {
        removeClasses(nodeRef.current, leaveStartClasses)
        addClasses(nodeRef.current, leaveEndClasses)
      }}
      onExited={() => {
        removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses])
        if (!removeFromDom) nodeRef.current.style.display = 'none';
      }}
    >
      <Component ref={nodeRef} {...rest} style={{ display: !removeFromDom ? 'none': null }}>{children}</Component>
    </ReactCSSTransition>
  )
}

/**
 * Transition组件用于管理子组件的过渡动画
 * 它可以嵌套使用，内部组件将继承外部组件的过渡状态
 * 
 * @param {Object} props 
 * @param {boolean} props.show - 控制组件是否显示的布尔值
 * @param {boolean} props.appear - 组件首次出现时是否应用过渡效果
 * @param {Object} rest - 传递给CSSTransition组件的其他属性
 * 
 * @returns {JSX.Element} 返回CSSTransition组件或包含CSSTransition的TransitionContext.Provider组件
 */
function Transition({ show, appear, ...rest }) {
  // 从TransitionContext中获取上下文，用于获取父组件的状态
  const { parent } = useContext(TransitionContext);
  // 使用自定义钩子useIsInitialRender判断当前组件是否首次渲染
  const isInitialRender = useIsInitialRender();
  // 判断当前组件是否为子组件，子组件的show属性为undefined
  const isChild = show === undefined;

  // 如果是子组件，则使用父组件的show和appear状态，并传递其他属性
  if (isChild) {
    return (
      <CSSTransition
        appear={parent.appear || !parent.isInitialRender}
        show={parent.show}
        {...rest}
      />
    )
  }

  // 如果不是子组件，则创建新的parent状态，并传递给TransitionContext.Provider
  // 这样，子组件可以继承这些状态
  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
        },
      }}
    >
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  )
}

export default Transition;