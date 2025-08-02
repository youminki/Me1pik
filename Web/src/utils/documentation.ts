/**
 * 문서화 유틸리티
 */

interface DocItem {
  name: string;
  description: string;
  type: 'component' | 'hook' | 'utility' | 'api';
  props?: Record<string, string>;
  examples?: string[];
  tags?: string[];
}

interface Documentation {
  components: DocItem[];
  hooks: DocItem[];
  utilities: DocItem[];
  apis: DocItem[];
}

/**
 * 문서화 매니저
 */
class DocumentationManager {
  private docs: Documentation = {
    components: [],
    hooks: [],
    utilities: [],
    apis: [],
  };

  /**
   * 컴포넌트 문서 추가
   */
  addComponent(doc: DocItem) {
    this.docs.components.push({ ...doc, type: 'component' });
  }

  /**
   * 훅 문서 추가
   */
  addHook(doc: DocItem) {
    this.docs.hooks.push({ ...doc, type: 'hook' });
  }

  /**
   * 유틸리티 문서 추가
   */
  addUtility(doc: DocItem) {
    this.docs.utilities.push({ ...doc, type: 'utility' });
  }

  /**
   * API 문서 추가
   */
  addApi(doc: DocItem) {
    this.docs.apis.push({ ...doc, type: 'api' });
  }

  /**
   * 모든 문서 가져오기
   */
  getAllDocs(): Documentation {
    return this.docs;
  }

  /**
   * 타입별 문서 가져오기
   */
  getDocsByType(type: DocItem['type']): DocItem[] {
    return this.docs[`${type}s` as keyof Documentation] || [];
  }

  /**
   * 태그로 문서 검색
   */
  searchByTag(tag: string): DocItem[] {
    return Object.values(this.docs)
      .flat()
      .filter((doc) => doc.tags?.includes(tag));
  }

  /**
   * 이름으로 문서 검색
   */
  searchByName(name: string): DocItem | undefined {
    return Object.values(this.docs)
      .flat()
      .find((doc) => doc.name === name);
  }

  /**
   * 문서를 JSON으로 내보내기
   */
  exportToJSON(): string {
    return JSON.stringify(this.docs, null, 2);
  }

  /**
   * 문서를 Markdown으로 내보내기
   */
  exportToMarkdown(): string {
    let markdown = '# 프로젝트 문서\n\n';

    // 컴포넌트 문서
    if (this.docs.components.length > 0) {
      markdown += '## 컴포넌트\n\n';
      this.docs.components.forEach((component) => {
        markdown += `### ${component.name}\n\n`;
        markdown += `${component.description}\n\n`;

        if (component.props) {
          markdown += '#### Props\n\n';
          Object.entries(component.props).forEach(([key, value]) => {
            markdown += `- \`${key}\`: ${value}\n`;
          });
          markdown += '\n';
        }

        if (component.examples) {
          markdown += '#### 예시\n\n';
          component.examples.forEach((example) => {
            markdown += `\`\`\`tsx\n${example}\n\`\`\`\n\n`;
          });
        }

        if (component.tags) {
          markdown += `**태그**: ${component.tags.join(', ')}\n\n`;
        }
      });
    }

    // 훅 문서
    if (this.docs.hooks.length > 0) {
      markdown += '## 훅\n\n';
      this.docs.hooks.forEach((hook) => {
        markdown += `### ${hook.name}\n\n`;
        markdown += `${hook.description}\n\n`;

        if (hook.examples) {
          markdown += '#### 예시\n\n';
          hook.examples.forEach((example) => {
            markdown += `\`\`\`tsx\n${example}\n\`\`\`\n\n`;
          });
        }

        if (hook.tags) {
          markdown += `**태그**: ${hook.tags.join(', ')}\n\n`;
        }
      });
    }

    // 유틸리티 문서
    if (this.docs.utilities.length > 0) {
      markdown += '## 유틸리티\n\n';
      this.docs.utilities.forEach((utility) => {
        markdown += `### ${utility.name}\n\n`;
        markdown += `${utility.description}\n\n`;

        if (utility.examples) {
          markdown += '#### 예시\n\n';
          utility.examples.forEach((example) => {
            markdown += `\`\`\`ts\n${example}\n\`\`\`\n\n`;
          });
        }

        if (utility.tags) {
          markdown += `**태그**: ${utility.tags.join(', ')}\n\n`;
        }
      });
    }

    return markdown;
  }
}

// 전역 문서화 매니저 인스턴스
export const docManager = new DocumentationManager();

/**
 * 컴포넌트 문서화 데코레이터
 */
