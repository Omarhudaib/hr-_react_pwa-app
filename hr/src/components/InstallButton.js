import React, { useState, useEffect } from "react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt fired");
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser's install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("تم قبول تثبيت التطبيق");
    } else {
      console.log("تم رفض تثبيت التطبيق");
    }

    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {showButton && (
        <button className="btn btn-primary mb-3" onClick={handleInstallClick}>
          تثبيت التطبيق على الشاشة الرئيسية
        </button>
      )}
    </>
  );
};

export default InstallButton;