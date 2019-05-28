export namespace AliyunRequest {

    export namespace Domain {

        export interface QueryDomainByInstanceId {
            Action: 'QueryDomainByInstanceId';// 操作接口名，系统规定参数，取值：QueryDomainByInstanceId。 
            InstanceId: string; // 域名实例编号。
        }

        export interface QueryDomainList {
            Action: 'QueryDomainList';
            PageNum: number;
            PageSize: number;
            OrderKeyType?: string;
            OrderByType?: string;
            StartRegistrationDate?: number;
            EndRegistrationDate?: number;
            StartExpirationDate?: number;
            EndExpirationDate?: number;
            Lang?: string;
            DomainName?: string;
            ProductDomainType?: string;
            QueryType?: string;
        }

        export interface QueryDnsHost {
            Action: 'QueryDnsHost';
            InstanceId: string;
            Lang?: 'zh' | 'en';
        }

    }

    export namespace DNS {

        export interface DescribeDomains {
            Action: 'DescribeDomains';// 操作接口名，系统规定参数，取值：DescribeDomains
            PageNumber?: number;// 当前页数，起始值为1，默认为1
            PageSize?: number;// 分页查询时设置的每页行数，最大值100，默认为20
            KeyWord?: string;// 关键字，按照”%KeyWord%”模式搜索，不区分大小写
            GroupId?: string;// 域名分组ID，如果不填写则默认为全部分组
        }

        export interface DescribeDomainRecords {
            Action: 'DescribeDomainRecords';// 操作接口名，系统规定参数，取值：DescribeDomainRecords
            DomainName: string;// 域名名称
            PageNumber?: number;// 当前页数，起始值为1，默认为1
            PageSize?: number;// 分页查询时设置的每页行数，最大值500，默认为20
            RRKeyWord?: string;// 主机记录的关键字，按照”%RRKeyWord%”模式搜索，不区分大小写
            TypeKeyWord?: string;// 解析类型的关键字，按照全匹配搜索，不区分大小写
            ValueKeyWord?: string;// 记录值的关键字，按照”%ValueKeyWord%”模式搜索，不区分大小写
        }


    }


}