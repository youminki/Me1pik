import axios from 'axios';

export interface SSLStatus {
  domain: string;
  sslStatus: 'pending' | 'active' | 'error' | 'expired';
  certificateUrl?: string;
  expiresAt?: Date;
  lastChecked: Date;
}

export interface SSLCreationRequest {
  domain: string;
  forceRenewal?: boolean;
  waitForCompletion?: boolean;
}

export class SSLManager {
  private static instance: SSLManager;
  private vercelToken: string;
  private baseUrl = 'https://api.vercel.com/v1';

  private constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN || '';
  }

  public static getInstance(): SSLManager {
    if (!SSLManager.instance) {
      SSLManager.instance = new SSLManager();
    }
    return SSLManager.instance;
  }

  /**
   * SSL 인증서 생성 요청 (비동기)
   */
  public async createSSLCertificate(
    request: SSLCreationRequest
  ): Promise<{ requestId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/domains/${request.domain}/ssl`,
        {
          forceRenewal: request.forceRenewal || false,
          waitForCompletion: request.waitForCompletion || false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        requestId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`SSL 인증서 생성 실패: ${error}`);
    }
  }

  /**
   * SSL 인증서 상태 확인
   */
  public async checkSSLStatus(domain: string): Promise<SSLStatus> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/domains/${domain}/ssl`,
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
          },
        }
      );

      return {
        domain,
        sslStatus: response.data.status,
        certificateUrl: response.data.certificateUrl,
        expiresAt: response.data.expiresAt
          ? new Date(response.data.expiresAt)
          : undefined,
        lastChecked: new Date(),
      };
    } catch (error) {
      throw new Error(`SSL 상태 확인 실패: ${error}`);
    }
  }

  /**
   * SSL 인증서 갱신
   */
  public async renewSSLCertificate(
    domain: string
  ): Promise<{ requestId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/domains/${domain}/ssl/renew`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        requestId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`SSL 인증서 갱신 실패: ${error}`);
    }
  }

  /**
   * 모든 도메인의 SSL 상태 일괄 확인
   */
  public async checkAllDomainsSSL(): Promise<SSLStatus[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/domains`, {
        headers: {
          Authorization: `Bearer ${this.vercelToken}`,
        },
      });

      const domains = response.data.domains;
      const sslStatuses: SSLStatus[] = [];

      for (const domain of domains) {
        try {
          const sslStatus = await this.checkSSLStatus(domain.name);
          sslStatuses.push(sslStatus);
        } catch (error) {
          console.warn(`도메인 ${domain.name} SSL 상태 확인 실패:`, error);
        }
      }

      return sslStatuses;
    } catch (error) {
      throw new Error(`도메인 SSL 상태 일괄 확인 실패: ${error}`);
    }
  }

  /**
   * SSL 인증서 만료 예정 알림
   */
  public async getExpiringCertificates(
    daysThreshold: number = 30
  ): Promise<SSLStatus[]> {
    const allStatuses = await this.checkAllDomainsSSL();
    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() + daysThreshold * 24 * 60 * 60 * 1000
    );

    return allStatuses.filter(
      (status) => status.expiresAt && status.expiresAt <= thresholdDate
    );
  }
}

// 사용 예시
export const sslManager = SSLManager.getInstance();
