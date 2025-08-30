import { Box, Stack, Button, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function MediaFeed() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",        // 👈 ocupa todo el alto del padre
        overflowY: "auto",     // 👈 activa scroll si se pasa
      }}
    >
      {/* Título */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{  mb: 1, textAlign: "center", flexShrink: 0 }}
      >
        Redes sociales
      </Typography>

      {/* Botones */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ flexShrink: 0 }}
      >
        {/* Facebook */}
        {/* <Button
          onClick={() =>
            window.open(
              "https://facebook.com/veloelmono",
              "_blank",
              "width=800,height=600"
            )
          }
          startIcon={<FacebookIcon />}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Facebook
        </Button> */}

        {/* WhatsApp */}
        <Button
          onClick={() =>
            window.open(
              "https://wa.me/573215098953?text=Hola,%20tengo%20una%20duda",
              "_blank"
            )
          }
          startIcon={<WhatsAppIcon />}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#25D366",
            "&:hover": { bgcolor: "#1ebe5d" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          WhatsApp
        </Button>

        {/* Instagram */}
        <Button
          onClick={() => window.open("https://instagram.com/veloelmono", "_blank")}
          startIcon={<InstagramIcon />}
          variant="contained"
          fullWidth
          sx={{
            background:
              "linear-gradient(90deg,#F58529 0%,#DD2A7B 40%,#8134AF 70%,#515BD4 100%)",
            "&:hover": { opacity: 0.9 },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Instagram
        </Button>
      </Stack>
    </Box>
  );
}
