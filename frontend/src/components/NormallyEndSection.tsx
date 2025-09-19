"use client";

const NormallyEndSection = () => {

  return (
    <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
      <section className="space-y-12 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="flex flex-col justify-center text-center items-center">
          <h2 className="text-5xl font-extrabold mb-14 text-white">자원을 투입하였습니다!</h2>
          <p className="text-2xl text-gray-300 mb-10">이용해주셔서 감사합니다.</p>
        </div>
      </section>
    </section>
  );
};

export default NormallyEndSection;
