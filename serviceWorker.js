// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA

// 判断当前URL是否为localhost
// 在IPv4和IPv6中，有不同的表示方式，此变量用于统一这些情况
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1]是IPv6的localhost地址
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 在IPv4中被视为localhost
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * 注册服务工作者
 * 
 * 该函数负责在当前浏览器环境中注册服务工作者（Service Worker）
 * 服务工作者是一种在客户端运行的脚本，可以拦截网络请求、管理离线缓存等
 * 
 * @param {Object} config - 配置对象，用于服务工作者的注册和更新
 */
export function register(config) {
  // 只在生产环境并且浏览器支持serviceWorker时尝试注册
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    // 检查PUBLIC_URL是否与当前页面的URL一致
    // 如果不一致，可能由于CDN等外部因素导致服务工作者无法正常工作
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    // 页面加载完成后执行
    window.addEventListener('load', () => {
      // 服务工作者脚本的URL
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      // 根据是否在localhost上运行，采取不同的处理方式
      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

/**
 * 注册有效的服务工作者
 * 
 * 该函数尝试注册一个服务工作者，以便它可以管理缓存并处理离线请求
 * 当服务工作者更新时，它会等待所有客户端标签页关闭后才使用新的缓存内容
 * 如果服务工作者成功注册，它将缓存内容以供离线使用
 * 
 * @param {string} swUrl - 服务工作者的URL
 * @param {Object} config - 配置对象，可包含回调函数
 */
function registerValidSW(swUrl, config) {
  // 尝试注册服务工作者
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      // 当找到更新的服务工作者时
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        // 当安装状态改变时
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 更新的预缓存内容已经获取，但之前的服务工作者仍然提供旧内容
              // 直到所有客户端标签页都关闭
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
              );

              // 执行回调函数
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // 所有内容已经预缓存
              // 这是显示"内容已缓存以供离线使用"消息的最佳时机
              console.log('Content is cached for offline use.');

              // 执行回调函数
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      // 如果注册过程中出现错误
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
