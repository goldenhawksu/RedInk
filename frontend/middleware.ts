
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/', '/index'], // 指定需要保护的路径，'/' 表示首页
};

export function middleware(req: NextRequest) {
  // 1. 获取 Authorization header
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // 2. 检查是否有认证信息
  if (basicAuth) {
    // 解析 header 值 "Basic base64credentials"
    const authValue = basicAuth.split(' ')[1];
    // 解码 base64
    const [user, pwd] = atob(authValue).split(':');

    // 3. 验证用户名和密码 (建议改为使用环境变量)
    // 这里示例账号为 admin，密码为 password
    if (user === 'CTS' && pwd === 'IcanWewill') {
      return NextResponse.next();
    }
  }

  // 4. 如果未认证或认证失败，返回 401 并触发浏览器弹窗
  url.pathname = '/api/auth';
  return new NextResponse('Need authorization!', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
