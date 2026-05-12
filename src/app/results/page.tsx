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

      <div className="w-full max-w-4xl mt-8 px-4">
        <p className="text-white/35 text-xs leading-relaxed text-justify">
          İş bu tutarın hesaplanmasında Vodafone Net İletişim Hizmetleri A.Ş&apos;nin sistemlerinde
          sorgulamanın yapıldığı tarih itibari ile kayıtlı olan ödenmemiş faturalar ve icra masrafları
          esas alınmıştır. Eğer varsa henüz tahakkuk etmemiş faturalarınız ile icra ve gecikme
          bedelleriniz ödeme tarihinde söz konusu borç tutarına ilave edilecektir. Bu nedenle yukarıda
          görüntülenen tutar, borcun ödeneceği tarihe göre farklılık gösterebilir. Alacak olarak
          görmüş olduğunuz tutar ise, bir sonraki faturanızın tahakkuku sırasında fatura bedelinizden
          indirilecek olan tutarı ifade etmektedir. Borçlarınızı nasıl ödeyeceğinizi ve alacaklarınızı
          nasıl tahsil edeceğinizi öğrenmek için lütfen aşağıdaki linke tıklayınız.
        </p>
      </div>
    </div>
  );
}
