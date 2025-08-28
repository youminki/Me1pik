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

    // 토큰이 설정되지 않은 경우 경고
    if (!this.vercelToken) {
      console.warn(
        '⚠️ VERCEL_TOKEN이 설정되지 않았습니다. SSL 관리 기능이 작동하지 않습니다.'
      );
      console.warn('📝 환경 변수 설정 방법:');
      console.warn(
        '   1. Vercel Dashboard → Project Settings → Environment Variables'
      );
      console.warn('   2. VERCEL_TOKEN 추가');
      console.warn(
        '   3. Vercel API 토큰 발급: https://vercel.com/account/tokens'
      );
    }
  }

  public static getInstance(): SSLManager {
    if (!SSLManager.instance) {
      SSLManager.instance = new SSLManager();
    }
    return SSLManager.instance;
  }

  /**
   * Vercel 토큰 설정 상태 확인
   */
  public isTokenConfigured(): boolean {
    return !!this.vercelToken;
  }

  /**
   * 토큰 설정 가이드 반환
   */
  public getTokenSetupGuide(): string {
    return `
🔑 Vercel API 토큰 설정이 필요합니다.

📋 설정 단계:
1. https://vercel.com/account/tokens 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "SSL Management")
4. 토큰 복사
5. Vercel Dashboard → Project Settings → Environment Variables
6. VERCEL_TOKEN 추가

💡 또는 로컬 개발 시 .env 파일에 추가:
VERCEL_TOKEN=your_token_here
    `.trim();
  }

  /**
   * SSL 인증서 생성 요청 (비동기)
   */
  public async createSSLCertificate(
    request: SSLCreationRequest
  ): Promise<{ requestId: string; status: string }> {
    if (!this.isTokenConfigured()) {
      throw new Error(
        'Vercel API 토큰이 설정되지 않았습니다.\n' + this.getTokenSetupGuide()
      );
    }

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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            'Vercel API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.'
          );
        } else if (error.response?.status === 403) {
          throw new Error(`도메인 ${request.domain}에 대한 권한이 없습니다.`);
        } else if (error.response?.status === 404) {
          throw new Error(`도메인 ${request.domain}을 찾을 수 없습니다.`);
        } else {
          throw new Error(
            `SSL 인증서 생성 실패: ${error.response?.data?.error || error.message}`
          );
        }
      }
      throw new Error(`SSL 인증서 생성 실패: ${error}`);
    }
  }

  /**
   * SSL 인증서 상태 확인
   */
  public async checkSSLStatus(domain: string): Promise<SSLStatus> {
    if (!this.isTokenConfigured()) {
      throw new Error(
        'Vercel API 토큰이 설정되지 않았습니다.\n' + this.getTokenSetupGuide()
      );
    }

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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            'Vercel API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.'
          );
        } else if (error.response?.status === 403) {
          throw new Error(`도메인 ${domain}에 대한 권한이 없습니다.`);
        } else if (error.response?.status === 404) {
          throw new Error(`도메인 ${domain}을 찾을 수 없습니다.`);
        } else {
          throw new Error(
            `SSL 상태 확인 실패: ${error.response?.data?.error || error.message}`
          );
        }
      }
      throw new Error(`SSL 상태 확인 실패: ${error}`);
    }
  }

  /**
   * SSL 인증서 갱신
   */
  public async renewSSLCertificate(
    domain: string
  ): Promise<{ requestId: string; status: string }> {
    if (!this.isTokenConfigured()) {
      throw new Error(
        'Vercel API 토큰이 설정되지 않았습니다.\n' + this.getTokenSetupGuide()
      );
    }

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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            'Vercel API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.'
          );
        } else if (error.response?.status === 403) {
          throw new Error(`도메인 ${domain}에 대한 권한이 없습니다.`);
        } else if (error.response?.status === 404) {
          throw new Error(`도메인 ${domain}을 찾을 수 없습니다.`);
        } else {
          throw new Error(
            `SSL 인증서 갱신 실패: ${error.response?.data?.error || error.message}`
          );
        }
      }
      throw new Error(`SSL 인증서 갱신 실패: ${error}`);
    }
  }

  /**
   * 모든 도메인의 SSL 상태 일괄 확인
   */
  public async checkAllDomainsSSL(): Promise<SSLStatus[]> {
    if (!this.isTokenConfigured()) {
      throw new Error(
        'Vercel API 토큰이 설정되지 않았습니다.\n' + this.getTokenSetupGuide()
      );
    }

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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            'Vercel API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.'
          );
        } else {
          throw new Error(
            `도메인 SSL 상태 일괄 확인 실패: ${error.response?.data?.error || error.message}`
          );
        }
      }
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
