import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API Routes for Auth and User
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Mock validation
    if (email && password) {
      const isAdmin = email === "mrduoc7979@gmail.com";
      res.json({
        user: {
          uid: isAdmin ? "admin-uid-7979" : "mock-uid-123",
          fullName: isAdmin ? "Admin User" : "Mock User",
          email: email,
          role: isAdmin ? "Admin" : "Customer",
          status: "Active",
          createdAt: new Date().toISOString(),
          isVerified: true
        },
        accessToken: isAdmin ? "mock-admin-token-" + Date.now() : "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now()
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      res.json({
        accessToken: "mock-access-token-refreshed-" + Date.now(),
        refreshToken: "mock-refresh-token-new-" + Date.now()
      });
    } else {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (email) {
      res.json({ message: "Reset link sent to " + email });
    } else {
      res.status(400).json({ message: "Email is required" });
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, code, newPassword } = req.body;
    if (email && code && newPassword) {
      res.json({ message: "Password reset successful" });
    } else {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/user/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      // In a real app, we would decode the token. Here we just mock based on a flag or header if needed.
      // For simplicity, we'll check if the token contains "admin" (which we can set in login)
      const isAdmin = authHeader.includes("admin");
      res.json({
        uid: isAdmin ? "admin-uid-7979" : "mock-uid-123",
        fullName: isAdmin ? "Admin User" : "Mock User",
        email: isAdmin ? "mrduoc7979@gmail.com" : "user@example.com",
        role: isAdmin ? "Admin" : "Customer",
        status: "Active",
        createdAt: new Date().toISOString(),
        isVerified: true,
        voyagerMiles: 1500,
        travelTier: "Silver Voyager"
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
