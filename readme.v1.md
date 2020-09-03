# aliyun-ddns 动态更改AliDNS解析记录

![GitHub](https://img.shields.io/github/license/pboymt/aliyun-ddns.svg?style=flat-square)

本项目利用阿里云的 OpenAPI，在具有公网 IP 的前提下，实现动态修改域名解析的功能，脱离花生壳的昂贵服务，将自己的域名解析为自家的IP地址。

**本项目同时支持IPv4与IPv6。**

本项目使用`@alicloud/pop-core`与`ajv`两个模块，使用TypeScript编写，确保稳定运行。

本工具可以使用三种模式部署：

- Crontab：适用于 Linux 系统、macOS 与 WSL（可能可以）。
- Systemd：适用于 Linux 大部分发行版，项目内未实现相关配置。
- Service：适用于 Windows 系统，使用 `node-windows` 模块设置相关服务，项目内未实现相关配置。


## 开源协议

本项目随便就用了LGPLv3协议。

## 使用前提

- 域名是由阿里云或者万网托管，并且是目标域名的拥有者并可以拿到账号的 API Key 与 API Secret。
- 如果要将IP地址设置为客户端所在的公网 IP 地址, 要确保客户端被当地运营商分配的不是**内网IP**（即使用万网查询 IP 地址时会出现两个IP地址，其中一个是 NAT 的 IP 地址）。如果是内网的 IP 地址, 可以给客服打电话要求更换为公网 IP 地址。

## 使用方法

注意：项目中的shell脚本文件需要添加执行权限。

```bash
$ chmod +x install.sh
$ chmod +x set-crontab.sh
```

### （推荐）设置DMZ使最外侧家庭网关能够接通到你的电脑

由于作者家里是有一个光猫和一个无线路由器，所以 DMZ 主机需要进行两层设置，各位可以根据网关层数增加或者缩减配置层数。

首先，查看使用的计算机在无线路由器网关下的局域网 IP（本说明设定为 `192.168.0.100`），打开无线路由器设置页面（此时为 `http://192.168.0.1`）。找到高级设置中的 DMZ 主机，将此功能开启并设置目标 IP 为 `192.168.0.100`。

然后，连通无线路由器与光猫，作者家中的无线路由器在光猫的网关下的 IP 地址为`192.168.1.2`，光猫 IP 地址为`192.168.1.1`。打开光猫设置（此时为 `http://192.168.1.1`），找到高级设置中的 DMZ 主机，将目标 IP 设置为`192.168.1.2`。

完成之后光猫接收到的未知目标的数据包会经过两次转发到目标主机。

### 编译项目

请确保你已经安装了node.js 10.x（较早版本并未测试不过使用的语法在node.js 8.x已经完整支持了）并且能够运行npm。您可以通过以下代码在命令行测试：

```bash
$ node -v # v10.15.3
$ npm -v # 6.4.1
```

（建议）全局安装TypeScript：

```bash
$ npm i -g typescript
```

先将项目 `git clone` 到目录。

```bash
$ git clone https://github.com/pboymt/aliyun-ddns.git
$ cd aliyun-ddns
```

（可选）一键安装，此脚本文件会一键安装依赖、编译、设置crontab（这种方法必须全局安装了typescript才能使用）：

```bash
$ npm run onekey
```

或者：

```bash
$ ./install.sh
```

如果你使用了一键安装脚本，那么后面的流程都不需要了。

安装依赖：

```bash
$ npm install
```

复制配置样板，修改设置，配置模式文件请查看 [settings.schema.json](./settings.schema.json) ：

```
$ cp settings.sample.json settings.json
$ nano settings.json
```

如果配置无效会在运行的第一时间抛出错误。

安装完毕后可以运行一次进行测试：

```bash
$ npm start
```


### Crontab

运行以下命令即可安装，如果执行错误请尝试sudo。

```bash
$ npm run crontab
```
