import React, { useState, useEffect } from "react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt fired");
    });
  }, []);
  

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("تم قبول تثبيت التطبيق");
    } else {
      console.log("تم رفض تثبيت التطبيق");
    }
    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {showButton && (
        <button className="btn btn-primary " onClick={handleInstallClick}>
          تثبيت التطبيق على الشاشة الرئيسية
        </button>
      )}
    </>
  );
};

export default InstallButton;
