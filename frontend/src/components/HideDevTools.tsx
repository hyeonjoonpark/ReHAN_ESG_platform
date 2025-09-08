'use client';

import { useEffect } from 'react';

const HideDevTools: React.FC = () => {
  useEffect(() => {
    // 개발 도구 오버레이 숨기기 함수
    const hideDevTools = () => {
      // Next.js 개발 도구 관련 요소들 찾기
      const devToolSelectors = [
        '[data-nextjs-scroll-focus-boundary]',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-dialog]',
        '[data-nextjs-toast]',
        '[data-nextjs-dev-indicator]',
        '.__nextjs_original-stack-frames',
        '.__nextjs_original-stack-frame',
        '.__nextjs_original-stack-frame-file',
        '.__nextjs_original-stack-frame-line',
        '.__nextjs_original-stack-frame-method',
        '.__nextjs_original-stack-frame-args',
        '.__nextjs_original-stack-frame-source',
        '.__nextjs_original-stack-frame-source-file',
        '.__nextjs_original-stack-frame-source-line',
        '.__nextjs_original-stack-frame-source-method',
        '.__nextjs_original-stack-frame-source-args'
      ];

      // 각 선택자에 대해 요소들을 찾아서 숨기기
      devToolSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.display = 'none';
        });
      });

      // 위치 기반으로 개발 도구 찾기 (우측 하단 고정 요소)
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        const style = (div as HTMLElement).style;
        if (
          style.position === 'fixed' &&
          (style.bottom === '0px' || style.bottom === '0') &&
          (style.right === '0px' || style.right === '0')
        ) {
          // 텍스트 내용 확인
          const textContent = div.textContent || '';
          if (
            textContent.includes('Route') ||
            textContent.includes('Static') ||
            textContent.includes('Turbopack') ||
            textContent.includes('Enabled') ||
            textContent.includes('Preferences')
          ) {
            (div as HTMLElement).style.display = 'none';
          }
        }
      });
    };

    // 초기 실행
    hideDevTools();

    // MutationObserver로 DOM 변화 감지
    const observer = new MutationObserver(() => {
      hideDevTools();
    });

    // DOM 변화 감지 시작
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // 정리 함수
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default HideDevTools;
