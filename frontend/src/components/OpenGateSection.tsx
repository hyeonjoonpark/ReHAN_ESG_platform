import React from 'react';

const OpenGateSection: React.FC = () => {
  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          <h2 className="text-6xl font-extrabold mb-6 text-green-500">투입구가 열렸어요!</h2>
          <p className="text-3xl leading-snug text-green-500 dark:text-white">
            띠가 분리된 페트병 하나만<br />
            투입구에 넣어주세요.
          </p>
        </div>
      </section>
    </section>
  );
};

export default OpenGateSection;