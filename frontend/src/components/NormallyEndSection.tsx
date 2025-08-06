"use client";

const NormallyEndSection = ({ onHomeClick }: { onHomeClick: () => void }) => {

  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-12 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          <h2 className="text-5xl font-extrabold mb-14 text-white">정상적으로 배출되었습니다!</h2>
          <p className="text-2xl text-gray-300 mb-10">이용해주셔서 감사합니다.</p>
          <button
              onClick={onHomeClick}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-blue-600 hover:to-cyan-600 px-12 py-6 rounded-2xl text-white font-semibold text-xl transition-all duration-300"
            >
              처음으로
            </button>
        </div>
      </section>
    </section>
  );
};

export default NormallyEndSection;
