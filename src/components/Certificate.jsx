import React, { useState } from "react"
import { Modal, IconButton, Box, Backdrop } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import FullscreenIcon from "@mui/icons-material/Fullscreen"

const Certificate = ({ ImgSertif, name, company, description }) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box component="div" sx={{ width: "100%" }}>
      {/* Thumbnail Container — fixed uniform ratio */}
      <Box
        onClick={handleOpen}
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "66.66%", // 3:2 aspect ratio — consistent for all images
          overflow: "hidden",
          borderRadius: "12px",
          cursor: "pointer",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 32px rgba(239,68,68,0.2)",
            borderColor: "rgba(239,68,68,0.4)",
            "& .cert-overlay": {
              opacity: 1,
            },
          },
        }}
      >
        {/* The image always fills the fixed box */}
        <Box
          component="img"
          src={ImgSertif}
          alt={name || "Certificate"}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",       // fills without distortion
            objectPosition: "center",
            display: "block",
          }}
        />

        {/* Hover overlay — "click to view" hint only */}
        <Box
          className="cert-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <FullscreenIcon sx={{ color: "white", fontSize: 36 }} />
          <Box
            component="span"
            sx={{
              color: "white",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            View Certificate
          </Box>
        </Box>
      </Box>

      {/* Modal — full image + details revealed on click */}
      <Modal
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: {
            backgroundColor: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(6px)",
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "95vw", md: "80vw", lg: "70vw" },
            maxWidth: 900,
            maxHeight: "95vh",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#0f0f0f",
            border: "1px solid rgba(239,68,68,0.3)",
            boxShadow: "0 0 60px rgba(239,68,68,0.15)",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              zIndex: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.15)",
              "&:hover": {
                backgroundColor: "rgba(239,68,68,0.3)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Full certificate image */}
          <Box
            component="img"
            src={ImgSertif}
            alt={name || "Certificate Full View"}
            sx={{
              width: "100%",
              maxHeight: "65vh",
              objectFit: "contain",
              background: "#111",
            }}
          />

          {/* Details section — only visible inside modal */}
          {(name || company || description) && (
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                borderTop: "1px solid rgba(255,255,255,0.08)",
                background: "#0a0a0a",
              }}
            >
              {name && (
                <Box
                  component="h3"
                  sx={{
                    m: 0,
                    mb: 0.5,
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    fontWeight: 700,
                    color: "#fca5a5",
                    fontFamily: "monospace",
                    letterSpacing: "0.03em",
                  }}
                >
                  {name}
                </Box>
              )}
              {company && (
                <Box
                  component="p"
                  sx={{
                    m: 0,
                    mb: description ? 1 : 0,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "monospace",
                  }}
                >
                  {company}
                </Box>
              )}
              {description && (
                <Box
                  component="p"
                  sx={{
                    m: 0,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default Certificate