export const documentComponent = (doc: Omit<DocItem, 'type'>) => {
  return function <T extends { new (...args: unknown[]): object }>(
    constructor: T
  ) {
    docManager.addComponent({ ...doc, type: 'component' });
    return constructor;
  };
};

/**
 * 훅 문서화 데코레이터
 */
export const documentHook = (doc: Omit<DocItem, 'type'>) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    docManager.addHook({ ...doc, type: 'hook' });
    return descriptor;
  };
};

/**
 * 유틸리티 문서화 데코레이터
 */
export const documentUtility = (doc: Omit<DocItem, 'type'>) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    docManager.addUtility({ ...doc, type: 'utility' });
    return descriptor;
  };
};

/**
 * API 문서화 데코레이터
 */
export const documentApi = (doc: Omit<DocItem, 'type'>) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    docManager.addApi({ ...doc, type: 'api' });
    return descriptor;
  };
};

/**
 * 자동 문서 생성기
 */
export const generateDocs = () => {
  // 컴포넌트 자동 문서화
  const components: DocItem[] = [
    {
      name: 'AccessibleButton',
      description: '접근성을 고려한 버튼 컴포넌트',
      type: 'component',
      props: {
        variant: '버튼 스타일 (primary, secondary, outline)',
        size: '버튼 크기 (small, medium, large)',
        disabled: '비활성화 여부',
        loading: '로딩 상태',
        children: '버튼 내용',
      },
      examples: [
        `<AccessibleButton variant="primary" onClick={handleClick}>
  클릭하세요
</AccessibleButton>`,
      ],
      tags: ['accessibility', 'button', 'ui'],
    },
    {
      name: 'LanguageSelector',
      description: '언어 선택 컴포넌트',
      type: 'component',
      props: {
        variant: '표시 형태 (dropdown, buttons)',
        size: '크기 (small, medium, large)',
        className: '추가 CSS 클래스',
      },
      examples: [`<LanguageSelector variant="dropdown" size="medium" />`],
      tags: ['i18n', 'language', 'ui'],
    },
  ];

  // 훅 자동 문서화
  const hooks: DocItem[] = [
    {
      name: 'useI18n',
      description: '국제화(i18n) 지원 훅',
      type: 'hook',
      examples: [
        `const { t, locale, setLocale } = useI18n();
const translatedText = t('common.loading');`,
      ],
      tags: ['i18n', 'internationalization', 'hook'],
    },
    {
      name: 'useCache',
      description: '메모리 기반 캐시 훅',
      type: 'hook',
      examples: [
        `const cache = useCache();
cache.set('key', data);
const data = cache.get('key');`,
      ],
      tags: ['cache', 'performance', 'hook'],
    },
    {
      name: 'useAsyncState',
      description: '비동기 상태 관리 훅',
      type: 'hook',
      examples: [
        `const { data, loading, error, execute } = useAsyncState(fetchData);
await execute();`,
      ],
      tags: ['async', 'state', 'hook'],
    },
  ];

  // 유틸리티 자동 문서화
  const utilities: DocItem[] = [
    {
      name: 'escapeHtml',
      description: 'XSS 방지를 위한 HTML 이스케이프',
      type: 'utility',
      examples: [
        `const safeHtml = escapeHtml('<script>alert("xss")</script>');`,
      ],
      tags: ['security', 'xss', 'utility'],
    },
    {
      name: 'maskSensitiveData',
      description: '민감한 데이터 마스킹',
      type: 'utility',
      examples: [
        `const maskedEmail = maskSensitiveData('user@example.com', 'email');
// 결과: u***@example.com`,
      ],
      tags: ['security', 'privacy', 'utility'],
    },
    {
      name: 'validateInput',
      description: '입력 데이터 검증',
      type: 'utility',
      examples: [
        `const result = validateInput('test@email.com', {
  required: true,
  pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
});`,
      ],
      tags: ['validation', 'input', 'utility'],
    },
  ];

  // 문서 추가
  components.forEach((component) => docManager.addComponent(component));
  hooks.forEach((hook) => docManager.addHook(hook));
  utilities.forEach((utility) => docManager.addUtility(utility));

  return docManager;
};

/**
 * 문서 내보내기 유틸리티
 */
export const exportDocumentation = {
  toJSON: () => docManager.exportToJSON(),
  toMarkdown: () => docManager.exportToMarkdown(),
  toHTML: () => {
    const markdown = docManager.exportToMarkdown();
    // 간단한 Markdown to HTML 변환
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(
        /```(\w+)\n([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>'
      )
      .replace(/\n/g, '<br>');
  },
};

export default docManager;
