import React, { useState } from 'react';
import '../css/login.css';
import logo from '../images/logo.png';
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  Alert,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Assuming Firebase is used
import { auth } from "../config/Config"; // Import your Firebase config here

const providers = [{ id: 'credentials', name: 'Email and Password' }];

function CustomEmailField({ email, setEmail }) {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Email"
      name="email"
      type="email"
      size="small"
      required
      fullWidth
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AccountCircle fontSize="inherit" />
          </InputAdornment>
        ),
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField({ password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        size="small"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('User Logged In Successfully!!', {
        position: 'top-center',
      });
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-center',
      });
    }
  };

  return (
    <div className="login-container">
  {/* Left Section */}
  <div className="login-left">
    <div className="logo-container">
      <img src={logo} alt="Yalla Shop Logo" className="login-logo" />
      <p className="login-slogan">" Where Shopping is as Easy as Saying Yalla! "</p>
    </div>
  </div>

  {/* Right Section */}
  <div className="login-right">
    <h2 className="login-title">Login</h2>
    <form onSubmit={handleLogin}>
      <CustomEmailField email={email} setEmail={setEmail} />
      <CustomPasswordField password={password} setPassword={setPassword} />
      <Button
        type="submit"
        variant="outlined"
        color="info"
        size="small"
        disableElevation
        fullWidth
        sx={{ my: 2 }}
      >
        Log In
      </Button>
    </form>
    <div className="login-links">
      <Link href="/signup" variant="body2">
        Sign up
      </Link>
    </div>
  </div>
</div>
  );
}

export default Login;
