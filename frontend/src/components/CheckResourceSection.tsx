const CheckResourceSection = () => {
    return (
        <section className="lg:col-span-2 flex flex-col justify-start space-y-8">
            <section className="space-y-8 bg-gray-800 rounded-2xl p-6 border border-white/20 h-full flex items-center justify-center">
                <div className="flex flex-col justify-center text-center items-center">
                    {/* 점 4개 */}
                    <div className="flex space-x-4 mb-8 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <span key={i} className="w-4 h-4 bg-white rounded-full" />
                        ))}
                    </div>
                    <h2 className="text-6xl font-extrabold">자원을 확인 중</h2>
                </div>
            </section>
    </section>
  );
};

export default CheckResourceSection;