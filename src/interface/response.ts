export namespace AliyunResponse {

    export namespace Domain {

        interface General {
            RequestId: string;
        }

        export interface QueryDnsHost extends General {
            DnsHostList: DnsHostType[];
        }

        type IpListType = string[];

        interface DnsHostType {
            DnsName: string;
            IpList: IpListType
        }

        export interface QueryDomainList extends General {
            TotalItemNum: number;
            CurrentPageNum: number;
            TotalPageNum: number;
            PageSize: number;
            PrePage: string;
            NextPage: string;
            Data: { Domain: DomainInfoType[] };
        }

        interface DomainInfoType {
            DomainName: string;
            InstanceId: string;
            RegistrationDate: string;
            RegistrationDateLong: string;
            ExpirationDate: string;
            ExpirationDateLong: string;
            DomainStatus: string;
            DomainType: string;
            Premium: string;
            ProductId: string;
            DomainAuditStatus: string;
            ExpirationDateStatus: string;
            RegistrantType: string;
            DomainGroupId: string;
            Remark: string;
        }

        export interface QueryDomainByInstanceId {
            RequestId: string;// 唯一请求识别码。
            UserId: string;// 阿里云用户编号。
            DomainName: string;// 域名。
            InstanceId: string;// 域名实例编号。
            RegistrationDate: string;// 注册时间。
            ExpirationDate: string;// 到期时间。
            RegistrantOrganization: string;// 域名所有者。
            RegistrantName: string;// 联系人。
            Email: string;// 域名所有者邮箱。
            EmailVerificationClientHold: boolean;// 是否被clienthold。
            EmailVerificationStatus: boolean;// 邮箱是否已通过验证，枚举值范围：0 没有通过验证；1 已通过验证。 
            UpdateProhibitionLock: string;// 域名安全锁状态，枚举值范围：NONE_SETTING 未设置；OPEN 已开启；CLOSE 已关闭。 
            TransferProhibitionLock: string;// 域名转移锁状态，枚举值范围：NONE_SETTING 未设置；OPEN 已开启；CLOSE 已关闭。 
            DomainNameProxyService: boolean;// 是否已开启隐私保护状态。
            Premium: boolean;// 是否是溢价词。
            DnsList: DnsListType;// DNS列表。
            RealNameStatus: string;// 域名实名认证状态，是命名审核和实名审核组合状态，只有命名审核和实名审核都通过才算域名实名成功，取值：NONAUDIT 未实名认证；SUCCEED 成功；FAILED 审核失败；AUDITING 审核中。 
            DomainNameVerificationStatus: string;// 命名审核状态，取值：NONAUDIT 未认证；SUCCEED 成功；FAILED 审核失败；AUDITING 审核中。 
            RegistrantInfoStatus: string;// 域名信息修改状态，取值：NORMAL 正常；PENDING 修改中。 
            TransferOutStatus: string;// 域名转出状态，取值：NORMAL 正常；PENDING 正在转出阿里云。 
            RegistrantType: string;// 域名注册联系人类型，枚举值范围：1 个人；2 企业。 
        }

        interface DnsListType {
            dns: string;// 域名DNS信息。
        }

    }

    export namespace DNS {

        export interface DescribeDomains {
            RequestId: string;// 唯一请求识别码
            TotalCount: number;// 域名列表总数
            PageNumber: number;// 当前页码
            PageSize: number;// 本次查询获取的域名数量
            Domains: {
                Domain: DomainType[]
            };// 本次获取的域名列表
        }

        interface DomainType {
            DomainId: string;// 域名ID
            DomainName: string;// 域名名称
            AliDomain: boolean;// 是否为阿里云万网域名
            GroupId: string;// 域名分组ID
            InstanceId: string;// 云解析产品ID
            VersionCode: string;// 云解析版本Code
            PunyCode: string;// 中文域名的punycode码，英文域名返回为空
            DnsServers: DnsServerType;// 域名在解析系统中的DNS列表
        }

        interface DnsServerType {
            DnsServer: string;// DNS服务器名称，如dns1.hichina.com
        }

        export interface DescribeDomainRecords {
            RequestId: string;// 唯一请求识别码
            TotalCount: number;// 解析记录总数
            PageNumber: number;// 当前页码
            PageSize: number;// 本次查询获取的解析数量
            DomainRecords: {
                Record: RecordType[]
            };// 解析记录列表
        }

        interface RecordType {
            DomainName: string;// 域名名称
            RecordId: string;// 解析记录ID
            RR: string;// 主机记录
            Type: string;// 记录类型
            Value: string;// 记录值
            TTL: number;// 生存时间
            Priority: number;// MX记录的优先级
            Line: string;// 解析线路
            Status: string;// 解析记录状态，Enable/Disable
            Locked: boolean;// 解析记录锁定状态，true/false
            Weight: number;// 负载均衡权重
        }

        export interface AddDomainRecord {
            RequestId: string;// 唯一请求识别码
            RecordId: string;// 解析记录ID
        }

        export interface UpdateDomainRecord {
            RequestId: string;// 唯一请求识别码
            RecordId: string;// 解析记录ID
        }

    }



}

