import { useState } from 'react';

const HelpTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      {/* 도움말 버튼 */}
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
        aria-label="도움말"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* 툴팁 */}
      {isVisible && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                ⌨️ 키보드 단축키
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">굵게</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    Cmd+B
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">기울임</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    Cmd+I
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">취소선</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    Cmd+Shift+X
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">실행 취소</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    Cmd+Z
                  </kbd>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                📝 마크다운
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">제목 1</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    # Space
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">제목 2</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    ## Space
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">리스트</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    - Space
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">번호 리스트</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    1. Space
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">인용</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    &gt; Space
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">코드 블록</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                    ``` Space
                  </code>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                💡 팁
              </h4>
              <div className="space-y-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <p>🎨 **굵게**, *기울임*, ~~취소선~~ 마크다운 지원</p>
                <p>📋 [링크](url) 형식으로 링크를 추가할 수 있어요</p>
                <p>⚡ 인라인 코드는 `backtick`으로 감싸세요</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
