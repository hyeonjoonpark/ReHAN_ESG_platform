import React from 'react';

const StartSplitBandSections: React.FC = () => {
  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          <h2 className="text-6xl font-extrabold mb-6">띠 분리하기</h2>
          <p className="text-3xl leading-snug">
            페트병의 입구 부분을 <br />
            띠 분리기에 넣어주세요.
          </p>
        </div>
      </section>
    </section>
  );
};

export default StartSplitBandSections; 