import Image from 'next/image';

interface ResourceErrorSectionProps {
  message: string;
  onHomeClick?: () => void;
  onRetryClick?: () => void;
}

const ResourceErrorSection: React.FC<ResourceErrorSectionProps> = ({
  message,
  onHomeClick,
  onRetryClick,
}) => {
  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-12 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          {/* 경고 아이콘 */}
          <Image
            src="/error_warning.png"
            width={160}
            height={160}
            alt="warning"
            className="mb-10"
            priority
          />

          {/* 에러 메시지 */}
          <h2 className="text-4xl font-extrabold mb-14 text-red-600">{message}</h2>

          {/* 액션 버튼들 */}
          <div className="flex space-x-8">
            <button
              onClick={onHomeClick}
              className="bg-purple-600 hover:bg-purple-700 px-12 py-6 rounded-2xl text-white font-semibold text-xl transition-all duration-300"
            >
              처음으로
            </button>
            <button
              onClick={onRetryClick}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 px-12 py-6 rounded-2xl text-white font-semibold text-xl transition-all duration-300"
            >
              다시 투입하기
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ResourceErrorSection;