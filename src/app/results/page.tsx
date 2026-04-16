import DebtList from "@/component/DebtList";

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center px-4 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Borç Listesi</h1>
        <p className="text-white/50 text-sm">
          Aşağıdaki borçları seçerek ödeme yapabilirsiniz.
        </p>
      </div>

      <DebtList />
    </div>
  );
}
