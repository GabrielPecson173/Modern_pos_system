import { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Alert,
  Box,
  Stack,
} from "@mantine/core";
import { IconAlertCircle, IconDroplet } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [emailError, setEmailError]           = useState<string | null>(null);
  const [passwordError, setPasswordError]     = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem("access_token");
    const user  = localStorage.getItem("user");
    if (token && user) {
      const parsed = JSON.parse(user);
      redirectByRole(parsed.role);
    }
  }, []);

  function redirectByRole(role: string) {
    if (role === "admin")            navigate("/dashboard");
    else if (role === "water_employee")   navigate("/water");
    else if (role === "laundry_employee") navigate("/laundry");
    else navigate("/");
  }

  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleLogin() {
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token",  data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user",          JSON.stringify(data.user));
        redirectByRole(data.user?.role);
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      style={{
        minHeight:       "100vh",
        background:      "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 40%, #e8f5e9 100%)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        fontFamily:      "'DM Sans', sans-serif",
      }}
    >
      {/* Google Font import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        .login-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 40px rgba(0,120,120,0.10), 0 1.5px 8px rgba(0,0,0,0.06);
        }

        .login-icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00897b, #26c6da);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 4px 18px rgba(0,137,123,0.25);
        }

        .login-title {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #00695c;
          text-align: center;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          text-align: center;
          color: #78909c;
          font-size: 13px;
          margin-bottom: 32px;
          font-weight: 400;
        }

        .login-card .mantine-TextInput-label,
        .login-card .mantine-PasswordInput-label {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: #37474f;
          margin-bottom: 4px;
        }

        .login-card .mantine-TextInput-input,
        .login-card .mantine-PasswordInput-input {
          font-family: 'DM Sans', sans-serif;
          border-radius: 10px;
          border: 1.5px solid #cfd8dc;
          background: rgba(255,255,255,0.85);
          transition: border-color 0.2s;
        }

        .login-card .mantine-TextInput-input:focus,
        .login-card .mantine-PasswordInput-input:focus {
          border-color: #00897b;
          box-shadow: 0 0 0 2px rgba(0,137,123,0.12);
        }

        .login-btn {
          border-radius: 10px !important;
          font-family: 'DM Sans', sans-serif !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          letter-spacing: 0.2px;
          background: linear-gradient(135deg, #00897b, #26c6da) !important;
          border: none !important;
          height: 44px;
          margin-top: 28px;
          transition: opacity 0.2s, transform 0.15s !important;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <div className="login-card">
        {/* Icon */}
        <div className="login-icon-ring">
          <IconDroplet size={30} color="white" fill="white" />
        </div>

        <h1 className="login-title">Flumen</h1>
        <p className="login-subtitle">Point of Sale System</p>

        {error && (
          <Alert
            icon={<IconAlertCircle size={15} />}
            color="red"
            variant="light"
            mb="md"
            radius="md"
            styles={{ message: { fontFamily: "'DM Sans', sans-serif", fontSize: 13 } }}
          >
            {error}
          </Alert>
        )}

        <Stack gap="sm">
          <TextInput
            label="Email"
            placeholder="you@aquacrystal.com"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              setError(null);
              if (e.currentTarget.value.trim()) setEmailError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            error={emailError}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.currentTarget.value);
              setError(null);
              if (e.currentTarget.value.trim()) setPasswordError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            error={passwordError}
            required
          />
        </Stack>

        <Button
          fullWidth
          className="login-btn"
          onClick={handleLogin}
          loading={loading}
        >
          Sign in
        </Button>

        <Text ta="center" size="xs" c="dimmed" mt="xl">
          Aqua Crystal © {new Date().getFullYear()}
        </Text>
      </div>
    </Box>
  );
}
