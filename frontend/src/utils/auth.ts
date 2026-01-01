// 简单的密码认证拦截器
export function checkBasicAuth(): boolean {
  // 检查是否在生产环境
  if (import.meta.env.MODE !== 'production') {
    return true;
  }

  // 检查 sessionStorage 中是否已认证
  const isAuthenticated = sessionStorage.getItem('authenticated');
  if (isAuthenticated === 'true') {
    return true;
  }

  // 弹出密码输入对话框
  const password = prompt('请输入访问密码:');

  if (!password) {
    alert('需要密码才能访问');
    return false;
  }

  // 验证密码
  if (password === 'IcanWewill') {
    sessionStorage.setItem('authenticated', 'true');
    return true;
  }

  alert('密码错误,请重试');
  return false;
}
