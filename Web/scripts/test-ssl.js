#!/usr/bin/env node

/**
 * SSL 인증서 비동기 생성 시스템 테스트 스크립트
 *
 * 사용법:
 * 1. Vercel API 토큰을 환경 변수로 설정
 * 2. node scripts/test-ssl.js
 */

const axios = require('axios');

// 환경 변수에서 Vercel 토큰 가져오기
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN 환경 변수가 설정되지 않았습니다.');
  console.log('다음 명령어로 설정하세요:');
  console.log('export VERCEL_TOKEN="your_token_here"');
  process.exit(1);
}

const BASE_URL = 'https://api.vercel.com/v1';

class SSLTestManager {
  constructor(token) {
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async testSSLCreation(domain) {
    try {
      console.log(`🔒 ${domain}에 대한 SSL 인증서 생성 테스트 중...`);

      const response = await axios.post(
        `${BASE_URL}/domains/${domain}/ssl`,
        {
          forceRenewal: false,
          waitForCompletion: false,
        },
        { headers: this.headers }
      );

      console.log('✅ SSL 인증서 생성 요청 성공!');
      console.log(`   요청 ID: ${response.data.id}`);
      console.log(`   상태: ${response.data.status}`);

      return response.data;
    } catch (error) {
      console.error(
        '❌ SSL 인증서 생성 실패:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async testSSLStatus(domain) {
    try {
      console.log(`🔍 ${domain} SSL 상태 확인 중...`);

      const response = await axios.get(`${BASE_URL}/domains/${domain}/ssl`, {
        headers: this.headers,
      });

      console.log('✅ SSL 상태 확인 성공!');
      console.log(`   도메인: ${response.data.domain}`);
      console.log(`   상태: ${response.data.status}`);
      console.log(`   만료일: ${response.data.expiresAt || 'N/A'}`);

      return response.data;
    } catch (error) {
      console.error(
        '❌ SSL 상태 확인 실패:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async testSSLRenewal(domain) {
    try {
      console.log(`🔄 ${domain} SSL 인증서 갱신 테스트 중...`);

      const response = await axios.post(
        `${BASE_URL}/domains/${domain}/ssl/renew`,
        {},
        { headers: this.headers }
      );

      console.log('✅ SSL 인증서 갱신 요청 성공!');
      console.log(`   요청 ID: ${response.data.id}`);
      console.log(`   상태: ${response.data.status}`);

      return response.data;
    } catch (error) {
      console.error(
        '❌ SSL 인증서 갱신 실패:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async testAllDomains() {
    try {
      console.log('🌐 모든 도메인 SSL 상태 확인 중...');

      const response = await axios.get(`${BASE_URL}/domains`, {
        headers: this.headers,
      });

      console.log('✅ 모든 도메인 확인 성공!');
      console.log(`   총 도메인 수: ${response.data.domains.length}`);

      for (const domain of response.data.domains) {
        console.log(`   - ${domain.name}: ${domain.status || 'N/A'}`);
      }

      return response.data.domains;
    } catch (error) {
      console.error(
        '❌ 모든 도메인 확인 실패:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async runFullTest(domain = 'me1pik.com') {
    console.log('🚀 SSL 인증서 비동기 생성 시스템 전체 테스트 시작\n');

    try {
      // 1. 모든 도메인 확인
      await this.testAllDomains();
      console.log('');

      // 2. 특정 도메인 SSL 상태 확인
      await this.testSSLStatus(domain);
      console.log('');

      // 3. SSL 인증서 생성 테스트 (비동기)
      await this.testSSLCreation(domain);
      console.log('');

      // 4. SSL 인증서 갱신 테스트
      await this.testSSLRenewal(domain);
      console.log('');

      console.log('🎉 모든 테스트가 성공적으로 완료되었습니다!');
    } catch (error) {
      console.error('\n💥 테스트 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }
}

// 메인 실행 함수
async function main() {
  const testManager = new SSLTestManager(VERCEL_TOKEN);

  // 명령행 인수에서 도메인 가져오기
  const domain = process.argv[2] || 'me1pik.com';

  console.log(`🎯 테스트 대상 도메인: ${domain}`);
  console.log(`🔑 Vercel 토큰: ${VERCEL_TOKEN.substring(0, 10)}...`);
  console.log('');

  await testManager.runFullTest(domain);
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SSLTestManager;
