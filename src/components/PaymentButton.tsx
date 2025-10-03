// src/components/PaymentButton.tsx
import React, { useState } from "react";

interface PaymentButtonProps {
  amount: number;
  backendUrl: string; // Örn: https://pihealth360-backend-v2.fly.dev
  receiver?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, backendUrl, receiver }) => {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);
    try {
      if (!(window as any).Pi) {
        throw new Error("Pi SDK yüklenmemiş. Pi Browser'da açmayı dene.");
      }

      // ✅ Kullanıcıyı doğrula ve backend session oluştur
      const scopes = ["username", "payments"];
      const authResult = await (window as any).Pi.authenticate(scopes);

      if (!authResult?.accessToken) {
        alert("Cüzdan bağlantısı alınamadı!");
        return;
      }

      const verifyRes = await fetch(`${backendUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: authResult.accessToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData?.success) {
        alert("Kullanıcı doğrulanamadı!");
        return;
      }

      const userId = verifyData.user.uid;

      // ✅ Ödeme başlat
      (window as any).Pi.createPayment(
        {
          amount,
          memo: "PiHealth360 Ödemesi",
          metadata: { receiver: receiver || "TestReceiver", userId },
        },
        {
          // Onay için backend
          onReadyForServerApproval: async (paymentId: string) => {
            console.log("Backend approve çağrılıyor:", paymentId);
            await fetch(`${backendUrl}/approve`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
              credentials: "include", // session cookie gönderimi
            });
          },

          // Tamamlama için backend
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log("Backend complete çağrılıyor:", paymentId, txid);
            await fetch(`${backendUrl}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
              credentials: "include",
            });
          },

          onCancel: (paymentId: string) => {
            console.log("Ödeme iptal edildi:", paymentId);
          },

          onError: (error: any, paymentId: string) => {
            console.error("Ödeme hatası:", error, paymentId);
            alert("Ödeme sırasında hata oluştu: " + error?.message);
          },
        }
      );
    } catch (err) {
      console.error("Payment error:", err);
      alert("Sunucu hatası: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startPayment}
      disabled={loading}
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      {loading ? "Ödeme İşleniyor..." : `Öde ${amount} Pi`}
    </button>
  );
};

export default PaymentButton;