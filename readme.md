# ddns-at-home 动态更改DNS解析记录（原aliyun-ddns）

![GitHub](https://img.shields.io/github/license/pboymt/aliyun-ddns.svg?style=flat-square)
![](https://img.shields.io/badge/Language-TypeScript-blue)

## 新版本亮点

- 代码重构，更易阅读
- 将阿里云服务从单页代码中独立，方便 **接入其他服务**
- 配置文件规则优化（版本为2），可以配置 **多服务、多域名、多记录**
- 不再提供crontab配置，请使用 PM2 守护进程配置或自行配置 systemd 等系统工具。

> **已移除V1版本支持**

本项目利用各大DNS服务提供商（例如：阿里云云解析DNS）的 API，在具有公网 IP 的前提下，实现动态修改域名解析的功能，脱离花生壳的昂贵服务，将自己的域名解析为自家的IP地址。

> **代码请求**
> 
> 由于作者还未使用过其他提供商的DNS，所以本项目暂时仅支持阿里云的DNS服务。欢迎提供其他提供商的兼容代码。

**本项目同时支持IPv4与IPv6。**

> **服务征集**
> 
> 由于test-ipv6.com等服务的IP探测服务存在一定的不稳定性，欢迎大家提供同时包含IPv4和IPv6的免费探测服务。


## 本项目使用的模块

### 依赖

| 包名 | 用途 | 使用版本 |
| :- | :- | :-: |
| @alicloud/pop-core | 用于请求阿里云OpenAPI | ![@alicloud/pop-core](https://img.shields.io/static/v1?label=@alicloud/pop-core&message=^1.7.10&color=important) |
| @kocal/logger | 格式化日志输出 | ![@kocal/logger](https://img.shields.io/static/v1?label=@kocal/logger&message=^2.0.11&color=important) |
| ajv | 用于验证JSON Schema | ![ajv](https://img.shields.io/static/v1?label=ajv&message=^6.12.4&color=important) |
| axios | 探测IP地址 | ![axios](https://img.shields.io/static/v1?label=axios&message=^0.24.0&color=important) |
| date-fns | 格式化日志时间 | ![date-fns](https://img.shields.io/static/v1?label=date-fns&message=^2.15.0&color=important) |
| timexe | 执行定时任务 | ![timexe](https://img.shields.io/static/v1?label=timexe&message=^1.0.5&color=important) |

### 开发依赖

| 包名 | 使用版本 |
| :- | :-: |
| @types/node | ![@types/node](https://img.shields.io/static/v1?label=@types/node&message=^16.11.7&color=important) |
| @typescript-eslint/eslint-plugin | ![@typescript-eslint/eslint-plugin](https://img.shields.io/static/v1?label=@typescript-eslint/eslint-plugin&message=^5.4.0&color=important) |
| @typescript-eslint/parser | ![@typescript-eslint/parser](https://img.shields.io/static/v1?label=@typescript-eslint/parser&message=^5.4.0&color=important) |
| cross-env | ![cross-env](https://img.shields.io/static/v1?label=cross-env&message=^7.0.2&color=important) |
| eslint | ![eslint](https://img.shields.io/static/v1?label=eslint&message=^8.2.0&color=important) |
| markdown-table | ![markdown-table](https://img.shields.io/static/v1?label=markdown-table&message=^3.0.1&color=important) |
| typescript | ![typescript](https://img.shields.io/static/v1?label=typescript&message=^4.5.2&color=important) |


本项目使用TypeScript编写，确保稳定运行。

本工具可以使用三种模式部署：

- PM2：推荐，适用于大部分系统，配置简洁
- ~~Crontab~~：不再支持
- Systemd：适用于 Linux 大部分发行版，项目内未实现相关配置。
- Service：适用于 Windows 系统，使用 `node-windows` 模块设置相关服务，项目内未实现相关配置。

## 开源协议

本项目随便就用了LGPLv3协议。

## 注意事项

- 本服务需要域名已设置好需要使用的服务商托管，并且准备好使用账号的 API Key 与 API Secret 等相关内容。
- 如果 DNS 列表不存在配置中的域名，工具将会使用API进行添加，在阿里云服务下，请确保域名属于对应账号所有。
- IPv4网络下，如果您家中有路由器，请将您的路由器设置 `DMZ主机` 到使用本工具的设备（比如路由器 IP 为 `192.168.31.1`，设备 IP 为 `192.168.31.10`，那就把路由器中的 `DMZ主机` 设置为 `192.168.31.10`），以确保设置DNS后能够正常使用公网 IPv4 访问该设备。
- 如果要将 IP 地址设置为客户端所在的公网 IP 地址, 要确保客户端被当地运营商分配的不是**内网IP**（即使用万网查询 IP 地址时会出现两个 IP 地址，其中一个是 NAT 的 IP 地址，此时您自身的 IP 不是公网 IP）。如果是内网的 IPv4 地址, 可以给客服打电话要求更换为公网 IPv4 地址（长城宽带等二次转售宽带就别想了）。
- 大多数设备在国内环境都是可以获取公网 IPv6 地址的。如果您家中网络结构是“光猫（路由模式，大多数运营商默认）-路由器-设备”，请将路由器（以小米路由器为例）设置为有线中继模式，由路由模式的光猫进行 DHCPv6 分配；或者联系运营商服务支持，将光猫由路由模式改为桥接模式，使用路由器进行拨号及 DHCPv6 分配，此方法已经在北京联通、北京电信成功验证。

> 如果获取不到公网 IPv4 地址，禁用 IPv4 配置只使用 IPv6 也是极好的。

## 使用方法

> 不再支持V1配置

> 使用前请务必阅读[注意事项](#注意事项)

请确保您已经安装了Node.js 16.x（较早版本并未测试不过理论上Node.js 8.x及以上版本均支持）并且能够运行npm。您可以通过以下代码在命令行测试：

```bash
$ node -v # v16.13.0
$ npm -v # 8.1.3
```

（建议）全局安装TypeScript：

```bash
# 推荐
$ yarn global add typescript
# 或
$ npm install -g typescript
```

将项目 `git clone` 到目录：

```bash
$ git clone https://github.com/pboymt/ddns-at-home.git
# 国内用户请配置好代理/Hosts/可靠性高的DNS服务，或者直接使用码云Gitee的镜像
$ git clone https://gitee.com/pboymt/ddns-at-home.git
```

切换到目录：

```bash
$ cd ddns-at-home
```

安装依赖：

```bash
# 本项目不再推荐使用yarn，因为没测试过
$ npm install
```

编译代码：

```bash
$ tsc # 如果没有报错就是编译成功
```

复制配置样板，修改设置，配置模式文件请查看 [settings.schema.json](./settings.schema.json) ：

> 强烈使用VSCode等编辑器支持JSON Schema验证的编辑器编辑配置文件。

```bash
$ cp settings.sample.json settings.json
$ nano settings.json # 请完全遵照schema设定的规则进行配置
```

如果配置无效会在运行的第一时间抛出错误。

安装完毕后可以运行一次进行测试：

```bash
$ npm start
```

> 如果您使用了计划任务，建议等待第一次计划任务执行成功后结束测试。

## 更新工具

您只需要重新拉取后再次执行安装依赖和编译代码流程即可，如果您配置了守护进程，请重启它们（PM2会默认监控编译生成的lib目录变化自动重启）。

## 守护进程配置

在版本 `1.1.0` 中，由于内置定时执行DDNS功能，Crontab配置暂被删去，您可以自行配置，**但请务必注意配置文件不要带有`schedule`字段！**

如果您在V2配置文件中配置了计划任务，那么可以使用提供的PM2配置文件，甚至自行设置Systemd将本工具设置为服务。

### PM2

本工具提供了[ecosystem.config.js](./ecosystem.config.js)作为PM2的环境配置。

您可以全局安装pm2：

```bash
$ npm install -g pm2
```

配置文件需要配置`schedule`字段：

> 由于DNS API存在防滥用机制，因此本工具的计划任务只支持到分钟级，如果您愿意作死可以直接魔改源代码添加秒级甚至微秒级计划任务。

```json
{
    ...
    "schedule": {
        "immediate": true, // 是否立即执行一次任务
        "hour": "*", // 每小时均可执行
        "minute": "/5" // 每封五的背书分钟执行一次任务（默认配置）
    }
}
```

> `hour`和`minute`字段语法规则类似于Cron，详细语法可在[Timexe文档](https://github.com/paragi/timexe#examples-og-timer-expressions)查看：
> - 当为 `*` 时，每小**小时/分钟**执行一次
> - 当为 `n` 时，每逢n**时/分**时可执行，最终决定权在`minute`字段
> - 当为 `/n` 时，每逢n的倍数**时/分**执行一次


然后使用pm2运行本工具：

```bash
# 输出更多日志
$ pm2 start ecosystem.config.js # 可不写 ecosystem.config.js，pm2 会默认搜寻目录中的配置。
# 或（输出更少日志）
$ pm2 start ecosystem.config.js --env production
```

可使用命令查看监控：

```bash
$ pm2 monit
```

停止守护进程：

```bash
$ pm2 stop
```

保存守护进程（防止pm2重启丢失配置）：

```bash
$ pm2 save
```

配置PM2自启动：

> **注意：** 可能需要管理员权限或root权限，在Linux下，root权限执行的pm2和普通用户权限执行的pm2配置不在同一目录，如果您使用的是`sudo pm2 startup`，那么请使用`sudo pm2 start`运行守护进程，并且把普通权限运行的守护进程删除，防止重复多次运行。

```bash
$ pm2 startup
```

### Systemd

*探寻中 WIP*