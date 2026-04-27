import QueryForm from "@/component/QueryForm";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          VodafoneNet Borç ve Alacak Sorgulama
        </h1>
        <p className="text-white/60 text-lg max-w-md mx-auto">
          TC Kimlik numaranız ve kimlik bilgilerinizle borçlarınızı sorgulayın ve güvenle ödeyin.
        </p>
      </div>

      <QueryForm />
    </div>
  );
}
