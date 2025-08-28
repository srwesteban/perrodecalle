// NequiPopup.tsx
import { Dialog, Alert, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { createPortal } from "react-dom";
import qr from "../assets/img/qrnequi.png";
import logonequi from "../assets/img/logonequi.png";

export default function NequiPopup() {
  const [open, setOpen] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);

  const phone = "3215098953";
  const deeplinkMobile = `nequi://app`;
  const nequiWeb = `https://transacciones.nequi.com/bdigital/login.jsp`;

  const handleShowAlert = () => {
    navigator.clipboard.writeText(phone).catch(() => {
      console.warn("No se pudo copiar el número");
    });

    setShowAlert1(true);

    setTimeout(() => {
      setShowAlert1(false);
      setShowAlert2(true);

      setTimeout(() => {
        setShowAlert2(false);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = deeplinkMobile;
        } else {
          window.open(nequiWeb, "_blank");
        }
      }, 2000);
    }, 2000);
  };

  // 🚀 Alertas flotantes
  const AlertOverlay1 = showAlert1
    ? createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-lg">
          <Alert
            icon={<SmartphoneIcon fontSize="large" />}
            severity="info"
            variant="filled"
            sx={{
              fontSize: { xs: "1rem", sm: "1.3rem" },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            Abriendo Nequi...
          </Alert>
        </div>,
        document.body
      )
    : null;

  const AlertOverlay2 = showAlert2
    ? createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-lg">
          <Alert
            icon={<CheckCircleIcon fontSize="large" />}
            severity="success"
            variant="filled"
            sx={{
              fontSize: { xs: "1rem", sm: "1.3rem" },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            Número copiado en portapapeles
          </Alert>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* ⚠️ Nota con botón */}
      <div
        className="
          col-span-2 mt-2 px-3 py-3
          text-sm sm:text-base leading-snug
          text-yellow-200 font-medium
          bg-yellow-900/30 rounded-lg
          flex gap-3 text-left
        "
      >
        {/* Columna izquierda: Icono */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <WarningAmberIcon fontSize="large" className="text-yellow-200" />
        </div>

        {/* Columna derecha: Texto */}
        <div className="flex-1">
          Nota: A veces <span className="font-semibold">Nequi</span> puede
          presentar fallas. Si ocurre, intenta con otro medio de pago
          disponible. También puedes hacerlo por QR{" "}
          <button
            onClick={() => setOpen(true)}
            className="
              underline underline-offset-4 decoration-yellow-300 hover:decoration-yellow-200
              text-yellow-100 hover:text-white transition font-semibold
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded
            "
          >
            aquí
          </button>
        </div>
      </div>

      {/* Popup pantalla completa */}
      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          style: {
            background: "rgba(0,0,0,0.92)",
            color: "white",
            position: "relative",
          },
        }}
      >
        {/* Contenedor en grid con 4 filas */}
        <div className="w-full h-full grid grid-rows-[auto,1fr,auto,auto] px-4 sm:px-6 py-4 sm:py-8 gap-4 sm:gap-6 text-center">
          {/* 🟢 Primera fila: Botón cerrar */}
          <div className="flex justify-end p-0">
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: "white",
                mt: { xs: 1, sm: 2 }, // menos alto (margen top pequeño)
                mr: { xs: 3, sm: 4 }, // lo mueve un poco hacia la izquierda
                mb: { xs: 0 },
                p: { xs: 0 }, // reduce padding interno → menos alto
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 34, sm: 42 } }} />{" "}
              {/* X más grande */}
            </IconButton>
          </div>

          {/* 🟢 Segunda fila: Contenido principal */}
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
            {/* Título con logo */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Typography
                component="h1"
                fontWeight="bold"
                sx={{ fontSize: { xs: "2rem", sm: "3rem", md: "3.2rem" } }}
              >
                Pagos Nequi
              </Typography>
              <img
                src={logonequi}
                alt="Logo Nequi"
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
            </div>

            {/* QR protagonista */}
            <img
              src={qr}
              alt="QR para donar"
              className="w-[95%] max-w-sm sm:max-w-md lg:max-w-lg rounded-3xl shadow-2xl border-4 border-white/20"
            />

            {/* Texto con icono */}

            <div
              className="
          col-span-2 mt-2 px-3 py-3
          text-sm sm:text-base leading-snug
          text-black font-medium
          bg-[#3CC0CD] rounded-lg
          flex gap-3 text-left
        "
            >
              <div />
              <div className="flex-shrink-0 flex items-center justify-center">
                <SmartphoneIcon className="text-[#1B0221]" fontSize="large" />
              </div>

              <div className="flex-1">
                Si estás en computador escanea el QR desde tu app móvil de{" "}
                <b>Nequi</b> o copia el número y haz tu donación desde cualquier
                plataforma Nequi.
              </div>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-3 max-w-lg mx-auto">
              {/* Columna izquierda: Icono */}
              <div className="flex items-center justify-center"></div>

              {/* Columna derecha: Texto */}
              <div className="text-gray-200 leading-relaxed text-sm sm:text-base text-left"></div>
            </div>

            {/* Número destacado */}
            <Typography
              fontWeight="bold"
              className="text-emerald-300 tracking-wide font-mono"
              sx={{ fontSize: { xs: "1.6rem", sm: "2.2rem", md: "2.5rem" } }}
            >
              {phone}
            </Typography>

            {/* Botón acción */}
            <Button
              onClick={handleShowAlert}
              variant="contained"
              color="primary"
              startIcon={<ContentCopyIcon />}
              sx={{
                borderRadius: "16px",
                px: { xs: 4, sm: 6 },
                py: { xs: 1.2, sm: 2 },
                textTransform: "none",
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: "700",
              }}
            >
              Copiar número y abrir Nequi
            </Button>
          </div>

          {/* 🟢 Tercera fila: Info extra */}
          <div className="text-sm sm:text-base text-red-300 bg-red-900/40 px-4 sm:px-6 py-2 rounded-lg max-w-lg mx-auto flex items-center gap-2 sm:gap-3">
            <WarningAmberIcon fontSize="large" />
            <span>
              Si el pago es por tu aplicación puede tardar hasta 24h en
              reflejarse en la página.
            </span>
          </div>

          {/* 🟢 Cuarta fila: vacía para respiro */}
          <div className="h-6 sm:h-10" />
        </div>
      </Dialog>

      {/* 🚀 Alertas */}
      {AlertOverlay1}
      {AlertOverlay2}
    </>
  );
}
