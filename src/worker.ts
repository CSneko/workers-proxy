export default {
  async fetch(request:Request, env, ctx) {
    // 获取用户访问的url
    const url:URL = new URL(request.url);
    // 获取用户的请求头
    const headers:Headers = request.headers;
    // 获取域名
    const host:string = url.host;
    // 获取变量中的域名
    var domain:string = env.DOMAIN;
    // 清除域名
    var target_host:string = host.replace(`.${domain}`, '');
    switch (target_host){
      case 'github.com':
        // 访问目标为github
        // 向目标发送请求
        var target: string = url.toString().replace(`.${domain}`, '');
        const response: Response = await fetch(target, {
          headers,
        });
        
        // 获取原始响应的 headers
        const originalHeaders = new Headers(response.headers);
        
        // 组合两个 CSP 指令
        const cspDirective = "default-src *; style-src 'self' 'unsafe-inline' https://proxy.cneko.org/";

        // 设置 Content Security Policy
        originalHeaders.set('Content-Security-Policy', cspDirective);

        var text: string = await response.text();
        // 将返回的内容的 https:// 替换为 https://${domain}/
        text = text.replace(/https:github.com\/\//g, `https://github.com.${domain}/`);
        text = text.replace(/https:\/\//g, `https://${domain}/`);
        
        // 创建一个新的响应对象，包含了更新后的 headers 和文本内容
        let newResponse = new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: originalHeaders
        });
        
        return newResponse;
        
    }
    
    // 构建目标域名
    const target_url:string = url.toString().replace(`${host}/`, '');
    // 向url发送请求
    const response:Response = await fetch(target_url, {
      headers,
    }); 
    // 获取原始响应的 headers
    const originalHeaders = new Headers(response.headers);
    
    // 组合 CSP 指令
    //const cspDirective = "default-src *;  font-src *; style-src 'self' 'unsafe-inline' *";
    const cspDirective = "";

    // 设置 Content Security Policy
    originalHeaders.set('Content-Security-Policy', cspDirective);
    originalHeaders.set('host',target_url.replace('https://','').replace('http://',''))
    
    var text: string = await response.text();
    // 将返回的内容的 https:// 替换为 https://${domain}/
    text = text.replace(/https:\/\//g, `https://${domain}/`);
    // 将绝对路径链接设置为https://${domain}/${target_url}/
    text = text.replace(/href="\//g, `href="https://${domain}/${target_url.replace('https://','')}/`);
    // 将gstatic替换为原来的地址
    const gstaticFontsRegex = new RegExp(`https://${domain}/fonts.gstatic.com`, 'g');
    text = text.replace(gstaticFontsRegex,`https://fonts.gstatic.com`)
    // 创建一个新的响应对象，包含了更新后的 headers 和文本内容
    let newResponse = new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: originalHeaders
    });
    // 返回响应的数据
    return newResponse;
  },
};
