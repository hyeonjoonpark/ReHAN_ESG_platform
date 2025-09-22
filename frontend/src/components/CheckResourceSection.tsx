const CheckResourceSection = () => {
    return (
        <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
            <section className="space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
                <div className="flex flex-col justify-center text-center items-center">
                    {/* 점 4개 */}
                    <div className="flex mb-8 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <span key={i} className="dot w-4 h-4 bg-white rounded-full inline-block" />
                        ))}
                    </div>
                    <style jsx>{`
                      @keyframes dotFade {
                        0%, 20% { opacity: 0; }
                        30%, 50% { opacity: 1; }
                        60%, 100% { opacity: 0; }
                      }
                      .dot {
                        animation: dotFade 1.6s infinite ease-in-out;
                      }
                      .dot:nth-child(2) { animation-delay: 0.3s; }
                      .dot:nth-child(3) { animation-delay: 0.6s; }
                      .dot:nth-child(4) { animation-delay: 0.9s; }
                    `}</style>
                    <h2 className="text-6xl font-extrabold">자원을 확인 중</h2>
                </div>
            </section>
    </section>
  );
};

export default CheckResourceSection;